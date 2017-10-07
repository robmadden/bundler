const fs = require('fs');
const DAYS = ['M', 'T', 'W', 'R', 'F'];
const NEXT_DAY = {
  M: 'T',
  T: 'W',
  W: 'R',
  R: 'F',
};

/**
* @typedef {Object} Shipment
* @property {string} id
* @property {string} start
* @property {string} finish
* @property {DayOfWeek} day
* @property {bool} bundled
*/

class Bundler {

 constructor(inputFilename, printOutput){
    this.inputFilename = inputFilename;
    this.printOutput = printOutput;
    this.shipmentsByDay = {
      'M': [],
      'T': [],
      'W': [],
      'R': [],
      'F': [],
    };
    this.shipmentsByID = {};
 }

  /**
   * Takes an input file and prints bundles to STDOUT
   *
   * @param {string} input
   */
  bundle() {
    this.parseFile();
    this.parseInputShipments(this.input);
    return this.findAllBundles();
  }

  /**
   * Returns true if dowOne.DayOfWeek is chronologically the day before dowTwo.DayOfWeek
   *
   * @param {Shipment} parentDay
   * @param {Shipment} childDay
   */
  daysAreConsecutive(parentDay, childDay) {
    return NEXT_DAY[parentDay] === childDay;
  }

  /**
   * Find the longest bundle possible given a shipment
   * @param {Shipment} shipment
   */
  findLongestBundle(shipment, longestBundle, bundle) {
    if (shipment === undefined || shipment === null || shipment.bundled === true) {
      return longestBundle;
    }

    bundle = `${bundle} ${shipment.id}`;

    if (bundle.length > longestBundle.length) {
      longestBundle = bundle;
    }

    let nextDay = NEXT_DAY[shipment.day];
    let potentialChildren = this.shipmentsByDay[nextDay];

    if (potentialChildren == undefined) {
      return longestBundle;
    }

    // Iterate through children to find longest bundle
    for (let i = 0 ; i < potentialChildren.length ; i++) {
        let child = potentialChildren[i];
        if (this.isValidChild(shipment, child) && !child.bundled) {
          longestBundle = this.findLongestBundle(child, longestBundle, bundle);
        }
    }

    return longestBundle;
  }

  /**
   * Given a set of shipments, find all valid bundles
   */
  findAllBundles() {
    let allBundles = "";
    for (let i = 0 ; i < DAYS.length ; i++) {
      let day = DAYS[i];
      let shipments = this.shipmentsByDay[day];
      for (let j = 0 ; j < shipments.length ; j++) {
        let shipment = shipments[j];
        let shipmentByID = this.shipmentsByID[shipment.id];
        if (!shipmentByID.bundled) {
          let longestBundle = this.findLongestBundle(shipmentByID, "", "");
          allBundles = `${allBundles} ${longestBundle}`;

          if (this.printOutput) {
            console.log(longestBundle);
          }

          let shipmentsInLongest = longestBundle.trim(' ').split(' ');
          for (let k = 0 ; k < shipmentsInLongest.length ; k++) {
            let shipmentID = shipmentsInLongest[k];
            this.shipmentsByID[shipmentID].bundled = true;
          }
        };
      }
    }

    // For independent testing purposes
    return allBundles;
  }

  /**
   * Returns true is otherShipment is a valid child of shipment
   * per the constraints:
   *
   * 1. The days must be consecutive
   * 2. The destination of the original shipment must be the start of the other shipment
   *
   * @param {Shipment} parent
   * @param {Shipment} child
   */
  isValidChild(parent, child) {
    return this.daysAreConsecutive(parent.day, child.day) && parent.finish === child.start
  }

  /**
   * Given filename, open the file and store it as input to the bundler
   *
   * @param {filename} the name of the file you wish to parse
   */
  parseFile() {
    try {
      this.input = fs.readFileSync(this.inputFilename).toString();
    } catch (error) {
      console.error(`${inputFilename} does not appear to be a test file`, error);
      return false;
    }
  }

  /**
   * Parses a test input file, where each line is of the format:
   *
   *   <id> <start> <finish> <day>
   *
   * @param {string} contents
   */
  parseInputShipments(contents) {
    let lines = this.parseWords(contents);

    for (let i = 0 ; i < lines.length ; i++) {
      let line = lines[i];

      let s = ({
        id: line[0],
        start: line[1],
        finish: line[2],
        day: line[3],
        bundled: false,
        children: [],
      });

      this.shipmentsByID[s.id] = s;
      this.shipmentsByDay[s.day].push(s);
    }
  }

  /**
   * @param {string} contents
   */
  parseWords(contents) {
    return contents
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .map(line => line.split(' '));
  }
}

if (require.main === module) {
  const b = new Bundler(process.argv[2], true);
  b.bundle();
}

exports.Bundler = Bundler
