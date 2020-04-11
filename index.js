const inquirer = require("inquirer");

const start = async () => {

    try {
        const questions = await inquirer.prompt([
            {
                type: "input",
                name: "location",
                message: "Where is the file located?",
                validate: function(value) {
                    const path = value.match(
                        // This regular expression is not very robust.
                        // It will match any file path string that ends with ".csv" or ".tsv".
                        /[\s\S]*\.(csv|tsv)/
                    );
                    if (path) {
                        return true;
                    }
                    return "You must provide a file path.";
                }
            },
            {
                type: "checkbox",
                name: "format",
                message: "Is the file format CSV or TSV?",
                choices: ["CSV", "TSV"],
                validate: function(answer) {
                    if (answer.length < 1) {
                        return "You must choose a file format.";
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: "fields",
                message: "How many fields should each record contain (1, 2, or 3)?",
                validate: function(value) {
                    const num = value.match(
                        /[1-3]/
                    );
                    if (num) {
                        return true;
                    }
                    return "Only the numbers 1, 2, or 3 are accepted.";
                }
            }
        ]);

        console.log(JSON.stringify(questions, null, " "));

        // Read the file from questions.location.

        // Use the answer from questions.format to process the file based on the format.

        // Use the answer from questions.fields to properly format the output file.
    }

    catch(error) {
        // handle the error...
        console.error("START FUNCTION:", error);
    }
}

start();
