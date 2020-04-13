const fs = require("fs");
const fsPromises = fs.promises;
const del = require("del");
const inquirer = require("inquirer");
const createOutput = require("./create-output");

/**
 * When the user runs `npm start` from their terminal, the `start` function will will kickoff
 * the application.
 */
const start = async () => {
  try {
    // Remove any pre-existing output files.
    await del([
      "output-correct-format.*",
      "output-incorrect-format.*"
    ]);

    // The inquirer package is used to create console applications with prompts, validation, etc.
    // For documentation see https://www.npmjs.com/package/inquirer.
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "filepath",
        message: "Where is the file located?",
        validate: async function(value) {
          try {
            const path = value.match(
              // This regular expression is not very robust.
              // It will match any file path string that ends with ".csv" or ".tsv".
              /[\s\S]*\.(csv|tsv)/
            );
            // If the input value does not match the regular expression, then the following
            // validation message will be printed to the console.
            if (!path) {
              return "You must provide a valid file path with either a \".csv\" or \".tsv\" file extension.";
            }

            // Check if the provided filepath exists. If it does not, then an error will be
            // thrown and that error will be handled in the catch block.
            await fsPromises.access(value);

            // If the file path is valid and the file exists, then accept the input and continue to
            // the next prompt.
            return true;
          }
          catch(err) {
            // If no file exists at the filepath provided, then the following validation message
            // will be printed to the console.
            if (err && err.code == "ENOENT") {
              return "No file exists at that path. Please try again.";
            }
            // If a different error occurs, then log it to the console.
            else {
              console.error("Where is the file located? [ERROR]:", err);
            }
          }
        }
      },
      {
        type: "checkbox",
        name: "fileFormat",
        message: "Is the file format CSV or TSV?",
        choices: ["CSV", "TSV"],
        validate: function(answer) {
          try {
            // Input is required. If the user presses "Enter" without selecting either CSV or TSV,
            // then the following validation message will be printed to the console.
            if (answer.length < 1) {
              return "You must choose a file format.";
            }
            // If a selection is made, then continue to the next prompt.
            return true;
          }
          catch(err) {
            console.error("Is the file format CSV or TSV? [ERROR]:", err);
          }
        }
      },
      {
        type: "input",
        name: "numberOfFields",
        message: "How many fields should each record contain (1, 2, or 3)?",
        validate: function(value) {
          try {
            // A number between 1 and 3 (inclusive) is required.
            const num = value.match(
              /[1-3]/
            );
            // If the input matches the regular expression, then continue with the prompts.
            if (num) {
              return true;
            }
            // If the input does NOT match the regular expression, then the following validation
            // message will be printed to the console.
            return "Only the numbers 1, 2, or 3 are accepted.";
          }
          catch(err) {
            console.error("How many fields should each record contain? [ERROR]:", err);
          }
        }
      }
    ]);

    const filepath = answers.filepath;
    const fileFormat = answers.fileFormat[0];
    const numberOfFields = answers.numberOfFields;

    // Call the createOutput module with the necessary arguments.
    createOutput(filepath, fileFormat, numberOfFields);
  }
  catch(err) {
    console.error("START FUNCTION [ERROR]:", err);
  }
}

// Start the application.
start();
