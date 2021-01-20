const express = require("express");
const { toLogObject, filterParams } = require("../utils");
const StudentModel = require("../models/student");
const ScoreModel = require("../models/score");
const router = express.Router();

/**
 * Post Score to Database
 */
router.post("/score", async (req, res) => {
  const action = `${req.method} ${req.path}`;
  const params = [
    "firstName",
    "lastName",
    "gender",
    "grade",
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
  const parameters = filterParams(req.body, params);

  try {
    const missingParams = [];
    for (const param of params) {
      if (typeof parameters[param] === "undefined") {
        missingParams.push(param);
      }
    }

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

    const firstName = parameters.firstName;
    const lastName = parameters.lastName;
    let gender = "others";
    switch (parameters.gender) {
      case "m":
      case "male":
        gender = "male";
        break;
      case "f":
      case "female":
        gender = "female";
        break;
    }

    const grade = parameters.grade;
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

    let studentDoc = await StudentModel.findOne({
      firstName,
      lastName,
    });

    if (studentDoc === null) {
      studentDoc = new StudentModel({
        firstName,
        lastName,
        gender,
        grade,
      });
    } else {
      studentDoc.gender = gender;
      studentDoc.grade = grade;
      studentDoc.lastUpdateTimestamp = new Date();
    }
    await studentDoc.save();

    const scoreDoc = new ScoreModel({
      studentId: studentDoc._id,
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
    console.error(err);
    res.status(500).json(
      toLogObject({
        action: "PUT /score",
        response: {
          error: "Server Error",
          rawError: err.toString(),
        },
        parameters,
      })
    );
  }
});

module.exports = router;
