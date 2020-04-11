const fs = require("fs");
const { parse } = require("@fast-csv/parse");

// This counter variable is used to remove the header row. See the comment below for more details.
let count = 0;

/**
 * Parse the CSV or TSV file and produce the necessary output files. Correctly formatted data will
 * go inside a file named "output-correct-format.(csv|tsv)". Incorrectly formatted data will go
 * inside a file named "output-incorrect-format.(csv|tsv)".
 * @param {sting} filepath - The filepath that the user enters.
 * @param {string} fileFormat - The file format that the user selects.
 * @param {string} numberOfFields - The number of fields that the user specifies.
 */
const createOutput = async (filepath, fileFormat, numberOfFields) => {
  // Set the delimiter value based on the fileFormat that the user selects.
  let delimiter;
  if (fileFormat == "CSV") delimiter = ",";
  if (fileFormat == "TSV") delimiter = "\t";

  try {
    fs.createReadStream(filepath)
      /**
       * Parse the CSV or TSV file using the @fast-csv/parse package.
       * @param {string} delimiter - Parse the file using the delimiter value that the user specified.
       * @param {boolean} headers - If you set "headers: true", then the file parser will inject
       * empty strings in place of missing values so that each row will have the same number of
       * values as there are headers. That makes the data formatting a bit trickier to handle. But
       * if you set "headers: false", then you get the original data without any extra formatting or
       * data injection, which makes it easier to clean and format.
       */
      .pipe(parse({ delimiter, headers: false }))
      /**
       * Each row is parsed as an array of data. The validate() method will process and validate
       * each row of data one at a time.
       * @param {string[]} data - A row of data that has been parsed from a CSV or TSV file.
       */
      .validate(data => {
        // Remove the header row. The header row is the first row that will be parsed. This
        // conditional check will use a counter variable to check for the first row and return early
        // for only that row. The early return will send that row to the "data-invalid" listener
        // where the header row will be skipped instead of sent to the "output-incorrect-format.*" file.
        if (count == 0) {
          count++;
          return;
        }

        // Rows that match this validation rule will be sent to the "output-correct-format.*" file.
        // Rows that do not match this validation will be sent to the "output-incorrect-format.*" file.
        if (numberOfFields == data.length) {
          return data;
        }
      })
      .on("error", error => console.error("CSV/TSV PARSING ERROR:", error))
      /**
       * Valid data rows are sent to this "data" listener and those data are formatted appropriately
       * based on the fileFormat the user entered.
       * @param {string[]} row - A row of data that has been parsed from a CSV or TSV file and that
       * has gone through the validate() method.
       */
      .on("data", (row) => {
        if (fileFormat == "CSV") {
          fs.appendFile("output-correct-format.csv", row + "\n", (err) => {
            if (err) throw err;
          });
        }
        else if (fileFormat == "TSV") {
          const tabbedRow = row.join("\t");
          fs.appendFile("output-correct-format.tsv", tabbedRow + "\n", (err) => {
            if (err) throw err;
          });
        }
      })
      /**
       * Invalid data rows are sent to this "data-invalid" listener and those data are formatted
       * appropriately based on the fileFormat the user entered.
       * @param {string[]} row - A row of data that has been parsed from a CSV or TSV file and that
       * has gone through the validate() method.
       * @param {number} rowNumber - A number (starting at 1) representing the row of data in the file.
       */
      .on("data-invalid", (row, rowNumber) => {
        // The header row is invalidated using the counter variable (above), which cause the header
        // row to be sent to this listener. Since the header row is the first row in the file, it is
        // designated as rowNumber 1. The following conditional statement will ignore rowNumber 1,
        // so the header row won't get sent to any output files. All other invalid rows are sent to
        // the "output-incorrect-format.*" file.
        if (rowNumber != 1) {
          if (fileFormat == "CSV") {
            fs.appendFile("output-incorrect-format.csv", row + "\n", (err) => {
              if (err) throw err;
            });
          }
          else if (fileFormat == "TSV") {
            const tabbedRow = row.join("\t");
            fs.appendFile("output-incorrect-format.tsv", tabbedRow + "\n", (err) => {
              if (err) throw err;
            });
          }
        }
      })
      .on("end", rowCount => console.log(`Parsed ${rowCount} rows`));
  }
  catch(err) {
    console.error("CREATE OUTPUT ERROR:", err);
  }
}

module.exports = createOutput;
