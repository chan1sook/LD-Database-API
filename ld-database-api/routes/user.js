const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");

const { toLogObject, checkMissingParams } = require("../utils/utils");
const checkparams = require("../middlewares/checkparams");
const UserModel = require("../models/user");
const LoginLogModel = require("../models/login-log");
const router = express.Router();

/**
 * Register User
 */
router.post(
  "/register",
  checkparams(
    "body",
    ["username", "password", "firstName", "lastName", "gender"],
    ["school", "room", "grade", "role"]
  ),
  async (req, res) => {
    try {
      const username = req.parameters.username;
      const hashedPassword = await bcrypt.hash(req.parameters.password, 12);
      const firstName = req.parameters.firstName;
      const lastName = req.parameters.lastName;
      let gender = "others";
      switch (req.parameters.gender) {
        case "m":
        case "male":
          gender = "male";
          break;
        case "f":
        case "female":
          gender = "female";
          break;
      }

      const role = req.parameters.role || "student";
      const school = req.parameters.school || "";
      const room = req.parameters.room || "";
      const grade = req.parameters.grade || "";

      let missingParams;
      let strMissingParams;
      switch (role) {
        case "admin":
          if (
            !req.session ||
            !req.session.user ||
            req.session.user.role !== "admin"
          ) {
            return res.status(400).json(
              toLogObject({
                action: `${req.method} ${req.path}`,
                response: {
                  error: `Invalid Role`,
                },
                parameters: req.parameters,
              })
            );
          }
          break;
        case "teacher":
        case "school":
          missingParams = checkMissingParams(req.parameters, ["school"]);
          if (missingParams.length > 0) {
            strMissingParams = missingParams.join(", ");
            return res.status(400).json(
              toLogObject({
                action: `${req.method} ${req.path}`,
                response: {
                  error: `Missing Parameter(s): ${strMissingParams}`,
                },
                parameters: req.parameters,
              })
            );
          }
          break;
        case "student":
          missingParams = checkMissingParams(req.parameters, [
            "school",
            "room",
            "grade",
          ]);
          if (missingParams.length > 0) {
            strMissingParams = missingParams.join(", ");
            return res.status(400).json(
              toLogObject({
                action: `${req.method} ${req.path}`,
                response: {
                  error: `Missing Parameter(s): ${strMissingParams}`,
                },
                parameters: req.parameters,
              })
            );
          }
          break;
        default:
          return res.status(400).json(
            toLogObject({
              action: `${req.method} ${req.path}`,
              response: {
                error: `Invalid Role`,
              },
              parameters: req.parameters,
            })
          );
          break;
      }

      const userDoc = new UserModel({
        username,
        hashedPassword,
        firstName,
        lastName,
        gender,
        school,
        room,
        grade,
        role,
      });
      await userDoc.save();

      const response = userDoc.toJSON();
      const deleteParams = ["_id", "__v", "hashedPassword"];
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
      if (err.message.includes("E11000")) {
        res.status(400).json(
          toLogObject({
            action: `${req.method} ${req.path}`,
            response: {
              error: "Username Duplicate",
            },
            parameters: req.parameters,
          })
        );
      } else {
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
  }
);

/**
 * Login User
 */
router.post(
  "/login",
  checkparams("body", ["username", "password"], ["loginFrom", "macAddress"]),
  async (req, res) => {
    try {
      const username = req.parameters.username;
      const userDoc = await UserModel.findOne({
        username,
      })
        .select("+hashedPassword")
        .exec();

      const loginFrom = req.parameters.loginFrom || "unknown";
      const macAddress = req.parameters.macAddress || uuid();

      if (!userDoc) {
        return res.status(403).json(
          toLogObject({
            action: `${req.method} ${req.path}`,
            response: {
              error: "Invalid Username/Password",
            },
            parameters: req.parameters,
          })
        );
      }

      const isPasswordMatch = await bcrypt.compare(
        req.parameters.password,
        userDoc.hashedPassword
      );
      if (!isPasswordMatch) {
        return res.status(403).json(
          toLogObject({
            action: `${req.method} ${req.path}`,
            response: {
              error: "Invalid Username/Password",
            },
            parameters: req.parameters,
          })
        );
      }

      const loginLogDoc = new LoginLogModel({
        userId: userDoc._id,
        loginFrom,
        macAddress,
      });
      await loginLogDoc.save();

      const response = userDoc.toJSON();
      const deleteParams = ["__v", "hashedPassword"];
      for (const param of deleteParams) {
        delete response[param];
      }

      Object.assign(response, {
        loginFrom,
        macAddress,
      });

      req.session.user = response;

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
 * Logout
 */
router.post("/logout", (req, res) => {
  const logout = delete req.session.user;
  res.status(200).json(
    toLogObject({
      action: `${req.method} ${req.path}`,
      response: {
        logout,
      },
    })
  );
});

/**
 * Get User Info
 */
router.get("/user", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(200).json(
      toLogObject({
        action: `${req.method} ${req.path}`,
        response: {
          role: "guest",
        },
      })
    );
  } else {
    return res.status(200).json(
      toLogObject({
        action: `${req.method} ${req.path}`,
        response: req.session.user,
      })
    );
  }
});

/**
 * Update User data
 */
router.patch(
  "/user",
  checkparams(
    "body",
    [],
    [
      "password",
      "firstName",
      "lastName",
      "gender",
      "school",
      "room",
      "grade",
      "saveData",
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

      if (req.parameters.password) {
        userDoc.hashedPassword = await bcrypt.hash(req.parameters.password, 12);
      }
      if (req.parameters.firstName) {
        userDoc.firstName = req.parameters.firstName;
      }
      if (req.parameters.lastName) {
        userDoc.lastName = req.parameters.lastName;
      }
      if (req.parameters.gender) {
        let gender = "others";
        switch (req.parameters.gender) {
          case "m":
          case "male":
            gender = "male";
            break;
          case "f":
          case "female":
            gender = "female";
            break;
        }
        userDoc.gender = gender;
      }
      if (req.parameters.school) {
        userDoc.school = req.parameters.school;
      }
      if (req.parameters.grade) {
        userDoc.grade = req.parameters.grade;
      }
      if (req.parameters.room) {
        userDoc.room = req.parameters.room;
      }
      if (typeof req.parameters.saveData !== "undefined") {
        userDoc.saveData = req.parameters.saveData;
      }
      userDoc.lastUpdateTimestamp = new Date();
      await userDoc.save();

      const response = userDoc.toJSON();
      const deleteParams = ["__v", "hashedPassword"];
      for (const param of deleteParams) {
        delete response[param];
      }

      Object.assign(response, {
        loginFrom: req.session.user.loginFrom,
        macAddress: req.session.user.macAddress,
      });

      req.session.user = response;

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
 * Identify MAC Address
 */
router.get(
  "/identify/loginfrom",
  checkparams("query", ["macAddress"]),
  async (req, res) => {
    try {
      const loginLogDoc = await LoginLogModel.findOne({
        macAddress: req.parameters.macAddress,
      }).sort({ _id: "desc" });

      if (loginLogDoc) {
        return res.status(200).json(
          toLogObject({
            action: `${req.method} ${req.path}`,
            response: {
              loginFrom: loginLogDoc.loginFrom,
            },
            parameters: req.parameters,
          })
        );
      } else {
        return res.status(404).json(
          toLogObject({
            action: `${req.method} ${req.path}`,
            response: {
              error: "No Data",
            },
            parameters: req.parameters,
          })
        );
      }
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
