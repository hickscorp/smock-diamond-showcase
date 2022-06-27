# Smock Diamond Bounty Reference Test Cases

The test of interest is: in `test/FacetA.test.ts`.

A series of two times two test cases are there, and they should allow to see:

- A facet calling another one. A single line of call allows to enable / disable mocking to see the thing work fully.
- A facet storing data using storage slots.

The two tests are duplicated twice - once without `hardhat-deploy` fixtures and another one with `hardhat-deploy` fixtures.

IMPORTANT: A deliverable which wouldn't work with `hardhat-deploy` fixtures wouldn't be acceptable, because as soon as you use diamonds setup times skyrocket. Therefore, the deliverable for this bounty **must** include working examples for both non-fixtured tests **and** fixtured tests.
