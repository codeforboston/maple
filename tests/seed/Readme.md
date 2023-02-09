# Emulator data seeding

The integration tests run against the emulator suite, with some existing application data to facilitate testing (`yarn dev:up`). The seeded database is version controlled in `tests/integration/exportedTestData`. To regenerate the test data, run these steps from a clean emulator database (`yarn dev:up`):

1. Trigger each scraper and batch job once with `curl http://localhost:5001/demo-dtp/us-central1/triggerScheduledFunction?name=$functionName`, using the following values for `$functionName`:

- `startBillBatches`
- `startMemberBatches`
- `createMemberSearchIndex`
- `scrapeHearings`
- `scrapeSessions`
- `scrapeSpecialEvents`

3. Create `test1@example.com`, `test2@example.com`, `test3@example.com`, `test4@example.com` test users, all with password `password`
4. Run `yarn seed` once
