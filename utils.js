const csv = require("csv");
const excel4node = require("excel4node");

module.exports.toLogObject = function ({
  timestamp = Date.now(),
  action = "default",
  response,
  parameters,
}) {
  return {
    timestamp,
    action,
    parameters,
    response,
  };
};

module.exports.filterParams = function (obj, params, optionalParams = []) {
  const result = {};
  for (const param of params) {
    result[param] = obj[param];
  }
  for (const param of optionalParams) {
    result[param] = obj[param];
  }
  return result;
};

module.exports.checkMissingParams = function (
  obj,
  params,
  optionalParams = []
) {
  const missingParams = [];
  for (const param of params) {
    if (typeof obj[param] === "undefined" && !optionalParams.includes(param)) {
      missingParams.push(param);
    }
  }
  return missingParams;
};

const studentsExportColumns = [
  "timestamp",
  "datetime",
  "stage",
  "difficulty",
  "score",
  "minParScore",
  "maxParScore",
  "duration",
  "minParDuration",
  "maxParDuration",
  "scoreDifficultyFactor",
  "durationDifficultyFactor",
  "difficultyAdjustment",
];
module.exports.studentDocsToCSV = function (scoreDocs) {
  return new Promise((resolve, reject) => {
    let csvStr = "";
    const stringify = csv.stringify({
      columns: studentsExportColumns,
      header: true,
    });
    stringify.on("readable", () => {
      let row;
      do {
        if (row) {
          csvStr += row;
        }
        row = stringify.read();
      } while (row);
    });
    stringify.on("error", reject);
    stringify.on("finish", () => {
      resolve(csvStr);
    });
    for (const doc of scoreDocs) {
      const result = doc.toJSON();
      result.difficultyAdjustment = doc.difficultyAdjustment;
      result.nextDifficulty = doc.nextDifficulty;
      result.datetime = new Date(result.timestamp).toISOString();
      const deleteParams = ["studentId", "_id", "__v", "countStatistic"];
      for (const param of deleteParams) {
        delete result[param];
      }
      stringify.write(result);
    }
    stringify.end();
  });
};

module.exports.studentDocsToXLSX = function (scoreDocs) {
  const wb = new excel4node.Workbook();
  const ws = wb.addWorksheet("Export Data");
  const headerStyle = wb.createStyle({
    font: {
      bold: true,
      size: 12,
    },
  });

  let row = 1;
  let column = 1;
  for (const header of studentsExportColumns) {
    ws.cell(row, column).string(header).style(headerStyle);
    column += 1;
  }
  ws.column(1).setWidth(15);
  ws.column(2).setWidth(15);
  ws.column(3).setWidth(20);

  const normalStyle = wb.createStyle({
    font: {
      size: 12,
    },
  });
  for (const doc of scoreDocs) {
    const result = doc.toJSON();
    result.difficultyAdjustment = doc.difficultyAdjustment;
    result.nextDifficulty = doc.nextDifficulty;
    result.datetime = new Date(result.timestamp).toISOString();
    const deleteParams = ["studentId", "_id", "__v", "countStatistic"];
    for (const param of deleteParams) {
      delete result[param];
    }

    row += 1;
    column = 1;
    for (const header of studentsExportColumns) {
      switch (typeof result[header]) {
        case "string":
          ws.cell(row, column).string(result[header]).style(normalStyle);
          break;
        case "number":
          ws.cell(row, column).number(result[header]).style(normalStyle);
          break;
        default:
          if (result[header] instanceof Date) {
            ws.cell(row, column)
              .number(result[header].getTime())
              .style({
                font: {
                  size: 12,
                },
                numberFormat: "0",
              });
          } else {
            ws.cell(row, column)
              .string("" + result[header])
              .style(normalStyle);
          }
      }
      column += 1;
    }
  }

  return wb;
};

module.exports.studentDocsToJSON = function (scoreDocs) {
  return scoreDocs.map((doc) => {
    const result = doc.toJSON();
    result.difficultyAdjustment = doc.difficultyAdjustment;
    const deleteParams = ["studentId", "_id", "__v", "countStatistic"];
    for (const param of deleteParams) {
      delete result[param];
    }
    return result;
  });
};
