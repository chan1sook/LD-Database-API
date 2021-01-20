const express = require("express");
const { toLogObject, filterParams } = require("../utils");
const StudentModel = require("../models/student");
const ScoreModel = require("../models/score");
const router = express.Router();

/**
 * Get Student Data
 */
router.get("/student", async (req, res) => {
  const action = `${req.method} ${req.path}`;
  const params = ["firstName", "lastName"];
  const parameters = filterParams(req.query, params);
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

    const studentDoc = await StudentModel.findOne({
      firstName,
      lastName,
    });

    if (studentDoc === null) {
      return res.status(404).json(
        toLogObject({
          action,
          response: {
            error: `Student '${firstName} ${lastName}' Not found`,
          },
          parameters,
        })
      );
    }

    const response = studentDoc.toJSON();
    response.currentDifficulty = await studentDoc.currentDifficulty;
    response.scoreRecordCount = await studentDoc.scoreRecordCount;
    const deleteParams = ["_id", "__v"];
    for (const param of deleteParams) {
      delete response[param];
    }

    const scoreArray = await ScoreModel.find({
      studentId: studentDoc._id,
      countStatistic: true,
    })
      .sort({ timestamp: -1 })
      .limit(this.maxScoreDisplay);
    response.scores = scoreArray.map((doc) => {
      const result = doc.toJSON();
      result.difficultyAdjustment = doc.difficultyAdjustment;
      const deleteParams = ["studentId", "_id", "__v", "countStatistic"];
      for (const param of deleteParams) {
        delete result[param];
      }
      return result;
    });

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
        action,
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
