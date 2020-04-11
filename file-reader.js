const fs = require("fs");
const util = require("util");

// Convert fs.readFile into a Promise version.
const readFile = util.promisify(fs.readFile);

const fileReader = async (location, format, fields) => {
  try {
    const data = await readFile(location);
    // console.log("DATA:", data.toString());
    return data.toString();
  }
  catch(err) {
    // console.error("FILE READER ERROR:", err);
    return err;
  }
}

module.exports = fileReader;
