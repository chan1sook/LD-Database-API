const maxScores = {
  1: 40,
  2: 24,
  3: 36,
  4: 26,
  5: 36,
  6: 30,
  7: 34,
  8: 34,
  9: 24,
};

class StudentsData {
  constructor(rawStudents = []) {
    this.students = rawStudents.map((ele) => new StudentData(ele));

    this._initPercentiles();
  }

  static get groupLabels() {
    return new Array(10).fill(undefined).map((_, index) => {
      return index < 9 ? `${index + 1}` : "รวม";
    });
  }

  _initPercentiles() {
    const allSummarys = this.students.map((ele) => {
      return {
        student: ele,
        summary: ele.summary,
      };
    });
    this._summarys = StudentsData.groupLabels.map((label, index) => {
      return {
        label,
        data: allSummarys.map((ele) => {
          return {
            student: ele.student,
            ...ele.summary[index],
          };
        }),
      };
    });
    this._percentiles = StudentsData.groupLabels.map((label, index) => {
      return new StudentPercentile(
        label,
        allSummarys.map((ele) => {
          return {
            student: ele.student,
            ...ele.summary[index],
          };
        })
      );
    });
  }

  get summarys() {
    return this._summarys;
  }

  get percentiles() {
    return this._percentiles;
  }
}

class StudentData {
  constructor(rawData = {}) {
    this._id = "";
    this.firstName = "";
    this.lastName = "";
    this.gender = "others";
    this.school = "";
    this.room = "";
    this.grade = "";

    /**
     * @type {ScoreData[]}
     */
    this.scores = [];

    Object.assign(this, rawData);

    this._initSummary();
  }

  get fullname() {
    return `${this.firstName} ${this.lastName}`;
  }

  _initSummary() {
    this._stageGroupScores = StudentsData.groupLabels
      .slice(0, -1)
      .map((label) => {
        return {
          stage: label,
          substages: new Array(3).fill(undefined).map((_, j) => {
            const stage = `${label}.${j + 1}`;
            return {
              stage,
              scores: this.scores.filter((score) => score.stage === stage),
            };
          }),
        };
      });

    this._summary = this.stageGroupScores.map((group) => {
      const summary = group.substages.reduce(
        (obj, substage) => {
          obj.maxCount = Math.max(obj.maxCount, substage.scores.length);
          if (substage.scores.length > 0) {
            const scores = substage.scores.map((ele) => ele.score);
            obj.bestScore = obj.bestScore + Math.max(...scores);
            obj.worstScore = obj.worstScore + Math.min(...scores);
            obj.averageScore =
              obj.averageScore +
              scores.reduce((v, ele) => v + ele, 0) / substage.scores.length;

            const durations = substage.scores.map((ele) => ele.duration);
            obj.bestDuration = obj.bestDuration + Math.min(...durations);
            obj.worstDuration = obj.worstDuration + Math.max(...durations);
            obj.averageDuration =
              obj.averageDuration +
              durations.reduce((v, ele) => v + ele, 0) / substage.scores.length;

            const correctCounts = substage.scores.map(
              (ele) => ele.correctsCount
            );
            obj.bestCorrectCount =
              obj.bestCorrectCount + Math.max(...correctCounts);
            obj.worstCorrectCount =
              obj.worstCorrectCount + Math.min(...correctCounts);
            obj.averageCorrectCount =
              obj.averageCorrectCount +
              correctCounts.reduce((v, ele) => v + ele, 0) /
                substage.scores.length;

            const wrongCounts = substage.scores.map((ele) => ele.wrongsCount);
            obj.bestWrongCount = obj.bestWrongCount + Math.min(...wrongCounts);
            obj.worstWrongCount =
              obj.worstWrongCount + Math.min(...wrongCounts);
            obj.averageWrongCount =
              obj.averageWrongCount +
              wrongCounts.reduce((v, ele) => v + ele, 0) /
                substage.scores.length;
          }
          return obj;
        },
        {
          stage: group.stage,
          maxCount: 0,
          bestScore: 0,
          averageScore: 0,
          worstScore: 0,
          bestDuration: 0,
          averageDuration: 0,
          worstDuration: 0,
          bestCorrectCount: 0,
          averageCorrectCount: 0,
          worstCorrectCount: 0,
          bestWrongCount: 0,
          averageWrongCount: 0,
          worstWrongCount: 0,
          maxScore: maxScores[group.stage] || 0,
          star: 0,
        }
      );

      if (summary.maxScore > 0) {
        const r = (summary.bestScore * 100) / summary.maxScore;
        if (r >= 80) {
          summary.star = 5;
        } else if (r >= 60) {
          summary.star = 4;
        } else if (r >= 40) {
          summary.star = 3;
        } else if (r >= 20) {
          summary.star = 2;
        } else {
          summary.star = 1;
        }
      }
      return summary;
    });

    const totalSummary = this._summary.reduce(
      (obj, group) => {
        obj.maxCount = Math.max(obj.maxCount, group.maxCount);
        obj.maxScore += group.maxScore;
        obj.bestScore += group.bestScore;
        obj.averageScore += group.averageScore;
        obj.worstScore += group.worstScore;
        obj.bestDuration += group.bestDuration;
        obj.averageDuration += group.averageDuration;
        obj.worstDuration += group.worstDuration;
        obj.bestCorrectCount += group.bestCorrectCount;
        obj.averageCorrectCount += group.averageCorrectCount;
        obj.worstCorrectCount += group.worstCorrectCount;
        obj.bestWrongCount += group.bestWrongCount;
        obj.averageWrongCount += group.averageWrongCount;
        obj.worstWrongCount += group.worstWrongCount;

        return obj;
      },
      {
        stage: "รวม",
        maxCount: 0,
        bestScore: 0,
        averageScore: 0,
        worstScore: 0,
        bestDuration: 0,
        averageDuration: 0,
        worstDuration: 0,
        bestCorrectCount: 0,
        averageCorrectCount: 0,
        worstCorrectCount: 0,
        bestWrongCount: 0,
        averageWrongCount: 0,
        worstWrongCount: 0,
        maxScore: 0,
        star: 0,
      }
    );

    if (totalSummary.maxScore > 0) {
      const r = (totalSummary.bestScore * 100) / totalSummary.maxScore;
      if (r >= 80) {
        totalSummary.star = 5;
      } else if (r >= 60) {
        totalSummary.star = 4;
      } else if (r >= 40) {
        totalSummary.star = 3;
      } else if (r >= 20) {
        totalSummary.star = 2;
      } else {
        totalSummary.star = 1;
      }
    }

    this._summary.push(totalSummary);
  }

  get stageGroupScores() {
    return this._stageGroupScores;
  }

  get summary() {
    return this._summary;
  }
}

class ScoreData {
  constructor(rawData = {}) {
    this.stage = "";
    this.score = 0;
    this.duration = 0;
    this.difficulty = 0;
    this.timestamp = Date.now();

    /**
     * @type {boolean[]}
     */
    this.answerCorrects = [];
    /**
     * @type {number[]}
     */
    this.answerScores = [];
    /**
     * @type {string[]}
     */
    this.alphabets = [];

    Object.assign(this, rawData);

    this.alphabets = this.alphabets.map((str) => {
      if (str.length > 1) {
        try {
          const n = parseInt(str);
          if (!isNaN(n) && Number.isFinite(n) && Number.isInteger(n) && n > 0) {
            return String.fromCharCode(n);
          } else {
            return str;
          }
        } catch (error) {
          return str;
        }
      } else {
        return str;
      }
    });
  }

  get correctsCount() {
    return this.answerCorrects.filter((ele) => ele).length;
  }

  get wrongsCount() {
    return this.answerCorrects.length - this.correctsCount;
  }
}

class StudentPercentile {
  constructor(stage = "", data = []) {
    this.stage = stage;

    /**
     * @type {{student:StudentData, bestScore: number, percentile: number}[]}
     */
    this.data = data;

    this.sort();
  }

  sort(field = "bestScore") {
    this.data.sort((a, b) => (a[field] || 0) - (b[field] || 0));

    const minValue = Math.min(...this.data.map((ele) => ele[field] || 0));
    const maxValue = Math.max(...this.data.map((ele) => ele[field] || 0));
    const dValue = maxValue - minValue;

    if (dValue > 0) {
      this.data.forEach((ele, i) => {
        ele.percentile = ((ele[field] - minValue) / dValue) * 100;
      });
    } else {
      if (["bestScore", "worstScore", "averageScore"].includes(field)) {
        this.data.forEach((ele) => {
          ele.percentile = (ele[field] / ele.maxScore) * 100;
        });
      } else {
        this.data.forEach((ele, i) => {
          ele.percentile = 50;
        });
      }
    }
  }

  percentile(p) {
    return this.data.find((ele) => ele.percentile >= p);
  }

  percentileOf(_id) {
    const data = this.data.find((ele) => ele.student._id === _id);
    return data;
  }

  static RED_COLOR_VALUE = 0xff8080;
  static YELLOW_COLOR_VALUE = 0xffff00;
  static GREEN_COLOR_VALUE = 0x80ff80;

  static color(percentile, hex = true) {
    const t = percentile / 100;
    let c = StudentPercentile.RED_COLOR_VALUE;

    if (t >= 1) {
      c = StudentPercentile.GREEN_COLOR_VALUE;
    } else if (t >= 0.5) {
      c = lerp(
        StudentPercentile.YELLOW_COLOR_VALUE,
        StudentPercentile.GREEN_COLOR_VALUE,
        (t - 0.5) * 2
      );
    } else if (t >= 0) {
      c = lerp(
        StudentPercentile.RED_COLOR_VALUE,
        StudentPercentile.YELLOW_COLOR_VALUE,
        t * 2
      );
    }
    return hex ? toHex(c) : c;
  }
}

// Scale Color here
function lerp(a, b, t) {
  if (t > 1) {
    t = 1;
  } else if (t < 0) {
    t = 0;
  }
  return a + (b - a) * t;
}

function toHex(n = 0) {
  return "#" + Math.floor(n).toString(16).padStart(6, "0");
}

module.exports = {
  StudentsData,
  StudentData,
  StudentPercentile,
};
