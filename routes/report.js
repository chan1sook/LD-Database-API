const express = require("express");
const dayjs = require("dayjs");
require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");
const { fetchStudents: fetchScoresSchool } = require("../utils/fetch");
const { toLogObject } = require("../utils/utils");
dayjs.extend(buddhistEra);

const router = express.Router();

/**
 * LD Report - Login Page
 */
router.get("/report/login", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/report");
  }

  res.status(200).render("login");
});

/**
 * LD Report - Register Page
 */
router.get("/report/register", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/report");
  }

  res.status(200).render("register");
});

/**
 * LD Report - Report Page
 */
router.get("/report", async (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/report/login");
  }

  res.status(200).render("report", {
    role: req.session.user.role,
    username: `${req.session.user.firstName} ${req.session.user.lastName}`,
  });
});

/**
 * Get All Filter avaiables
 */
router.get("/scores/filters", async (req, res) => {
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

    const filters = {
      schools: [],
      rooms: [],
      grades: [],
    };
    let studentDocs;
    switch (req.session.user.role) {
      case "student":
        filters.schools[0] = req.session.user.school;
        filters.rooms[0] = req.session.user.room;
        filters.grades[0] = req.session.user.grade;
        break;
      case "teacher":
        studentDocs = await fetchScoresSchool(req.session.user.school);
        filters.schools[0] = req.session.user.school;
        filters.rooms = Array.from(new Set(studentDocs.map((doc) => doc.room)));
        filters.grades = Array.from(
          new Set(studentDocs.map((doc) => doc.grade))
        );
        filters.rooms.sort();
        filters.grades.sort();
        break;
      case "school":
      case "admin":
        studentDocs = await fetchScoresSchool();
        filters.schools = Array.from(
          new Set(studentDocs.map((doc) => doc.school))
        );
        filters.rooms = Array.from(new Set(studentDocs.map((doc) => doc.room)));
        filters.grades = Array.from(
          new Set(studentDocs.map((doc) => doc.grade))
        );
        filters.schools.sort();
        filters.rooms.sort();
        filters.grades.sort();
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
        response: filters,
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

/**
 * LD Report - Student Page
 */
router.get("/report/student/:id", async (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/report/login");
  }

  switch (req.session.user.role) {
    case "student":
      if (req.params.id !== req.session.user._id) {
        return res.status(403).send("Forbidden");
      }
      break;
  }

  res.status(200).render("student", {
    _id: req.params.id,
    username: `${req.session.user.firstName} ${req.session.user.lastName}`,
  });
});

module.exports = router;
