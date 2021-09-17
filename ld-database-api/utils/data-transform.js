const ExcelJS = require("exceljs");

const stageScoreExportColumns = [
  "timestamp",
  "datetime",
  "firstName",
  "lastName",
  "gender",
  "school",
  "grade",
  "room",
  "stage",
  "difficulty",
  "playCount",
  "score",
  "maxScore",
  "duration",
  "questionNo",
  "questionAlphabet",
  "questionWord",
  "answerDuration",
  "answerAlphabet",
  "answerScore",
  "isCorrect",
];

function stageScoresToJSON(stageScoreDocs = []) {
  return stageScoreDocs.map((stageScoreDoc) => {
    const result = {};
    for (const column of stageScoreExportColumns) {
      if (column === "timestamp") {
        result.timestamp = stageScoreDoc.timestamp.getTime();
      } else if (column === "datetime") {
        result.datetime = stageScoreDoc.timestamp.toISOString();
      } else {
        result[column] = stageScoreDoc[column];
      }
    }
    return result;
  });
}

module.exports.stageScoresToJSON = stageScoresToJSON;

module.exports.stageScoresToXLSX = function (stageScoreDocs = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LD";
  workbook.lastModifiedBy = "LD";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Stage Scores");
  worksheet.columns = stageScoreExportColumns.map((header) => {
    return {
      header: header,
      key: header,
      width: 20,
    };
  });
  worksheet.addRows(stageScoresToJSON(stageScoreDocs));

  return workbook;
};

const bossScoreExportColumns = [
  "timestamp",
  "datetime",
  "firstName",
  "lastName",
  "gender",
  "school",
  "grade",
  "room",
  "stage",
  "difficulty",
  "playCount",
  "score",
  "maxScore",
  "duration",
  "questionNo",
  "questionAlphabet",
  "answerDuration",
  "answerAlphabet",
  "answerScore",
  "isCorrect",
];

function bossScoresToJSON(bossScoreDocs = []) {
  return bossScoreDocs.map((bossScoreDoc) => {
    const result = {};
    for (const column of bossScoreExportColumns) {
      if (column === "timestamp") {
        result.timestamp = bossScoreDoc.timestamp.getTime();
      } else if (column === "datetime") {
        result.datetime = bossScoreDoc.timestamp.toISOString();
      } else {
        result[column] = bossScoreDoc[column];
      }
    }
    return result;
  });
}
module.exports.bossScoresToJSON = bossScoresToJSON;

module.exports.bossScoresToXLSX = function (bossScoreDocs = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LD";
  workbook.lastModifiedBy = "LD";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Boss Scores");
  worksheet.columns = bossScoreExportColumns.map((header) => {
    return {
      header: header,
      key: header,
      width: 20,
    };
  });
  worksheet.addRows(bossScoresToJSON(bossScoreDocs));

  return workbook;
};

const summaryScoreExportColumns = [
  "firstName",
  "lastName",
  "gender",
  "school",
  "grade",
  "room",
  ...new Array(9)
    .fill(undefined)
    .map((_, i) => {
      return [`stage${i + 1}`, `stage${i + 1}pr`];
    })
    .reduce((result, ele) => result.concat(ele), []),
  "boss",
  "bosspr",
  "total",
  "totalpr",
];

function summaryScoresToJSON(summaryScoreDocs = []) {
  return summaryScoreDocs.map((summaryScoreDoc) => {
    const result = {};
    for (const column of summaryScoreExportColumns) {
      if (/^stage.+$/.test(column) || column === "boss" || column === "total") {
        if (column.includes("pr")) {
          result[column] = summaryScoreDoc[column.replace("pr", "")].percentile;
        } else {
          result[column] = summaryScoreDoc[column].bestStar;
        }
      } else {
        result[column] = summaryScoreDoc[column];
      }
    }
    return result;
  });
}
module.exports.summaryScoresToJSON = summaryScoresToJSON;

module.exports.summaryScoresToXLSX = function (summaryScoreDocs = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LD";
  workbook.lastModifiedBy = "LD";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Summary Scores");
  worksheet.columns = summaryScoreExportColumns.map((header) => {
    return {
      header: header,
      key: header,
      width: 20,
    };
  });
  worksheet.addRows(summaryScoresToJSON(summaryScoreDocs));

  return workbook;
};
