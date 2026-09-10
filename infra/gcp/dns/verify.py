#!/usr/bin/env python3
"""Pre-cutover check for mapletestimony.org (README step 3).

    verify.py NEW_NS

Exit 0 means the Cloud DNS zone behind NEW_NS serves exactly what the old
zone serves, and it is safe to go on to step 4. Two checks:

1. Every "<name> <type>" key in records.tf is queried at both servers and the
   answers must match byte for byte, TTL included.

2. The old zone is NSEC3-signed with opt-out off, so its hash chain is a full
   census of its owner names and the types at each. The chain is walked to
   closure and every link must correspond to a name and type set in
   records.tf. This is what proves records.tf is complete: a name never copied
   out of the Squarespace panel is never queried by check 1, so it would diff
   clean right up to the moment step 5 turns it into NXDOMAIN.

Needs dig and python3; no third-party modules.
"""

import base64
import hashlib
import re
import secrets
import subprocess
import sys
from pathlib import Path

ZONE = "mapletestimony.org."
OLD_NS = "ns-cloud-e1.googledomains.com"
RECORDS_TF = Path(__file__).with_name("records.tf")

# Types the signer or the zone provider owns; never in records.tf.
SIGNER_TYPES = {"RRSIG", "DNSKEY", "NSEC3PARAM", "CDS", "CDNSKEY"}
APEX_PROVIDER_TYPES = {"NS", "SOA"}

# Base32 (RFC 4648 §6) to base32hex (§7), which NSEC3 owner names use.
_B32_TO_HEX = str.maketrans(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", "0123456789ABCDEFGHIJKLMNOPQRSTUV"
)


def dig(ns, name, rtype, *flags):
    cmd = ["dig", "+norecurse", "+time=5", "+tries=2", *flags, f"@{ns}", name, rtype]
    out = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if out.returncode != 0:
        sys.exit(f"dig failed ({out.returncode}): {' '.join(cmd)}\n{out.stderr}")
    return out.stdout


def load_records():
    """{fqdn: {types}} for every key in records.tf, plus every ancestor down
    to the apex (the empty non-terminals, with no types of their own)."""
    keys = re.findall(r'^\s*"([^"\s]+) ([A-Z0-9]+)"\s*=', RECORDS_TF.read_text(), re.M)
    if not keys:
        sys.exit(f"no '<name> <type>' keys found in {RECORDS_TF}")
    expected = {ZONE: set()}
    for rel, rtype in keys:
        labels = rel.split(".")
        expected.setdefault(f"{rel}.{ZONE}" if rel != "@" else ZONE, set()).add(rtype)
        for i in range(1, len(labels)):
            expected.setdefault(f"{'.'.join(labels[i:])}.{ZONE}", set())
    return expected


def check_authoritative(ns):
    flags = re.search(r"^;; flags: ([^;]*);", dig(ns, ZONE, "SOA"), re.M)
    if not flags or "aa" not in flags.group(1).split():
        sys.exit(f"FAIL {ns} is not authoritative for {ZONE}")


def answers(ns, name, rtype):
    lines = dig(ns, name, rtype, "+noall", "+answer").splitlines()
    return sorted(" ".join(l.split()) for l in lines if l.strip())


def check_records(new_ns, expected):
    total = failures = 0
    for name, types in expected.items():
        for rtype in sorted(types):
            total += 1
            new, old = answers(new_ns, name, rtype), answers(OLD_NS, name, rtype)
            if new == old:
                continue
            failures += 1
            print(f"FAIL {name} {rtype} differs")
            for label, ns, ans in (("new", new_ns, new), ("old", OLD_NS, old)):
                print(f"  {label} @{ns}:")
                for line in ans or ["(no answer)"]:
                    print(f"    {line}")
    print(f"{'FAIL' if failures else 'ok  '} {total} records in records.tf: "
          f"{total - failures} identical at both servers, {failures} differ")
    return failures == 0


def nsec3_hash(name, salt, iterations):
    wire = b"".join(bytes([len(l)]) + l.encode().lower() for l in name.rstrip(".").split(".")) + b"\x00"
    digest = hashlib.sha1(wire + salt).digest()
    for _ in range(iterations):
        digest = hashlib.sha1(digest + salt).digest()
    return base64.b32encode(digest).decode().translate(_B32_TO_HEX)


def walk_chain():
    """Return ({owner_hash: (next_hash, {types})}, (salt, iterations)) for the
    old zone's whole NSEC3 chain. A query for a name whose hash falls in a gap
    the chain does not yet cover returns the link covering that gap, so after
    one query to learn the hash parameters, the walk picks such names by
    hashing candidates locally."""
    links, params = {}, None

    def covered(h):
        return any(owner < h < nxt or (owner > nxt and (h > owner or h < nxt))
                   for owner, (nxt, _) in links.items())

    def query(label):
        nonlocal params
        for line in dig(OLD_NS, f"{label}.{ZONE}", "A", "+dnssec", "+noall", "+authority").splitlines():
            f = line.split()
            if len(f) < 9 or f[3] != "NSEC3":
                continue
            alg, flags, iterations, salt, nxt, types = f[4], f[5], int(f[6]), f[7], f[8].upper(), set(f[9:])
            if alg != "1" or flags != "0":
                sys.exit(f"FAIL {OLD_NS} NSEC3 is not SHA-1 with opt-out off "
                         f"(alg {alg}, flags {flags}); the chain is not a census")
            params = (b"" if salt == "-" else bytes.fromhex(salt), iterations)
            links.setdefault(f[0].split(".")[0].upper(), (nxt, types))

    query(secrets.token_hex(6))
    while not all(nxt in links for nxt, _ in links.values()):
        for _ in range(100_000):
            label = secrets.token_hex(6)
            if not covered(nsec3_hash(f"{label}.{ZONE}", *params)):
                break
        else:
            sys.exit("FAIL could not find a name in an uncovered NSEC3 gap")
        before = len(links)
        query(label)
        if len(links) == before:
            sys.exit(f"FAIL {OLD_NS} returned no new NSEC3 link for {label}.{ZONE}; "
                     f"chain has {before} links and is not closed")
    return links, params


def check_census(expected):
    links, params = walk_chain()
    by_hash = {nsec3_hash(name, *params): name for name in expected}
    failures = 0
    for owner, (_, types) in sorted(links.items()):
        name = by_hash.get(owner)
        if name is None:
            failures += 1
            print(f"FAIL live zone has an owner name not in records.tf: NSEC3 hash {owner}, "
                  f"types {' '.join(sorted(types - SIGNER_TYPES)) or '(none)'}")
            continue
        live = types - SIGNER_TYPES - (APEX_PROVIDER_TYPES if name == ZONE else set())
        for rtype in sorted(live - expected[name]):
            failures += 1
            print(f"FAIL live zone has {name} {rtype}, records.tf does not")
        for rtype in sorted(expected[name] - live):
            failures += 1
            print(f"FAIL records.tf has {name} {rtype}, live zone does not")
    for h, name in by_hash.items():
        if h not in links:
            failures += 1
            print(f"FAIL records.tf names {name}, which the live zone does not have")
    print(f"{'FAIL' if failures else 'ok  '} {len(links)} owner names in the live zone's NSEC3 chain, "
          f"{len(expected)} in records.tf (including empty non-terminals), {failures} mismatches")
    return failures == 0


def main(argv):
    if len(argv) != 2 or argv[1].startswith("-"):
        sys.exit(__doc__)
    new_ns = argv[1]
    expected = load_records()
    check_authoritative(new_ns)
    check_authoritative(OLD_NS)
    ok = check_records(new_ns, expected)
    ok = check_census(expected) and ok
    print("PASS: safe to continue to step 4" if ok else "FAIL: fix records.tf, apply, rerun")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
