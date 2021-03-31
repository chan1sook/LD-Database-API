const express = require("express");
const bcrypt = require("bcrypt");

const {
  toLogObject,
  filterParams,
  checkMissingParams,
  studentDocsToCSV,
  studentDocsToXLSX,
  studentDocsToJSON,
} = require("../utils");
const StudentModel = require("../models/student");
const ScoreModel = require("../models/score");
const router = express.Router();

/**
 * Register Student
 */
router.post("/register", async (req, res) => {
  const action = `${req.method} ${req.path}`;
  const params = [
    "username",
    "password",
    "firstName",
    "lastName",
    "gender",
    "grade",
  ];
  const parameters = filterParams(req.body, params);
  const missingParams = checkMissingParams(parameters, params);
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

    const username = parameters.username;
    const hashedPassword = await bcrypt.hash(parameters.password, 12);
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

    const studentDoc = new StudentModel({
      username,
      hashedPassword,
      firstName,
      lastName,
      gender,
      grade,
    });
    await studentDoc.save();

    const response = studentDoc.toJSON();
    const deleteParams = ["_id", "__v", "hashedPassword"];
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
    if (err.message.includes("E11000")) {
      res.status(400).json(
        toLogObject({
          action,
          response: {
            error: "Username Duplicate",
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
/**
 * Login Student
 */
router.post("/login", async (req, res) => {
  const action = `${req.method} ${req.path}`;
  const params = ["username", "password"];
  const parameters = filterParams(req.body, params);
  const missingParams = checkMissingParams(parameters, params);
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

    const username = parameters.username;
    const studentDoc = await StudentModel.findOne({
      username,
    })
      .select("+hashedPassword")
      .exec();

    if (!studentDoc) {
      res.status(403).json(
        toLogObject({
          action,
          response: {
            error: "Invalid Username/Password",
          },
          parameters,
        })
      );
    }

    const isPasswordMatch = await bcrypt.compare(
      parameters.password,
      studentDoc.hashedPassword
    );
    if (!isPasswordMatch) {
      res.status(403).json(
        toLogObject({
          action,
          response: {
            error: "Invalid Username/Password",
          },
          parameters,
        })
      );
    }

    const response = studentDoc.toJSON();
    const deleteParams = ["__v", "hashedPassword"];
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

/**
 * Get Student Data
 */
router.get("/student", async (req, res) => {
  const action = `${req.method} ${req.path}`;
  const params = ["_id"];
  const optionalParams = ["stage"];
  const parameters = filterParams(req.query, params, optionalParams);
  const missingParams = checkMissingParams(parameters, params, optionalParams);
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

    const _id = parameters._id;
    const stage = typeof parameters.stage === "string" ? parameters.stage : "";

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

    const response = studentDoc.toJSON();
    response.stage = stage;
    response.currentDifficulty = await studentDoc.currentDifficulty(stage);
    response.scoreRecordCount = await studentDoc.scoreRecordCount(stage);
    const deleteParams = ["_id", "__v"];
    for (const param of deleteParams) {
      delete response[param];
    }

    const filter = {
      studentId: studentDoc._id,
      countStatistic: true,
      stage: typeof stage === "string" ? stage : "",
    };
    const scoreArray = await ScoreModel.find(filter)
      .sort({ timestamp: -1 })
      .limit(studentDoc.maxScoreDisplay);
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

/**
 * Export Student Data
 */
router.get("/export", async (req, res) => {
  const action = `${req.method} ${req.path}`;
  const params = ["_id"];
  const optionalParams = ["format", "stage", "limit"];
  const parameters = filterParams(req.query, params, optionalParams);
  const missingParams = checkMissingParams(parameters, params, optionalParams);
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

    const _id = parameters._id;
    const stage =
      typeof parameters.stage === "string" ? parameters.stage : undefined;
    const limit =
      typeof parameters.limit === "string" ? parseInt(parameters.limit) : 0;
    let format =
      typeof parameters.format === "string" ? parameters.format : "csv";
    switch (format) {
      case "csv":
      case "json":
      case "xlsx":
        break;
      default:
        return res.status(400).json(
          toLogObject({
            action,
            response: {
              error: `Invalid Format: ${format} (except csv,json,xlsx)`,
            },
            parameters,
          })
        );
    }

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

    const filter = {
      studentId: studentDoc._id,
      countStatistic: true,
    };
    if (typeof stage === "string") {
      filter.stage = stage;
    }

    let queryPromise = ScoreModel.find(filter).sort({ timestamp: -1 });
    if (!isNaN(limit) && limit > 0) {
      queryPromise = queryPromise.limit(limit);
    }
    const scoreArray = await queryPromise.exec();
    if (format === "csv") {
      const csvStr = await studentDocsToCSV(scoreArray);
      const filename = `export-${studentDoc._id}-${Date.now()}.csv`;
      res.attachment(filename);
      res.status(200).send(csvStr);
    } else if (format === "xlsx") {
      const wb = studentDocsToXLSX(scoreArray);
      const filename = `export-${studentDoc._id}-${Date.now()}.xlsx`;
      wb.write(filename, res);
    } else if (format === "json") {
      const json = studentDocsToJSON(scoreArray);
      res.status(200).json(
        toLogObject({
          action,
          response: json,
          parameters,
        })
      );
    } else {
      return res.status(400).json(
        toLogObject({
          action,
          response: {
            error: `Invalide Format: ${format} (except csv,xlsx)`,
          },
          parameters,
        })
      );
    }
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

/**
 * Update Student data
 */
router.post("/update", async (req, res) => {
  const action = `${req.method} ${req.path}`;
  const params = ["_id"];
  const optionalParams = [
    "password",
    "firstName",
    "lastName",
    "gender",
    "grade",
    "saveData",
  ];

  const parameters = filterParams(req.body, params, optionalParams);
  const missingParams = checkMissingParams(parameters, params, optionalParams);
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

    if (parameters.password) {
      studentDoc.hashedPassword = await bcrypt.hash(parameters.password, 12);
    }
    if (parameters.firstName) {
      studentDoc.firstName = parameters.firstName;
    }
    if (parameters.lastName) {
      studentDoc.lastName = parameters.lastName;
    }
    if (parameters.gender) {
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
      studentDoc.gender = gender;
    }
    if (parameters.grade) {
      studentDoc.grade = parameters.grade;
    }
    if (typeof parameters.saveData !== "undefined") {
      studentDoc.saveData = parameters.saveData;
    }
    studentDoc.lastUpdateTimestamp = new Date();
    studentDoc.update();
    await studentDoc.save();

    const response = studentDoc.toJSON();
    const deleteParams = ["_id", "__v", "hashedPassword"];
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
