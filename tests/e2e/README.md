# End-to-end Testing with Playwright

MAPLE uses the Playwright testing framework to run end-to-end tests. It allows us to test across multiple browsers and platforms, and it provides an easy to use user interface to help devs navigate through their tests and test runs. We are currently running tests in chromium, firefox, and webkit.

For an introduction on how to write e2e tests with Playwright, go to the [Playwright docs](https://playwright.dev/docs/writing-tests). An example of an e2e test can be found in `tests/e2e/homepage.spec.ts`.

## How to run tests

There are two ways you can run the e2e tests, with the Playwright UI or headless in your terminal. This will automatically start the application so you don't need to do it before running tests.

### With Playwright UI

To run the e2e tests with the Playwright UI, run `yarn test:e2e`. Once the UI pops up and the tests have loaded, press the play button in the "TESTS" bar to run all the tests. To run individual tests or test suites, you can hover over the test name to reveal a play button that will run only that test/suite when clicked.

![image](https://github.com/codeforboston/maple/assets/16471076/5d3f486d-28f7-4d4f-8fd7-e35dfa19cbca)

![image](https://github.com/codeforboston/maple/assets/16471076/b8a8396e-be2d-410d-a1a7-7e8dbf2b6a0b)

### Headless

To run the e2e tests headless in your terminal, run `yarn test:e2e:headless`. The results of this test run will show on your terminal, and it will also generate an HTML report that will open in your browser.

![image](https://github.com/codeforboston/maple/assets/16471076/13b8fd5c-5f6d-4b24-bbae-3fe95669a951)

![image](https://github.com/codeforboston/maple/assets/16471076/75ef8000-5a51-480b-90fd-c0b017bf4f9e)
