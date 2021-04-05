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



//!=====````````````````````````````````````similar to above
// function concatCSVAndOutput(csvFilePaths, outputFilePath) {
//   const promises = csvFilePaths.map((path) => {
//     return new Promise((resolve) => {
//       const dataArray = [];
//       return csv
//           .parseFile(path, {headers: true, escape: "\\"})
//           .on('data', function(data) {
//             dataArray.push(data);
//           })
//           .on('end', function() {
//             resolve(dataArray);
//           });
//     });
//   });

//   return Promise.all(promises)
//       .then((results) => {

//         const csvStream = csv.format({headers: true });
//         const writableStream = fs.createWriteStream(outputFilePath);

//         writableStream.on('finish', function() {
//           console.log('DONE!');
//         });

//         csvStream.pipe(writableStream);
//         results.forEach((result) => {
//           result.forEach((data) => {
//             csvStream.write(data);
//           });
//         });
//         csvStream.end();

//       });
//     }

// // concatCSVAndOutput(['./fixtures/clothing.csv', './fixtures/accessories.csv'], 'outputfile.csv')
// concatCSVAndOutput(['./fixtures/clothing.csv', './fixtures/accessories.csv'], 'outputfile.csv')
//     .then(() => console.log('hi'));