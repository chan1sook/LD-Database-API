const mongoose = require("mongoose");
const UserModel = require("../models/user");
const ScoreModel = require("../models/score");

module.exports.fetchStudentId = async (_id) => {
  const matchAggregate = {
    role: "student",
    _id: mongoose.Types.ObjectId(_id),
  };

  const studentDocs = await UserModel.aggregate([
    {
      $match: matchAggregate,
    },
    {
      $lookup: {
        from: "scores",
        let: { uid: "$_id" },
        as: "scores",
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$studentId", "$$uid"] },
                  { $eq: ["$countStatistic", true] },
                ],
              },
            },
          },
          { $sort: { _id: -1 } },
          {
            $project: {
              _id: 1,
              timestamp: 1,
              stage: 1,
              maxScore: 1,
              score: 1,
              duration: 1,
              difficulty: 1,
              alphabets: 1,
              answerCorrects: 1,
              answerScores: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        saveData: 1,
        username: 1,
        firstName: 1,
        lastName: 1,
        gender: 1,
        school: 1,
        grade: 1,
        room: 1,
        registerTimestamp: 1,
        lastUpdateTimestamp: 1,
        scores: 1,
      },
    },
  ]).exec();

  return studentDocs;
};

module.exports.fetchStudents = async (school, room, grade) => {
  const matchAggregate = {
    role: "student",
  };
  if (typeof school !== "undefined") {
    matchAggregate.school = school;
  }
  if (typeof room !== "undefined") {
    matchAggregate.room = room;
  }
  if (typeof grade !== "undefined") {
    matchAggregate.grade = grade;
  }

  const studentDocs = await UserModel.aggregate([
    {
      $match: matchAggregate,
    },
    {
      $lookup: {
        from: "scores",
        let: { uid: "$_id" },
        as: "scores",
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$studentId", "$$uid"] },
                  { $eq: ["$countStatistic", true] },
                ],
              },
            },
          },
          { $sort: { _id: -1 } },
          {
            $project: {
              _id: 1,
              timestamp: 1,
              stage: 1,
              maxScore: 1,
              score: 1,
              duration: 1,
              difficulty: 1,
              alphabets: 1,
              answerCorrects: 1,
              answerScores: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        saveData: 1,
        username: 1,
        firstName: 1,
        lastName: 1,
        gender: 1,
        school: 1,
        grade: 1,
        room: 1,
        registerTimestamp: 1,
        lastUpdateTimestamp: 1,
        scores: 1,
      },
    },
  ]).exec();

  return studentDocs;
};

module.exports.fetchScoresByStudentId = async (_id) => {
  const matchAggregate = {
    "user.role": "student",
    "user._id": mongoose.Types.ObjectId(_id),
  };

  const scoreDocs = await ScoreModel.aggregate([
    {
      $match: {
        countStatistic: true,
      },
    },
    {
      $lookup: {
        from: "users",
        let: { uid: "$studentId" },
        as: "user",
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$uid"] }],
              },
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$user",
      },
    },
    {
      $match: matchAggregate,
    },
    {
      $project: {
        _id: 1,
        timestamp: 1,
        stage: 1,
        score: 1,
        maxScore: 1,
        duration: 1,
        difficulty: 1,
        alphabets: 1,
        answerCorrects: 1,
        answerScores: 1,
        studentId: "$user._id",
        username: "$user.username",
        firstName: "$user.firstName",
        lastName: "$user.lastName",
        gender: "$user.gender",
        school: "$user.school",
        grade: "$user.grade",
        room: "$user.room",
      },
    },
    { $sort: { studentId: 1, stage: 1, _id: 1 } },
  ]).exec();
  return scoreDocs;
};

module.exports.fetchScoresByStudents = async (school, room, grade) => {
  const matchAggregate = {
    "user.role": "student",
  };
  if (typeof school !== "undefined") {
    matchAggregate["user.school"] = school;
  }
  if (typeof room !== "undefined") {
    matchAggregate["user.room"] = room;
  }
  if (typeof grade !== "undefined") {
    matchAggregate["user.grade"] = grade;
  }

  const scoreDocs = await ScoreModel.aggregate([
    {
      $match: {
        countStatistic: true,
      },
    },
    {
      $lookup: {
        from: "users",
        let: { uid: "$studentId" },
        as: "user",
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$_id", "$$uid"] }],
              },
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$user",
      },
    },
    {
      $match: matchAggregate,
    },
    {
      $project: {
        _id: 1,
        timestamp: 1,
        stage: 1,
        score: 1,
        maxScore: 1,
        duration: 1,
        difficulty: 1,
        alphabets: 1,
        answerCorrects: 1,
        answerScores: 1,
        studentId: "$user._id",
        username: "$user.username",
        firstName: "$user.firstName",
        lastName: "$user.lastName",
        gender: "$user.gender",
        school: "$user.school",
        grade: "$user.grade",
        room: "$user.room",
      },
    },
    { $sort: { studentId: 1, stage: 1, _id: 1 } },
  ]).exec();
  return scoreDocs;
};
