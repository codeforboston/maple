# Every record of mapletestimony.org, keyed "<relative name> <type>" ("@" is
# the apex). The inventory of record is the Squarespace DNS panel — dig
# cannot enumerate a zone by name. TTLs are kept as served so the pre-cutover
# diff (README step 3) is byte for byte. Nothing is dropped in the move: `api`
# (the dormant Linode chart under infra/app) stays until its removal is its
# own change.
#
# INCOMPLETE — DO NOT CUT OVER ON THIS FILE ALONE. verify.py (README step
# 3) fails until every name the live zone serves is here; today it lists
# CNAMEs, by NSEC3 hash, that are not. Read them off the Squarespace panel in
# README step 1 and add them. They look like SendGrid's numeric `em<n>`/
# `url<n>` link-branding hosts for the `u32856346.wl097.sendgrid.net` account
# the DKIM CNAMEs below point at.
#
# The apex NS and SOA are absent because Cloud DNS creates and owns them.
#
# Cloud DNS wants TXT rrdatas quoted, and one quoted string is at most 255
# bytes; the DKIM key keeps the two strings the live zone serves.
locals {
  zone = "mapletestimony.org."

  records = {
    # Vercel (the Next.js frontend); www is Vercel's CNAME target, not a delegation.
    "@ A"       = { ttl = 14400, rrdatas = ["76.76.21.21"] }
    "www CNAME" = { ttl = 14400, rrdatas = ["cname.vercel-dns.com."] }

    # Mail: Mailgun. MX + SPF + DKIM + DMARC must survive the move intact; a
    # missing DKIM does not fail loudly, it just stops mail authenticating.
    "@ MX" = { ttl = 14400, rrdatas = ["10 mxa.mailgun.org.", "10 mxb.mailgun.org."] }
    "@ TXT" = { ttl = 14400, rrdatas = [
      "\"v=spf1 include:mailgun.org ~all\"",
      "\"google-site-verification=nNS-XwISe1mEYUkFjO_dqudsCrg4BTpMHAIOkolvhY4\"",
    ] }
    "_dmarc TXT" = { ttl = 14400, rrdatas = ["\"v=DMARC1; p=none;\""] }
    "smtp._domainkey TXT" = { ttl = 14400, rrdatas = [
      "\"k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlCCejmxwqxm/xrJqcZorDDALZrXaiOPxwklMt7K3G29Oga9Cf9ySN5/8ZofvQE6cVQpgGnhdnXmO6a/lImAtAEtPfVmnxJPL2mWnj5m0FPc0eFCwsMdSBnAIl4ei8ToIUBaGMpLrIK+q7I4xm0sPaPhqp\" \"C1767TChZNXjfU+IcwIDAQAB\"",
    ] }

    # SendGrid domain authentication. Same failure mode as the Mailgun DKIM
    # above: drop these and SendGrid mail still sends, unsigned.
    "s1._domainkey CNAME" = { ttl = 14400, rrdatas = ["s1.domainkey.u32856346.wl097.sendgrid.net."] }
    "s2._domainkey CNAME" = { ttl = 14400, rrdatas = ["s2.domainkey.u32856346.wl097.sendgrid.net."] }

    # Firebase's custom mail domain, mail.mapletestimony.org: its own SPF, the
    # project verification token, and the two DKIM CNAMEs beneath it. This is
    # the envelope domain for password resets and digest mail.
    "mail TXT" = { ttl = 14400, rrdatas = [
      "\"v=spf1 include:_spf.firebasemail.com ~all\"",
      "\"firebase=digital-testimony-prod\"",
    ] }
    "firebase1._domainkey.mail CNAME" = { ttl = 14400, rrdatas = ["mail-mail-mapletestimony-org.dkim1._domainkey.firebasemail.com."] }
    "firebase2._domainkey.mail CNAME" = { ttl = 14400, rrdatas = ["mail-mail-mapletestimony-org.dkim2._domainkey.firebasemail.com."] }

    # Linode host of the dormant k8s chart (infra/app). Kept as is.
    "api A" = { ttl = 14400, rrdatas = ["170.187.161.99"] }
  }
}

resource "google_dns_record_set" "all" {
  for_each = local.records

  managed_zone = google_dns_managed_zone.root.name
  name         = split(" ", each.key)[0] == "@" ? local.zone : "${split(" ", each.key)[0]}.${local.zone}"
  type         = split(" ", each.key)[1]
  ttl          = each.value.ttl
  rrdatas      = each.value.rrdatas
}
