const csv = require("csv");
const excel4node = require("excel4node");

const studentsExportColumns = [
  "timestamp",
  "datetime",
  "firstName",
  "lastName",
  "gender",
  "school",
  "grade",
  "room",
  "stage",
  "playCount",
  "difficulty",
  "score",
  "maxScore",
  "duration",
  "alphabets",
  "answerCorrects",
  "answerScores",
];

module.exports.scoresToCSV = function (scoreDocs) {
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
    for (const result of scoreDocs) {
      result.datetime = new Date(result.timestamp).toISOString();
      stringify.write(result);
    }
    stringify.end();
  });
};

module.exports.scoresToXLSX = function (scoreDocs) {
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
  ws.column(4).setWidth(20);
  ws.column(6).setWidth(20);

  const normalStyle = wb.createStyle({
    font: {
      size: 12,
    },
  });
  for (const result of scoreDocs) {
    result.datetime = new Date(result.timestamp).toISOString();
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
          } else if (Array.isArray(result[header])) {
            ws.cell(row, column)
              .string(result[header].join(","))
              .style(normalStyle);
          } else if (typeof result[header] === "object") {
            ws.cell(row, column)
              .string(JSON.stringify(result[header]))
              .style(normalStyle);
          } else if (result[header]) {
            ws.cell(row, column)
              .string("" + result[header])
              .style(normalStyle);
          } else {
            ws.cell(row, column).string("").style(normalStyle);
          }
      }
      column += 1;
    }
  }

  return wb;
};
