# Emulator data seeding

The integration tests run against the emulator suite, with some existing application data to facilitate testing (`yarn dev:emulators-with-data`). The seeded database is version controlled in `tests/integration/exportedTestData`. To regenerate the test data, run these steps from a clean emulator database (`yarn dev:emulators`):

1. Trigger `startBillBatches` once
2. Trigger `startMemberBatches` once
3. Trigger `createMemberSearchIndex` once
4. Create `test1@example.com`, `test2@example.com`, `test3@example.com`, `test4@example.com` test users, all with password `password`
5. Run `yarn seed` once
