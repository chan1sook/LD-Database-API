const express = require("express");
const checkparams = require("../middlewares/checkparams");
const {
  summaryScoresToJSON,
  summaryScoresToXLSX,
} = require("../utils/data-transform");
const {
  getSummaryScores,
  getStageScores,
  getBossScores,
} = require("../utils/get-data");
const { toLogObject } = require("../utils/utils");

const router = express.Router();

/**
 * Get Summary Data  for Report
 */
router.get(
  "/report/summary",
  checkparams(
    "query",
    [],
    [
      "stage",
      "startTime",
      "endTime",
      "studentId",
      "school",
      "room",
      "grade",
      "prevIdStart",
      "limit",
    ]
  ),
  async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(403).json(
          toLogObject({
            action: `${req.method} ${req.path}`,
            response: {
              error: "Forbidden",
            },
            parameters: req.parameters,
          })
        );
      }

      const response = {
        students: await getSummaryScores(req.session.user, req.parameters),
        hasNext: false,
      };

      if (typeof req.parameters.limit !== "undefined") {
        const limit = Number(req.parameters.limit);
        if (limit === response.students.length) {
          response.hasNext = true;
        }
      }

      res.status(200).json(
        toLogObject({
          action: `${req.method} ${req.path}`,
          response,
          parameters: req.parameters,
        })
      );
    } catch (err) {
      console.error(err);
      res.status(500).json(
        toLogObject({
          action: `${req.method} ${req.path}`,
          response: {
            error: "Server Error",
            rawError: err.toString(),
          },
          parameters: req.parameters,
        })
      );
    }
  }
);

/**
 * Export Summary Scores
 */
router.get(
  "/report/export/summary",
  checkparams(
    "query",
    [],
    [
      "format",
      "stage",
      "startTime",
      "endTime",
      "studentId",
      "school",
      "room",
      "grade",
    ]
  ),
  async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(403).json(
          toLogObject({
            action: `${req.method} ${req.path}`,
            response: {
              error: "Forbidden",
            },
            parameters: req.parameters,
          })
        );
      }

      let format =
        typeof req.parameters.format === "string"
          ? req.parameters.format
          : "csv";
      if (!["csv", "json", "xlsx"].includes(format)) {
        return res.status(400).json(
          toLogObject({
            action: `${req.method} ${req.path}`,
            response: {
              error: `Invalid Format: ${format} (except csv,json,xlsx)`,
            },
            parameters: req.parameters,
          })
        );
      }

      const scoreDocs = await getSummaryScores(
        req.session.user,
        req.parameters
      );

      let filename, workbook;
      switch (format) {
        case "csv":
          filename = `summary-scores-${Date.now()}.csv`;
          workbook = summaryScoresToXLSX(scoreDocs);
          res.attachment(filename);
          workbook.csv.write(res);
          break;
        case "xlsx":
          filename = `summary-scores-${Date.now()}.xlsx`;
          workbook = summaryScoresToXLSX(scoreDocs);
          res.attachment(filename);
          workbook.xlsx.write(res);
          break;
        case "json":
        default:
          res.status(200).json(summaryScoresToJSON(scoreDocs));
          break;
      }
    } catch (err) {
      console.error(err);
      res.status(500).json(
        toLogObject({
          action,
          response: {
            error: "Server Error",
            rawError: err.toString(),
          },
          parameters: req.parameters,
        })
      );
    }
  }
);

/**
 * Get Stage Scores for Report
 */
router.get(
  "/report/stage",
  checkparams(
    "query",
    [],
    [
      "studentId",
      "school",
      "room",
      "grade",
      "startTime",
      "endTime",
      "stage",
      "prevIdStart",
      "limit",
    ]
  ),
  async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(403).json(
          toLogObject({
            action: `${req.method} ${req.path}`,
            response: {
              error: "Forbidden",
            },
            parameters: req.parameters,
          })
        );
      }

      const response = {
        data: await getStageScores(req.session.user, {
          ...req.parameters,
          flattenStudent: true,
          flattenQuestion: true,
        }),
        hasNext: false,
      };

      if (typeof req.parameters.limit !== "undefined") {
        const limit = Number(req.parameters.limit);
        if (limit === response.data.length) {
          response.hasNext = true;
        }
      }

      res.status(200).json(
        toLogObject({
          action: `${req.method} ${req.path}`,
          response: response,
          parameters: req.parameters,
        })
      );
    } catch (err) {
      console.error(err);
      res.status(500).json(
        toLogObject({
          action: `${req.method} ${req.path}`,
          response: {
            error: "Server Error",
            rawError: err.toString(),
          },
          parameters: req.parameters,
        })
      );
    }
  }
);

/**
 * Get Boss Scores for Report
 */
router.get(
  "/report/boss",
  checkparams(
    "query",
    [],
    [
      "startTime",
      "endTime",
      "studentId",
      "school",
      "room",
      "grade",
      "stage",
      "prevIdStart",
      "limit",
    ]
  ),
  async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(403).json(
          toLogObject({
            action: `${req.method} ${req.path}`,
            response: {
              error: "Forbidden",
            },
            parameters: req.parameters,
          })
        );
      }

      const response = {
        data: await getBossScores(req.session.user, {
          ...req.parameters,
          flattenStudent: true,
          flattenQuestion: true,
        }),
        hasNext: false,
      };

      if (typeof req.parameters.limit !== "undefined") {
        const limit = Number(req.parameters.limit);
        if (limit === response.data.length) {
          response.hasNext = true;
        }
      }

      res.status(200).json(
        toLogObject({
          action: `${req.method} ${req.path}`,
          response: response,
          parameters: req.parameters,
        })
      );
    } catch (err) {
      console.error(err);
      res.status(500).json(
        toLogObject({
          action: `${req.method} ${req.path}`,
          response: {
            error: "Server Error",
            rawError: err.toString(),
          },
          parameters: req.parameters,
        })
      );
    }
  }
);

module.exports = router;
