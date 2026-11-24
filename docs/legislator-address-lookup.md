# Finding legislators by address

Above the Representative and Senator pickers (Edit Profile, and the "Select Your Legislators" step of submitting testimony), a user can type their home address and have both pickers filled in. The pickers stay available for choosing by hand. The code is in [components/legislatorLookup/](../components/legislatorLookup/) and is behind the `legislatorAddressLookup` feature flag.

## How it works

Everything runs in the browser. The address goes to MassGIS, the state's mapping office, and never to MAPLE's servers; nothing about it is saved.

1. **Geocode.** The address is sent to MassGIS's statewide geocoder ([`findAddressCandidates`](https://arcgisserver.digital.mass.gov/arcgisserver/rest/services/MassGISStatewideGeocodeService/GeocodeServer)), which is built on the [statewide address points](https://www.mass.gov/info-details/massgis-data-master-address-data-statewide-address-points-for-geocoding).
2. **Pick a match** (`decideCandidate` in `lookup.ts`). Only matches precise enough to fall in one district count (`PointAddress`, `Subaddress`, `StreetAddress`). Then:
   - Candidates in the town, Boston neighborhood or ZIP code the user typed are preferred. This matters because the geocoder treats a town that shares its county's name (Worcester, Plymouth, Barnstable, Franklin, …) as matching every town in that county at the same score, and gives Boston addresses their neighborhood (Roxbury, Dorchester, …) as the city.
   - A single exact match (score 100) is taken. Without one, a match scoring 99 or more that is 2 points clear of the next is taken (a ZIP code that disagrees with the street costs about half a point).
   - Otherwise the user picks from up to five matches, or is asked for a house number or a town.
3. **Find the districts.** The matched point is looked up in MassGIS's [2021 House](https://www.mass.gov/info-details/massgis-data-massachusetts-house-legislative-districts-2021) and [Senate](https://www.mass.gov/info-details/massgis-data-massachusetts-senate-legislative-districts-2021) district layers (layer 1 of each feature service; layer 0 is outlines).
4. **Find the members.** The district names are matched to MAPLE's member search index with `districtId` from `functions/src/districts/normalize.ts`. The district layers also carry legislators' names, but those are updated by hand and lag behind, so they are not used. A district with no member in the index is reported as possibly vacant and its picker is cleared.

## When it goes wrong

- If MassGIS doesn't answer, the user is pointed to the legislature's own [find your legislator tool](https://malegislature.gov/Search/FindMyLegislator), as before.
- The matched address is always shown, so a user can see when the geocoder chose the wrong place.

## Keeping it current

- `districtNames.fixture.json` holds the 200 district names as MassGIS and the legislature each publish them, and a test checks that they match one to one. If a district comes back with no member for a seat that isn't vacant, refresh the fixture from both sources and look for a naming difference.
- After the 2030 census the districts will be redrawn and MassGIS will publish new layers. Update `HOUSE_DISTRICTS_URL`, `SENATE_DISTRICTS_URL` and the field names in `massgis.ts`, and refresh the fixture.
