const express = require("express");
const { toLogObject } = require("../utils/utils");

const StageScoreModel = require("../models/stage-score");
const StageQuestionModel = require("../models/stage-question");
const BossScoreModel = require("../models/boss-score");
const BossQuestionModel = require("../models/boss-question");

const router = express.Router();

/**
 * Fix Date Problem
 */
router.post("/maintain/fix-date", async (req, res) => {
  try {
    if (
      !req.session ||
      !req.session.user ||
      req.session.user.role !== "admin"
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
    const filter = {
      timestamp: {
        $gte: new Date(2500, 1),
      },
    };

    const response = {
      fixedStageScores: 0,
      fixedBossScores: 0,
      fixedStageQuestions: 0,
      fixedBossQuestions: 0,
    };

    const problemStageScores = await StageScoreModel.find(filter);
    problemStageScores.forEach((doc) => {
      const oldDate = doc.timestamp.toISOString();
      const newDate = "2021" + oldDate.substr(4);
      doc.timestamp = new Date(newDate);
    });
    await StageScoreModel.bulkSave(problemStageScores);
    response.fixedStageScores = problemStageScores.length;

    const problemBossScores = await BossScoreModel.find(filter);
    problemBossScores.forEach((doc) => {
      const oldDate = doc.timestamp.toISOString();
      const newDate = "2021" + oldDate.substr(4);
      doc.timestamp = new Date(newDate);
    });
    await BossScoreModel.bulkSave(problemBossScores);
    response.fixedBossScores = problemBossScores.length;

    const problemStageQuestions = await StageQuestionModel.find(filter);
    problemStageQuestions.forEach((doc) => {
      const oldDate = doc.timestamp.toISOString();
      const newDate = "2021" + oldDate.substr(4);
      doc.timestamp = new Date(newDate);
    });
    await StageQuestionModel.bulkSave(problemStageQuestions);
    response.fixedStageQuestions = problemStageQuestions.length;

    const problemBossQuestions = await BossQuestionModel.find(filter);
    problemBossQuestions.forEach((doc) => {
      const oldDate = doc.timestamp.toISOString();
      const newDate = "2021" + oldDate.substr(4);
      doc.timestamp = new Date(newDate);
    });
    await BossQuestionModel.bulkSave(problemBossQuestions);
    response.fixedBossQuestions = problemBossQuestions.length;

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
});

module.exports = router;
