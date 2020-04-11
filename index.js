const inquirer = require("inquirer");
const fileReader = require("./file-reader.js");

const start = async () => {

  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "location",
        message: "Where is the file located?",
        validate: async function(value) {
          try {
            const path = value.match(
              // This regular expression is not very robust.
              // It will match any file path string that ends with ".csv" or ".tsv".
              /[\s\S]*\.(csv|tsv)/
            );
            // If the input value does not match the regular expression, then print the following validation message.
            if (!path) {
              return "You must provide a valid file path with either a \".csv\" or \".tsv\" file extension.";
            }

            const fileExists = await fileReader(value);
            // console.log("FILE EXISTS:", fileExists);
            // If no file exists at the location provided, then print the following validation message.
            if (fileExists.code === "ENOENT") {
              return "No file exists at that path. Please try again.";
            }

            // If the file path is valid and the file exists, then accept the input and continue to the next prompt.
            return true;
          }
          catch(err) {
            console.error("Where is the file located? ERROR:", err);
          }
        }
      },
      {
        type: "checkbox",
        name: "format",
        message: "Is the file format CSV or TSV?",
        choices: ["CSV", "TSV"],
        validate: function(answer) {
          // Input is required. If the user presses "Enter" without selecting either CSV or TSV, then print the following validation message.
          if (answer.length < 1) {
            return "You must choose a file format.";
          }
          // If a selection is made, then continue to the next prompt.
          return true;
        }
      },
      {
        type: "input",
        name: "fields",
        message: "How many fields should each record contain (1, 2, or 3)?",
        validate: function(value) {
          // A number between 1 and 3 (inclusive) is required.
          const num = value.match(
            /[1-3]/
          );
          // If the input matches the regular expression, then continue with the prompts.
          if (num) {
            return true;
          }
          // If the input does NOT match the regex, then print the following validation message.
          return "Only the numbers 1, 2, or 3 are accepted.";
        }
      }
    ]);

    console.log(JSON.stringify(answers, null, " "));

    // Read the file from answers.location.

    // Use the answer from answers.format to process the file based on the format.

    // Use the answer from answers.fields to properly format the output file.
    const location = answers.location;
    const format = answers.format;
    const fields = answers.fields;
    fileReader(location, format, fields);
  }

  catch(err) {
    // handle the error...
    console.error("START FUNCTION:", err);
  }
}

start();
