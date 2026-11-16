# OCPF Member Matching and Finance Scraper Backfill

This guide explains how to run member matching to connect legislator member IDs with their OCPF IDs, and how to run the finance scraper for previous courts.

## Prerequisites

- Node.js / yarn installed (`yarn install` to get all deps including `@swc/core`)
- For local: Firebase emulators running (yarn emulators:start)
- For `dev` / `prod`: a Google service account key, either in `GOOGLE_APPLICATION_CREDENTIALS` or passed via `--creds <path>`

## Member matching for previous courts

The `backfillOcpfMemberMapping` script uses OCPF (Office of Campaign and Political Finance) filers information to look for the OCPF ID for each member of a given court. It stores the matches in Firestore, `/generalCourts/<COURT_NUMBER>/ocpfMemberMappingConfig/ocpfMemberMapping`, and the members it couldn't match in `/generalCourts/<COURT_NUMBER>/ocpfMemberMappingConfig/ocpfMemberMappingFlags`. The flagged member matches need to be resolved manually.

### Running automatic matching

```sh
# Specify a court
yarn firebase-admin run-script backfillOcpfMemberMapping --env dev --courts specified_court

# Run for multiple courts
yarn firebase-admin run-script backfillOcpfMemberMapping --env dev --courts court1,court2,court3   # no space

# To include full details in output, including candidates for ambiguous cases where multiple possible matches were found
yarn firebase-admin run-script backfillOcpfMemberMapping --env dev --courts specified_court --verbose
```

### Manual matching

Cases that could not be automatically matched have to be resolved manually.

Steps:

- Look in Firestore for list of members needing manual resolution; ambiguous cases (multiple possible matches) and unmatched cases (no match found):
  `/generalCourts/<COURT_NUMBER>/ocpfMemberMappingConfig/ocpfMemberMappingFlags`.
- Find candidate matches for ambiguous cases in output from `--verbose` run of `backfillOcpfMemberMapping`. Some of these will be easy to resolve. (e.g., Tommy Vitolo and Thomas J. Vitolo)
- For ones that are still ambiguous, download the "Filer Database" zip file from OCPF [here](https://ocpf.us/Data/Downloads), and search for the name in all_filers.txt and candidates.txt
- After resolving a match (i.e., have an OCPF ID for a given member ID), run:
  ```sh
  yarn firebase-admin run-script setOcpfMemberMapping --env dev --court court_number --memberCode member_ID --cpfId OCPF_ID
  ```
- Confirm match entered successfully in Firestore:
  `/generalCourts/<COURT_NUMBER>/ocpfMemberMappingConfig/ocpfMemberMapping/`

NOTES:

- A member of a given court who later switched chambers or changed their last name will come up unmatched or ambiguous, since filers are listed in OCPF with current name and court.
  Example: Court 192: Alyson M. Sullivan. Not found in OCPF filers (actually, ambiguous since there are other Sullivans) because by court 193, she changed her name to Alyson M. Sullivan-Almeida. OCPF filers list is one list across time, so a name change (or office change), will mean the person isn’t found for the older court under their original name/office.
- Manually resolved matches are marked as such in Firestore `ocpfMemberMapping`, and will be preserved upon future runs of `backfillOcpfMemberMapping`.

## Finance scraper for previous courts

`backfillOcpfFinance` gets campaign finance data for the legislators of a given court from OCPF, and saves it to Firestore, `/generalCourts/<COURT_NUMBER>/membersFinance`

```sh
# Specify court number
yarn firebase-admin run-script backfillOcpfFinance --env dev --courts specified_court

# Run for multiple courts
yarn firebase-admin run-script backfillOcpfFinance --env dev --courts court1,court2,court3   # no space
```
