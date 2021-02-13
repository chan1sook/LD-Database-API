const express = require("express");
const { toLogObject, filterParams, checkMissingParams } = require("../utils");
const StudentModel = require("../models/student");
const ScoreModel = require("../models/score");
const router = express.Router();

/**
 * Post Score to Database
 */
router.post("/score", async (req, res) => {
  const action = `${req.method} ${req.path}`;
  const params = [
    "_id",
    "stage",
    "minParScore",
    "maxParScore",
    "score",
    "minParDuration",
    "maxParDuration",
    "duration",
    "difficulty",
    "scoreDifficultyFactor",
    "durationDifficultyFactor",
  ];
  const optionalParams = ["stage"];
  const parameters = filterParams(req.body, params, optionalParams);
  const missingParams = checkMissingParams(req.body, params, optionalParams);

  try {
    if (missingParams.length > 0) {
      const strMissingParams = missingParams.join(", ");
      return res.status(400).json(
        toLogObject({
          action,
          response: {
            error: `Missing Parameter(s): ${strMissingParams}`,
          },
          parameters,
        })
      );
    }

    const minParScore = parameters.minParScore;
    const maxParScore = parameters.maxParScore;
    if (minParScore > maxParScore) {
      return res.status(400).json(
        toLogObject({
          action,
          response: {
            error: `maxParScore must be greater or equal (>=) minParScore`,
          },
          parameters,
        })
      );
    }

    const _id = parameters._id;

    const studentDoc = await StudentModel.findById(_id);
    if (studentDoc === null) {
      return res.status(404).json(
        toLogObject({
          action,
          response: {
            error: `Student _id = '${_id}' Not found`,
          },
          parameters,
        })
      );
    }

    const stage = parameters.stage;
    const score = parameters.score;
    const minParDuration = parameters.minParDuration;
    const maxParDuration = parameters.maxParDuration;
    if (minParDuration > maxParDuration) {
      return res.status(400).json(
        toLogObject({
          action,
          response: {
            error: `maxParDuration must be greater or equal (>=) minParDuration`,
          },
          parameters,
        })
      );
    }

    const duration = parameters.duration;
    const difficulty = parameters.difficulty;
    const scoreDifficultyFactor = parameters.scoreDifficultyFactor;
    const durationDifficultyFactor = parameters.durationDifficultyFactor;

    const scoreDoc = new ScoreModel({
      studentId: studentDoc._id,
      stage,
      minParScore,
      maxParScore,
      score,
      minParDuration,
      maxParDuration,
      duration,
      difficulty,
      scoreDifficultyFactor,
      durationDifficultyFactor,
    });
    await scoreDoc.save();

    const response = scoreDoc.toJSON();
    response.difficultyAdjustment = scoreDoc.difficultyAdjustment;
    response.nextDifficulty = scoreDoc.nextDifficulty;
    const deleteParams = ["studentId", "_id", "__v", "countStatistic"];
    for (const param of deleteParams) {
      delete response[param];
    }

    res.status(200).json(
      toLogObject({
        action,
        response,
        parameters,
      })
    );
  } catch (err) {
    if (err.message.includes("Cast to ObjectId failed")) {
      res.status(400).json(
        toLogObject({
          action,
          response: {
            error: `Student _id = '${parameters._id}' Not found`,
          },
          parameters,
        })
      );
    } else {
      console.error(err);
      res.status(500).json(
        toLogObject({
          action,
          response: {
            error: "Server Error",
            rawError: err.toString(),
          },
          parameters,
        })
      );
    }
  }
});

module.exports = router;
