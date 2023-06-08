const express = require("express");
const { toLogObject } = require("../utils/utils");

const StageScoreModel = require("../models/stage-score");
const StageQuestionModel = require("../models/stage-question");

const OldScoreModel = require("../models/old-score");

const router = express.Router();

router.post("/maintain/restore-score", async (req, res) => {
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

    await Promise.all([
      StageQuestionModel.deleteMany({ scoreId: null }),
      StageScoreModel.deleteMany({
        timestamp: {
          $gte: new Date("2021-02-12T08:09:25.101Z"),
          $lte: new Date("2021-09-14T01:47:48.222Z"),
        },
        difficulty: { $ne: 0 },
      }),
    ]);

    const response = {
      fixedOldScores: 0,
      insertedStageQuestions: 0,
    };
    const oldScoreDocs = await OldScoreModel.find({});
    const stageQuestionScores = [];

    const playCountTable = [];
    const stageScoreDocs = oldScoreDocs.map((oldScore) => {
      let targetPlayCount = playCountTable.find(
        (ele) =>
          ele.studentId === oldScore.studentId && ele.stage === oldScore.stage
      );
      if (!targetPlayCount) {
        targetPlayCount = {
          studentId: oldScore.studentId,
          stage: oldScore.stage,
          playCount: 0,
        };
        playCountTable.push(targetPlayCount);
      }
      targetPlayCount.playCount += 1;

      const starCount =
        oldScore.alphabets.length > 0
          ? Math.min(
              Math.ceil((oldScore.score / oldScore.alphabets.length) * 5),
              5
            )
          : 5;

      const stageScoreDoc = new StageScoreModel({
        studentId: oldScore.studentId,
        timestamp: oldScore.timestamp,
        stage: oldScore.stage,
        difficulty: oldScore.difficulty,
        playCount: targetPlayCount.playCount,
        score: oldScore.score,
        maxScore: oldScore.maxScore || oldScore.score,
        duration: oldScore.duration,
        star: starCount,
      });

      for (let i = 0; i < oldScore.alphabets.length; i++) {
        // check alphabets
        let alphabet = oldScore.alphabets[i];
        if (/^\d/.test(alphabet) && Number.isInteger(Number(alphabet))) {
          alphabet = String.fromCharCode(Number(alphabet));
        }

        stageQuestionScores.push(
          new StageQuestionModel({
            stageScoreId: stageScoreDoc._id,
            questionNo: i + 1,
            questionAlphabet: alphabet,
            questionWord: alphabet,
            answerAlphabet: alphabet,
            answerDuration: oldScore.duration / oldScore.alphabets.length,
            isCorrect: Boolean(oldScore.answerCorrects[i]),
            score: Number(oldScore.answerScores[i]),
          })
        );
      }

      return stageScoreDoc;
    });

    await Promise.all([
      StageScoreModel.bulkSave(stageScoreDocs),
      StageQuestionModel.bulkSave(stageQuestionScores),
    ]);

    response.fixedOldScores = stageScoreDocs.length;
    response.insertedStageQuestions = stageQuestionScores.length;

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
