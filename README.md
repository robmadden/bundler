# Bundler

Take input file and find the least number of valid bundles.

## Execution

To execute my solution run: `node bundler.js tests/*` on the command line.

## Extra Tests

I added a few tests aside from the validation given. The three tests I added were:

- A test for all possible combinations of the logic in the `daysAreConsecutive` function
- A test for the `testIsValidChild` function that tests a few different combinations of different shipments
- A test that redundantly checks the logic in validate.js

To execute these tests run: `node bundler_tests.js tests/[test_name]` where test_name is one individual test on the command line.

## Side Notes

Currently, I am programming in golang, so tyring to write this in node.js was a
good cognitive exercise for me.

In the original `README.md`, I think there's a typo on this line (5 should be 6?):

```
And here is a sample output file for the above input which bundles the 5 shipments into 2 bundles:
```
