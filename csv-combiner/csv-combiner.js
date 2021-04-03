const args = require("yargs");
const fs = require("fs");
const csv = require("fast-csv");
const path = require("path");

const filePaths = args.argv._;

const readCSVFile = (file) => {
  const fileExt = file.substring(file.lastIndexOf("."));
  return new Promise((resolve, reject) => {
    if (fileExt === ".csv") {
      const readData = [];
      csv
        .parseFile(file, { headers: true, escape: `\\`})
        .on("data", (data) => {
          data["fileName"] = path.parse(file).base;
          readData.push(data);
        })
        .on("end", () => {
          resolve(readData);
        });
    } else {
      console.log("Unable to merge files");
    }
  });

};

const mergeFiles = async (files, mergedFile) => {
  if (files.length !== 0) {
    const promises = files.map(async (file) => await readCSVFile(file));
    const results = await Promise.all(promises);
    const formatCsv = csv.format({ headers: true });
    const writedata = fs.createWriteStream(mergedFile);
    writedata.on("finish", () => {
      console.log("Merged!");
    });
    formatCsv.pipe(writedata);
    results.forEach((result) => {
      result.forEach((data) => {
        formatCsv.write(data);
      });
    });
    formatCsv.end();
  } else {
    console.log("Require path");
    return files;
  }
};

mergeFiles(filePaths, "combined.csv");

