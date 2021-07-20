const express = require("express");
const { toLogObject } = require("../utils/utils");
const checkparams = require("../middlewares/checkparams");
const UserModel = require("../models/user");
const ScoreModel = require("../models/score");
const { scoresToCSV, scoresToXLSX } = require("../utils/data-transform");
const {
  fetchStudentId,
  fetchStudents,
  fetchScoresByStudentId,
  fetchScoresByStudents,
} = require("../utils/fetch");
const { StudentsData } = require("../utils/student-data");
const router = express.Router();

/**
 * Post Score to Database
 */
router.put(
  "/score",
  checkparams(
    "body",
    ["stage", "score", "maxScore", "duration", "difficulty"],
    ["alphabets", "answerCorrects", "answerScores"]
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

      const stage = req.parameters.stage;
      const score = req.parameters.score;
      const maxScore = req.parameters.maxScore;
      const duration = req.parameters.duration;
      const difficulty = req.parameters.difficulty;
      const alphabets = req.parameters.alphabets || [];
      const answerCorrects = req.parameters.answerCorrects || [];
      const answerScores = req.parameters.answerScores || [];

      const scoreDoc = new ScoreModel({
        studentId: userDoc._id,
        stage,
        score,
        maxScore,
        duration,
        difficulty,
        alphabets,
        answerCorrects,
        answerScores,
      });
      await scoreDoc.save();

      const response = scoreDoc.toJSON();
      const deleteParams = ["countStatistic"];
      for (const param of deleteParams) {
        delete response[param];
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
 * Get Scores
 */
router.get(
  "/scores",
  checkparams("query", [], ["school", "room", "grade", "_id"]),
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

      let studentDocs;
      switch (req.session.user.role) {
        case "student":
          studentDocs = await fetchStudentId(req.session.user._id);
          break;
        case "teacher":
          if (typeof req.parameters._id !== "undefined") {
            studentDocs = await fetchStudentId(req.parameters._id);
            if (studentDocs.length < 1) {
              return res.status(404).json(
                toLogObject({
                  action: `${req.method} ${req.path}`,
                  response: {
                    error: "Student _id not Found",
                  },
                  parameters: req.parameters,
                })
              );
            } else if (req.session.user.school !== studentDocs[0].school) {
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
          } else {
            studentDocs = await fetchStudents(
              req.session.user.school,
              req.parameters.room,
              req.parameters.grade
            );
          }
          break;
        case "school":
        case "admin":
          if (typeof req.parameters._id !== "undefined") {
            studentDocs = await fetchStudentId(req.parameters._id);
            if (studentDocs.length < 1) {
              return res.status(404).json(
                toLogObject({
                  action: `${req.method} ${req.path}`,
                  response: {
                    error: "Student _id not Found",
                  },
                  parameters: req.parameters,
                })
              );
            }
          } else {
            studentDocs = await fetchStudents(
              req.parameters.school,
              req.parameters.room,
              req.parameters.grade
            );
          }
          break;
        default:
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

      res.status(200).json(
        toLogObject({
          action: `${req.method} ${req.path}`,
          response: studentDocs,
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
 * Export Scores
 */
router.get(
  "/export",
  checkparams("query", [], ["format", "school", "room", "grade", "_id"]),
  async (req, res) => {
    try {
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

      let studentDocs;
      switch (req.session.user.role) {
        case "student":
          studentDocs = await fetchStudentId(req.session.user._id);
          break;
        case "teacher":
          if (typeof req.parameters._id !== "undefined") {
            studentDocs = await fetchStudentId(req.parameters._id);
            if (studentDocs.length < 1) {
              return res.status(404).json(
                toLogObject({
                  action: `${req.method} ${req.path}`,
                  response: {
                    error: "Student _id not Found",
                  },
                  parameters: req.parameters,
                })
              );
            } else if (req.session.user.school !== studentDocs[0].school) {
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
          } else {
            studentDocs = await fetchStudents(
              req.session.user.school,
              req.parameters.room,
              req.parameters.grade
            );
          }
          break;
        case "school":
        case "admin":
          if (typeof req.parameters._id !== "undefined") {
            studentDocs = await fetchStudentId(req.parameters._id);
            if (studentDocs.length < 1) {
              return res.status(404).json(
                toLogObject({
                  action: `${req.method} ${req.path}`,
                  response: {
                    error: "Student _id not Found",
                  },
                  parameters: req.parameters,
                })
              );
            }
          } else {
            studentDocs = await fetchStudents(
              req.parameters.school,
              req.parameters.room,
              req.parameters.grade
            );
          }
          break;
        default:
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

      studentDocs = new StudentsData(studentDocs);

      const scoreDocs = studentDocs.students.reduce((arr, student) => {
        const stageGroupScores = student.stageGroupScores.reduce((arr, ele) => {
          const substageScores = ele.substages.reduce((arr, ele) => {
            return arr.concat(
              ele.scores.map((ele, i) => {
                return {
                  ...ele,
                  firstName: student.firstName,
                  lastName: student.lastName,
                  gender: student.gender,
                  school: student.school,
                  grade: student.grade,
                  room: student.room,
                  playCount: i + 1,
                };
              })
            );
          }, []);
          return arr.concat(substageScores);
        }, []);
        return arr.concat(stageGroupScores);
      }, []);

      let filename;
      switch (format) {
        case "csv":
          filename = `export-${Date.now()}.csv`;
          const csvStr = await scoresToCSV(scoreDocs);
          res.attachment(filename);
          res.status(200).send(csvStr);
          break;
        case "xlsx":
          filename = `export-${Date.now()}.xlsx`;
          const wb = scoresToXLSX(scoreArray);
          wb.write(filename, res);
          break;
        case "json":
        default:
          res.status(200).json(scoreDocs);
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
