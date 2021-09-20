const tinygradient = require("tinygradient");
const dayjs = require("dayjs");

const UserModel = require("../models/user");
const StageScoreModel = require("../models/stage-score");
const StageQuestionModel = require("../models/stage-question");
const BossScoreModel = require("../models/boss-score");
const BossQuestionModel = require("../models/boss-question");

async function getStudentsByFilters({
  studentId,
  school,
  room,
  grade,
  prevIdStart,
  limit,
}) {
  if (typeof studentId !== "undefined") {
    return await UserModel.find({
      _id: studentId,
      role: "student",
    })
      .select("-saveData")
      .exec();
  }

  const studentFilter = {
    role: "student",
  };

  if (typeof school !== "undefined") {
    studentFilter.school = school;
  }
  if (typeof room !== "undefined") {
    studentFilter.room = room;
  }
  if (typeof grade !== "undefined") {
    studentFilter.grade = grade;
  }

  if (typeof prevIdStart !== "undefined") {
    studentFilter._id = {
      $gt: prevIdStart,
    };
  }

  let query = UserModel.find(studentFilter).select("-saveData");

  if (typeof limit !== "undefined") {
    query = query.limit(Number(limit));
  }
  return await query.exec();
}

async function getStudents(
  { role = "admin", _id, school: userSchool },
  { studentId, school, room, grade, prevIdStart, limit }
) {
  switch (role) {
    case "student":
      return await getStudentsByFilters({
        studentId: _id,
      });
    case "teacher":
      return await getStudentsByFilters({
        studentId,
        school: userSchool,
        room,
        grade,
        prevIdStart,
        limit,
      });
    case "school":
    case "expert":
    case "admin":
    default:
      return await getStudentsByFilters({
        studentId,
        school,
        room,
        grade,
        prevIdStart,
        limit,
      });
  }
}

module.exports.getStudents = getStudents;

async function getStageScoresByFilters({
  studentIds = [],
  stage,
  startTime,
  endTime,
  flattenQuestion,
  prevIdStart,
  limit,
}) {
  const stageScoreFilters = {
    studentId: {
      $in: studentIds,
    },
    timestamp: {
      $gte: new Date(0),
      $lte: new Date(),
    },
    countStatistic: true,
  };

  if (typeof stage !== "undefined") {
    stageScoreFilters.stage = stage;
  }

  if (typeof startTime !== "undefined") {
    const ts = Number(startTime);
    if (Number.isInteger(ts)) {
      stageScoreFilters.timestamp.$gte = new Date(ts);
    } else {
      stageScoreFilters.timestamp.$gte = new Date(startTime);
    }
  }

  if (typeof endTime !== "undefined") {
    const ts = Number(endTime);
    if (Number.isInteger(ts)) {
      stageScoreFilters.timestamp.$lte = new Date(ts);
    } else {
      stageScoreFilters.timestamp.$lte = new Date(endTime);
    }
  }

  if (Boolean(flattenQuestion)) {
    const stageScoreDocs = await StageScoreModel.find(stageScoreFilters);
    const stageQuestionsFilters = {
      stageScoreId: {
        $in: stageScoreDocs.map((stageScoreDoc) => stageScoreDoc._id),
      },
      countStatistic: true,
    };

    if (typeof prevIdStart !== "undefined") {
      stageQuestionsFilters._id = {
        $gt: prevIdStart,
      };
    }
    let query = StageQuestionModel.find(stageQuestionsFilters);
    if (typeof limit !== "undefined") {
      query = query.limit(Number(limit));
    }

    const stageQuestionsDocs = await query.exec();
    return stageQuestionsDocs.map((stageQuestionDoc) => {
      const result = stageQuestionDoc.toJSON();
      const targetStageScoreDoc = stageScoreDocs.find(
        (stageScoreDoc) =>
          stageScoreDoc._id.toString() ===
          stageQuestionDoc.stageScoreId.toString()
      );

      return {
        ...(targetStageScoreDoc ? targetStageScoreDoc.toJSON() : {}),
        ...result,
      };
    });
  } else {
    if (typeof prevIdStart !== "undefined") {
      stageScoreFilters._id = {
        $gt: prevIdStart,
      };
    }

    let query = StageScoreModel.find(stageScoreFilters);
    if (typeof limit !== "undefined") {
      query = query.limit(Number(limit));
    }

    const stageScoreDocs = await query.exec();

    const stageQuestionsDocs = await StageQuestionModel.find({
      stageScoreId: {
        $in: stageScoreDocs.map((stageScoreDoc) => stageScoreDoc._id),
      },
      countStatistic: true,
    });
    return stageScoreDocs.map((stageScoreDoc) => {
      const result = stageScoreDoc.toJSON();
      result.questions = stageQuestionsDocs
        .filter(
          (stageQuestionDoc) =>
            stageQuestionDoc.stageScoreId.toString() ===
            stageScoreDoc._id.toString()
        )
        .map((stageQuestionDoc) => stageQuestionDoc.toJSON());
      return result;
    });
  }
}

async function getStageScores(
  userData,
  {
    studentId,
    school,
    room,
    grade,
    stage,
    startTime,
    endTime,
    flattenStudent,
    flattenQuestion,
    prevIdStart,
    limit,
  }
) {
  if (Boolean(flattenStudent)) {
    const studentDocs = await getStudents(userData, {
      studentId,
      school,
      room,
      grade,
    });
    const studentIds = studentDocs.map((ele) => ele._id);
    const stageScoreDocs = await getStageScoresByFilters({
      studentIds,
      stage,
      startTime,
      endTime,
      flattenQuestion,
      prevIdStart,
      limit,
    });
    return stageScoreDocs.map((stageScoreDoc) => {
      const targetStudent = studentDocs.find(
        (studentDoc) =>
          studentDoc._id.toString() === stageScoreDoc.studentId.toString()
      );

      return {
        ...(targetStudent ? targetStudent.toJSON() : {}),
        ...stageScoreDoc,
      };
    });
  } else {
    const studentDocs = await getStudents(userData, {
      studentId,
      school,
      room,
      grade,
      prevIdStart,
      limit,
    });

    const studentIds = studentDocs.map((ele) => ele._id);
    const stageScoreDocs = await getStageScoresByFilters({
      studentIds,
      stage,
      startTime,
      endTime,
      flattenQuestion,
    });

    return studentDocs.map((studentDoc) => {
      const result = studentDoc.toJSON();
      result.scores = stageScoreDocs.filter(
        (stageScoreDoc) =>
          stageScoreDoc.studentId.toString() === result._id.toString()
      );
      return result;
    });
  }
}

module.exports.getStageScores = getStageScores;

async function getBossScoresByFilters({
  studentIds = [],
  stage,
  startTime,
  endTime,
  flattenQuestion,
  prevIdStart,
  limit,
}) {
  const bossScoreFilters = {
    studentId: {
      $in: studentIds,
    },
    timestamp: {
      $gte: new Date(0),
      $lte: new Date(),
    },
    countStatistic: true,
  };

  if (typeof stage !== "undefined") {
    bossScoreFilters.stage = stage;
  }

  if (typeof startTime !== "undefined") {
    const ts = Number(startTime);
    if (Number.isInteger(ts)) {
      bossScoreFilters.timestamp.$gte = new Date(ts);
    } else {
      bossScoreFilters.timestamp.$gte = new Date(startTime);
    }
  }

  if (typeof endTime !== "undefined") {
    const ts = Number(endTime);
    if (Number.isInteger(ts)) {
      bossScoreFilters.timestamp.$lte = new Date(ts);
    } else {
      bossScoreFilters.timestamp.$lte = new Date(endTime);
    }
  }

  if (flattenQuestion) {
    const bossScoreDocs = await BossScoreModel.find(bossScoreFilters);

    const bossQuestionsFilters = {
      bossScoreId: {
        $in: bossScoreDocs.map((bossScoreDoc) => bossScoreDoc._id),
      },
      countStatistic: true,
    };

    if (typeof prevIdStart !== "undefined") {
      bossQuestionsFilters._id = {
        $gt: prevIdStart,
      };
    }
    let query = BossQuestionModel.find(bossQuestionsFilters);
    if (typeof limit !== "undefined") {
      query = query.limit(Number(limit));
    }

    const bossQuestionsDocs = await query.exec();

    return bossQuestionsDocs.map((bossQuestionDoc) => {
      const result = bossQuestionDoc.toJSON();
      const targetBoosScoreDoc = bossScoreDocs.find(
        (bossScoreDoc) =>
          bossScoreDoc._id.toString() === bossQuestionDoc.bossScoreId.toString()
      );

      return {
        ...(targetBoosScoreDoc ? targetBoosScoreDoc.toJSON() : {}),
        ...result,
      };
    });
  } else {
    if (typeof prevIdStart !== "undefined") {
      bossScoreFilters._id = {
        $gt: prevIdStart,
      };
    }

    let query = BossScoreModel.find(bossScoreFilters);
    if (typeof limit !== "undefined") {
      query = query.limit(Number(limit));
    }

    const bossScoreDocs = await query.exec();
    const bossQuestionsDocs = await BossQuestionModel.find({
      bossScoreId: {
        $in: bossScoreDocs.map((bossScoreDoc) => bossScoreDoc._id),
      },
      countStatistic: true,
    });

    return bossScoreDocs.map((bossScoreDoc) => {
      const result = bossScoreDoc.toJSON();
      result.questions = bossQuestionsDocs
        .filter(
          (bossQuestionDoc) =>
            bossQuestionDoc.bossScoreId.toString() ===
            bossScoreDoc._id.toString()
        )
        .map((bossQuestionDoc) => bossQuestionDoc.toJSON());
      return result;
    });
  }
}

async function getBossScores(
  userData,
  {
    studentId,
    school,
    room,
    grade,
    stage,
    startTime,
    endTime,
    flattenStudent,
    flattenQuestion,
    prevIdStart,
    limit,
  }
) {
  if (Boolean(flattenStudent)) {
    const studentDocs = await getStudents(userData, {
      studentId,
      school,
      room,
      grade,
    });
    const studentIds = studentDocs.map((ele) => ele._id);
    const bossScoreDocs = await getBossScoresByFilters({
      studentIds,
      stage,
      startTime,
      endTime,
      flattenQuestion,
      prevIdStart,
      limit,
    });
    return bossScoreDocs.map((bossScoreDoc) => {
      const targetStudent = studentDocs.find(
        (studentDoc) =>
          studentDoc._id.toString() === bossScoreDoc.studentId.toString()
      );

      return {
        ...(targetStudent ? targetStudent.toJSON() : {}),
        ...bossScoreDoc,
      };
    });
  } else {
    const studentDocs = await getStudents(userData, {
      studentId,
      school,
      room,
      grade,
      prevIdStart,
      limit,
    });
    const studentIds = studentDocs.map((ele) => ele._id);
    const bossScoreDocs = await getBossScoresByFilters({
      studentIds,
      stage,
      startTime,
      endTime,
      flattenQuestion,
    });
    return studentDocs.map((studentDoc) => {
      const result = studentDoc.toJSON();
      result.scores = bossScoreDocs.filter(
        (bossScoreDoc) =>
          bossScoreDoc.studentId.toString() === result._id.toString()
      );
      return result;
    });
  }
}

module.exports.getBossScores = getBossScores;

const COLOR_GRADIENTS = tinygradient([
  {
    color: "#FF8080",
    pos: 0,
  },
  { color: "#FF8080", pos: 0.25 },
  {
    color: "#FFFF00",
    pos: 0.5,
  },
  { color: "#80FF80", pos: 0.75 },
  {
    color: "#80FF80",
    pos: 1,
  },
]);

function color(percentile) {
  const t = percentile / 100;
  return COLOR_GRADIENTS.hsvAt(t).toRgbString();
}

function textColor(percentile) {
  const t = percentile / 100;
  return COLOR_GRADIENTS.hsvAt(t).isDark() ? "#FFFFFF" : "#212529";
}

const thaiAlphabets = [
  "ก",
  "ข",
  "ค",
  "ฆ",
  "ง",
  "จ",
  "ฉ",
  "ช",
  "ซ",
  "ฌ",
  "ญ",
  "ฎ",
  "ฏ",
  "ฐ",
  "ฑ",
  "ฒ",
  "ณ",
  "ด",
  "ต",
  "ถ",
  "ท",
  "ธ",
  "น",
  "บ",
  "ป",
  "ผ",
  "ฝ",
  "พ",
  "ฟ",
  "ภ",
  "ม",
  "ย",
  "ร",
  "ล",
  "ว",
  "ศ",
  "ษ",
  "ส",
  "ห",
  "ฬ",
  "อ",
  "ฮ",
];

async function getSummaryScores(
  userData,
  {
    studentId,
    school,
    room,
    grade,
    stage,
    startTime,
    endTime,
    prevIdStart,
    limit,
  }
) {
  let studentDocs = await getStudents(userData, {
    studentId,
    school,
    room,
    grade,
    prevIdStart,
    limit,
  });

  const studentIds = studentDocs.map((ele) => ele._id);
  const stageScoreDocs = await getStageScoresByFilters({
    studentIds: studentIds,
    stage: stage,
    startTime: startTime,
    endTime: endTime,
  });
  const bossScoreDocs = await getBossScoresByFilters({
    studentIds: studentIds,
    stage: stage,
    startTime: startTime,
    endTime: endTime,
  });

  studentDocs = studentDocs.map((studentDoc) => {
    const result = studentDoc.toJSON();
    result.stageScores = stageScoreDocs.filter(
      (stageScoreDoc) =>
        stageScoreDoc.studentId.toString() === result._id.toString()
    );
    result.bossScores = bossScoreDocs.filter(
      (bossScoreDoc) =>
        bossScoreDoc.studentId.toString() === result._id.toString()
    );
    return result;
  });

  for (let i = 0; i < studentDocs.length; i++) {
    const studentData = studentDocs[i];
    studentData.seq = i + 1;

    const stageMetaData = new Array(9).fill(undefined).map((_, j) => {
      j += 1;
      const allScoreSubstages = new Array(j === 9 ? 2 : 3)
        .fill(undefined)
        .map((_, k) => {
          const stageName = `${j}.${k + 1}`;
          const filterScores = studentData.stageScores.filter(
            (ele) => ele.stage === stageName
          );
          const stars = filterScores.map((ele) => ele.star);

          return {
            stageName,
            scores: filterScores,
            bestStar: stars.length > 0 ? Math.max(...stars) : 0,
            worstStar: stars.length > 0 ? Math.min(...stars) : 0,
            avgStar:
              stars.length > 0
                ? stars.reduce((result, ele) => result + ele, 0) / stars.length
                : 0,
            playCount: filterScores.length,
          };
        });

      const stageMetadata = allScoreSubstages.reduce(
        (result, ele) => {
          result.bestStar += ele.bestStar;
          result.worstStar += ele.worstStar;
          result.avgStar += ele.avgStar;
          return result;
        },
        {
          stage: `stage${j}`,
          bestStar: 0,
          worstStar: 0,
          avgStar: 0,
          playCount: 0,
          color: "transparent",
          textColor: "black",
        }
      );

      if (allScoreSubstages.length > 0) {
        stageMetadata.bestStar /= allScoreSubstages.length;
        stageMetadata.worstStar /= allScoreSubstages.length;
        stageMetadata.avgStar /= allScoreSubstages.length;

        const playCounts = allScoreSubstages.map((ele) => ele.playCount);
        stageMetadata.playCount =
          playCounts.length > 0 ? Math.max(...playCounts) : 0;
      }

      studentData[`stage${j}`] = stageMetadata;
      return stageMetadata;
    });

    studentData.total = {
      bestStar:
        stageMetaData.reduce((result, ele) => result + ele.bestStar, 0) /
        stageMetaData.length,
      worstStar:
        stageMetaData.reduce((result, ele) => result + ele.worstStar, 0) /
        stageMetaData.length,
      avgStar:
        stageMetaData.reduce((result, ele) => result + ele.avgStar, 0) /
        stageMetaData.length,
      playCount: Math.max(...stageMetaData.map((ele) => ele.playCount)),
      color: "transparent",
      textColor: "black",
    };

    const bossStars = studentData.bossScores.map((ele) => ele.star);
    studentData.boss = {
      bestStar: bossStars.length > 0 ? Math.max(...bossStars) : 0,
      worstStar: bossStars.length > 0 ? Math.min(...bossStars) : 0,
      avgStar:
        bossStars.length > 0
          ? bossStars.reduce((result, ele) => result + ele, 0) /
            bossStars.length
          : 0,
      playCount: bossStars.length,
      color: "transparent",
      textColor: "black",
    };

    const scores = studentData.stageScores.concat(studentData.bossScores);
    if (scores.length > 0) {
      const timestamps = scores.map((ele) => dayjs(ele.timestamp).valueOf());
      studentData.firstPlay = new Date(Math.min(...timestamps));
      studentData.lastPlay = new Date(Math.max(...timestamps));
    }

    const stages = studentData.stageScores.filter((ele) =>
      /^\d/.test(ele.stage)
    );
    const questions = stages.reduce(
      (result, ele) => result.concat(ele.questions),
      []
    );

    studentData.alphabetsStats = thaiAlphabets.map((alphabet) => {
      const filterAlphabets = questions.filter(
        (question) => question.questionAlphabet === alphabet
      );

      return {
        alphabet,
        counts: filterAlphabets.length,
        corrects: filterAlphabets.filter((question) => question.isCorrect)
          .length,
        wrongs: filterAlphabets.filter((question) => !question.isCorrect)
          .length,
      };
    });

    const maxCorrectCounts = Math.max(
      ...studentData.alphabetsStats.map((ele) => ele.corrects)
    );
    const maxWrongCounts = Math.max(
      ...studentData.alphabetsStats.map((ele) => ele.wrongs)
    );

    studentData.mostCorrectAlphabets = {
      alphabets: studentData.alphabetsStats
        .filter((ele) => ele.corrects > 0 && ele.corrects === maxCorrectCounts)
        .map((ele) => ele.alphabet),
      counts: maxCorrectCounts,
    };

    studentData.mostWrongAlphabets = {
      alphabets: studentData.alphabetsStats
        .filter((ele) => ele.wrongs > 0 && ele.corrects === maxWrongCounts)
        .map((ele) => ele.alphabet),
      counts: maxWrongCounts,
    };
  }

  for (let i = 1; i <= 9; i++) {
    const metadataPercentile = studentDocs
      .map((ele) => ele[`stage${i}`])
      .filter((ele) => ele.playCount > 0);
    if (metadataPercentile.length > 0) {
      const bestStars = metadataPercentile.map((ele) => ele.bestStar);
      const max = Math.max(...bestStars);
      const min = Math.min(...bestStars);
      for (const metaData of metadataPercentile) {
        if (min === max) {
          if (studentDocs.length > 1) {
            metaData.percentile = 50;
          } else {
            metaData.percentile = (metaData.bestStar / 5) * 100;
          }
        } else {
          metaData.percentile = ((metaData.bestStar - min) / (max - min)) * 100;
        }
        metaData.color = color(metaData.percentile);
        metaData.textColor = textColor(metaData.percentile);
      }
    }
  }

  const metadataBossPercentile = studentDocs
    .map((ele) => ele.boss)
    .filter((ele) => ele.playCount > 0);
  if (metadataBossPercentile.length > 0) {
    const bestStars = metadataBossPercentile.map((ele) => ele.bestStar);
    const max = Math.max(...bestStars);
    const min = Math.min(...bestStars);
    for (const metaData of metadataBossPercentile) {
      if (min === max) {
        if (studentDocs.length > 1) {
          metaData.percentile = 50;
        } else {
          metaData.percentile = (metaData.bestStar / 5) * 100;
        }
      } else {
        metaData.percentile = ((metaData.bestStar - min) / (max - min)) * 100;
      }
      metaData.color = color(metaData.percentile);
      metaData.textColor = textColor(metaData.percentile);
    }
  }

  const metaDataTotalPercentile = studentDocs
    .map((ele) => ele.total)
    .filter((ele) => ele.playCount > 0);
  if (metaDataTotalPercentile.length > 0) {
    const bestStars = metaDataTotalPercentile.map((ele) => ele.bestStar);
    const max = Math.max(...bestStars);
    const min = Math.min(...bestStars);
    for (const metaData of metaDataTotalPercentile) {
      if (min === max) {
        if (studentDocs.length > 1) {
          metaData.percentile = 50;
        } else {
          metaData.percentile = (metaData.bestStar / 5) * 100;
        }
      } else {
        metaData.percentile = ((metaData.bestStar - min) / (max - min)) * 100;
      }
      metaData.color = color(metaData.percentile);
      metaData.textColor = textColor(metaData.percentile);
    }
  }

  for (let i = 0; i < studentDocs.length; i++) {
    delete studentDocs.stageScores;
    delete studentDocs.bossScores;
  }

  return studentDocs;
}

module.exports.getSummaryScores = getSummaryScores;
