const express = require("express");

const { toLogObject } = require("../utils/utils");
const checkparams = require("../middlewares/checkparams");
const UserModel = require("../models/user");
const StageScoreModel = require("../models/stage-score");
const StageQuestionModel = require("../models/stage-question");
const BossScoreModel = require("../models/boss-score");
const BossQuestionModel = require("../models/boss-question");

const {
  stageScoresToJSON,
  stageScoresToXLSX,
  bossScoresToXLSX,
  bossScoresToJSON,
} = require("../utils/data-transform");
const { getStageScores, getBossScores } = require("../utils/get-data");
const router = express.Router();

/**
 * Post Stage Score to Database
 */
router.put(
  "/score/stage",
  checkparams(
    "body",
    [
      "stage",
      "score",
      "maxScore",
      "duration",
      "difficulty",
      "star",
      "questions",
    ],
    ["timestamp"]
  ),
  async (req, res) => {
    try {
      if (
        !req.session ||
        !req.session.user ||
        req.session.user.role !== "student"
      ) {
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

      const _id = req.session.user._id;
      const userDoc = await UserModel.findById(_id);
      if (userDoc === null) {
        return res.status(500).json(
          toLogObject({
            action: `${req.method} ${req.path}`,
            response: {
              error: `Please login again!`,
            },
            parameters: req.parameters,
          })
        );
      }

      const timestamp = req.parameters.timestamp;
      const stage = req.parameters.stage;
      const score = req.parameters.score;
      const maxScore = req.parameters.maxScore;
      const duration = req.parameters.duration;
      const difficulty = req.parameters.difficulty;
      const star = req.parameters.star;
      const playCount = await StageScoreModel.countDocuments({
        studentId: userDoc._id,
        stage: stage,
      });
      const questions = req.parameters.questions;

      const stageScoreDoc = new StageScoreModel({
        studentId: userDoc._id,
        timestamp,
        stage,
        difficulty,
        playCount: playCount + 1,
        score,
        maxScore,
        duration,
        star,
      });

      const [_, stageQuestionDocs] = await Promise.all([
        stageScoreDoc.save(),
        StageQuestionModel.insertMany(
          questions.map((question, index) => {
            return {
              stageScoreId: stageScoreDoc._id,
              questionNo: index + 1,
              questionAlphabet: question.questionAlphabet,
              questionWord: question.questionWord,
              answerAlphabet: question.answerAlphabet,
              answerDuration: question.answerDuration,
              isCorrect: question.isCorrect,
              score: question.score,
            };
          })
        ),
      ]);

      const response = stageScoreDoc.toJSON();
      response.questions = stageQuestionDocs.map((question) =>
        question.toJSON()
      );

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
 * Post Boss Score to Database
 */
router.put(
  "/score/boss",
  checkparams(
    "body",
    [
      "stage",
      "score",
      "maxScore",
      "duration",
      "difficulty",
      "star",
      "questions",
    ],
    ["timestamp"]
  ),
  async (req, res) => {
    try {
      if (
        !req.session ||
        !req.session.user ||
        req.session.user.role !== "student"
      ) {
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

      const _id = req.session.user._id;
      const userDoc = await UserModel.findById(_id);
      if (userDoc === null) {
        return res.status(500).json(
          toLogObject({
            action: `${req.method} ${req.path}`,
            response: {
              error: `Please login again!`,
            },
            parameters: req.parameters,
          })
        );
      }

      const timestamp = req.parameters.timestamp;
      const stage = req.parameters.stage;
      const score = req.parameters.score;
      const maxScore = req.parameters.maxScore;
      const duration = req.parameters.duration;
      const difficulty = req.parameters.difficulty;
      const star = req.parameters.star;
      const playCount = await BossScoreModel.countDocuments({
        studentId: userDoc._id,
        stage: stage,
      });
      const questions = req.parameters.questions;

      const bossScoreDoc = new BossScoreModel({
        studentId: userDoc._id,
        timestamp,
        stage,
        difficulty,
        playCount: playCount + 1,
        score,
        maxScore,
        duration,
        star,
      });

      const [_, bossQuestionDocs] = await Promise.all([
        bossScoreDoc.save(),
        BossQuestionModel.insertMany(
          questions.map((question, index) => {
            return {
              bossScoreId: bossScoreDoc._id,
              questionNo: index + 1,
              questionAlphabet: question.questionAlphabet,
              answerAlphabet: question.answerAlphabet,
              answerDuration: question.answerDuration,
              isCorrect: question.isCorrect,
              score: question.score,
            };
          })
        ),
      ]);

      const response = bossScoreDoc.toJSON();
      response.questions = bossQuestionDocs.map((question) =>
        question.toJSON()
      );

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
 * Get Stage Scores
 */
router.get(
  "/scores/stage",
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
      "flattenStudent",
      "flattenQuestion",
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

      const response = await getStageScores(req.session.user, req.parameters);

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
 * Get Boss Scores
 */
router.get(
  "/scores/boss",
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
      "flattenStudent",
      "flattenQuestion",
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

      const response = await getBossScores(req.session.user, req.parameters);

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
 * Export Stage Scores
 */
router.get(
  "/export/stage",
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

      const stageScoreDocs = await getStageScores(req.session.user, {
        ...req.parameters,
        flattenStudent: true,
        flattenQuestion: true,
      });

      let filename, workbook;
      switch (format) {
        case "csv":
          filename = `stage-scores-${Date.now()}.csv`;
          workbook = stageScoresToXLSX(stageScoreDocs);
          res.attachment(filename);
          workbook.csv.write(res);
          break;
        case "xlsx":
          filename = `stage-scores-${Date.now()}.xlsx`;
          workbook = stageScoresToXLSX(stageScoreDocs);
          res.attachment(filename);
          workbook.xlsx.write(res);
          break;
        case "json":
        default:
          res.status(200).json(stageScoresToJSON(stageScoreDocs));
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
 * Export Stage Scores
 */
router.get(
  "/export/boss",
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

      const bossScoreDocs = await getBossScores(req.session.user, {
        ...req.parameters,
        flattenStudent: true,
        flattenQuestion: true,
      });

      let filename, workbook;
      switch (format) {
        case "csv":
          filename = `boss-scores-${Date.now()}.csv`;
          workbook = bossScoresToXLSX(bossScoreDocs);
          res.attachment(filename);
          workbook.csv.write(res);
          break;
        case "xlsx":
          filename = `boss-scores-${Date.now()}.xlsx`;
          workbook = bossScoresToXLSX(bossScoreDocs);
          res.attachment(filename);
          workbook.xlsx.write(res);
          break;
        case "json":
        default:
          res.status(200).json(bossScoresToJSON(bossScoreDocs));
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

module.exports = router;
