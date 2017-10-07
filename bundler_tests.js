const fs = require('fs');
var bundler = require('./bundler');

const inputFileName = process.argv[2];
const b = new bundler.Bundler(inputFileName, false);

testDaysAreConsecutiveFunc();
testIsValidChild();
validateBundles(inputFileName);

/**
 * Given a bundle, check that it's composed of valid shipments
 */
function validateBundles(inputFileName) {
  allShipmentsFromFile = [];
  allShipmentsUsed = [];
  shipmentsByID = {};

  try {
    input = fs.readFileSync(inputFileName).toString();
  } catch (error) {
    console.error(`${inputFileName} does not appear to be a test file`, error);
    return false;
  }

  // Parse the input independently and generate a shipmentsByID dictionary for easy testing
  lines = input.split('\n');
  for (let i = 0 ; i < lines.length ; i++) {
    let shipment = lines[i].split(' ');

    s = {
        id: shipment[0],
        start: shipment[1],
        finish: shipment[2],
        day: shipment[3],
    };

    if (s.id === '') { continue;}
    shipmentsByID[shipment[0]] = s;
    allShipmentsFromFile.push(s);
  }

  // Run the actual program and capture its output
  output = b.bundle();

  // Verify that each individual bundle from the output is valid
  bundles = output.trim('\n').split('\n');
  for (k = 0 ; k <  bundles.length ; k++) {
    shipments = bundles[k].split(' ');
    for (l = 0 ; l < shipments.length ; l++) {
      if (shipments[l] === '') { continue;}

      allShipmentsUsed.push(shipments[l]);
      let parent = shipmentsByID[shipments[l]];
      let child = shipmentsByID[shipments[l+1]];

      if (parent !== undefined && child !== undefined && !b.isValidChild(parent, child)) {
          console.log(`\u2715 bundler.bundle failed for '${parent.id}' -> '${child.id}'`);
          process.exit(1);
      }
    }
  }

  // Verify that every bundle was used
  if (allShipmentsUsed.length != allShipmentsFromFile.length) {
        console.log(`\u2715 bundler.bundle failed: not every bundle used, generated: ${allShipmentsUsed.length}, expected: ${allShipmentsFromFile.length}`);
        process.exit(1);
  }

  // Verify that no bundles were left behind
  for (var shipmentID in shipmentsByID) {
    found = false;
    for (let i in allShipmentsUsed) {
      if (shipmentID == allShipmentsUsed[i]) {
        found = true;
      }
    }
    if (!found) {
      console.log(`\u2715 bundler.bundle failed: shipment ${shipmentID} unused`);
      process.exit(1);
    }
  }

  console.log("\u2713 bundler.bundle");
}

/**
 * Helper function for testDaysAreConsecutiveFunc
 */
function compareDays(dayOne, dayTwo, expected) {
  if (b.daysAreConsecutive(dayOne, dayTwo) !== expected) {
    console.log(`\u2715 bundler.daysAreConsecutive failed for '${dayOne}' -> '${dayTwo}'`);
    process.exit(1);
  }
}

/*
 * Tests for the Bundler::daysAreConsecutive function
 */
function testDaysAreConsecutiveFunc() {
  // Test for true positives
  compareDays('M', 'M', false);
  compareDays('M', 'T', true);
  compareDays('M', 'W', false);
  compareDays('M', 'R', false);
  compareDays('M', 'F', false);

  compareDays('T', 'M', false);
  compareDays('T', 'T', false);
  compareDays('T', 'W', true);
  compareDays('T', 'R', false);
  compareDays('T', 'F', false);

  compareDays('W', 'M', false);
  compareDays('W', 'T', false);
  compareDays('W', 'W', false);
  compareDays('W', 'R', true);
  compareDays('W', 'F', false);

  compareDays('R', 'M', false);
  compareDays('R', 'T', false);
  compareDays('R', 'W', false);
  compareDays('R', 'R', false);
  compareDays('R', 'F', true);

  compareDays('F', 'M', false);
  compareDays('F', 'T', false);
  compareDays('F', 'W', false);
  compareDays('F', 'R', false);
  compareDays('F', 'F', false);

  console.log("\u2713 bundler.daysAreConsecutive");
}

/**
 * Helper comparison function for testIsValidChild
 */
function compareChildren(parent, child, expected) {
  if (b.isValidChild(parent, child) !== expected) {
    console.log(`\u2715 bundler.isValidChild failed for '${parent}' -> '${child}'`);
    process.exit(1);
  }
}

/**
 * Tests for the Bundler::isValidChild function
 */
function testIsValidChild() {
  parent = {
    id: 1,
    start: 'CHICAGO',
    finish: 'SEATTLE',
    day: 'M',
    bundled: false,
  }

  child = {
    id: 2,
    start: 'SEATTLE',
    finish: 'SAN_FRANCISCO',
    day: 'T',
    bundled: false,
  }

  compareChildren(parent, child, true);

  parent = {
    id: 1,
    start: 'CHICAGO',
    finish: 'SEATTLE',
    day: 'M',
    bundled: false,
  }

  child = {
    id: 2,
    start: 'SEATTLE',
    finish: 'SAN_FRANCISCO',
    day: 'W',
    bundled: false,
  }

  compareChildren(parent, child, false);

  parent = {
    id: 1,
    start: 'CHICAGO',
    finish: 'SEATTLE',
    day: 'M',
    bundled: false,
  }

  child = {
    id: 2,
    start: 'CHICAGO',
    finish: 'SAN_FRANCISCO',
    day: 'T',
    bundled: false,
  }

  compareChildren(parent, child, false);

  parent = {
    id: 1,
    start: 'CHICAGO',
    finish: 'SEATTLE',
    day: 'M',
    bundled: false,
  }

  child = {
    id: 2,
    start: 'SEATTLE',
    finish: 'SAN_FRANCISCO',
    day: 'M',
    bundled: false,
  }

  compareChildren(parent, child, false);

  console.log("\u2713 bundler.isValidChild");
}
