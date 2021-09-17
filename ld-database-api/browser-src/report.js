const dayjs = require("dayjs");
require("dayjs/locale/th");
const isoWeek = require("dayjs/plugin/isoWeek");
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(isoWeek);
dayjs.extend(buddhistEra);

require("./vue-extends");

const { StudentsData, StudentPercentile } = require("../utils/student-data");

const Chart = require("chart.js");
const FORMATS = {
  datetime: "D MMM BBBB, H:mm:ss",
  millisecond: "H:mm:ss.SSS",
  second: "H:mm:ss",
  minute: "H:mm",
  hour: "H:mm",
  day: "D MMM",
  week: "D MMM",
  month: "MMM BBBB",
  quarter: "Q - BBBB",
  year: "BBBB",
};

const CHART_COLORS = [
  "#3366CC",
  "#DC3912",
  "#FF9900",
  "#109618",
  "#990099",
  "#3B3EAC",
  "#0099C6",
  "#DD4477",
  "#66AA00",
  "#B82E2E",
  "#316395",
  "#994499",
  "#22AA99",
  "#AAAA11",
  "#6633CC",
  "#E67300",
  "#8B0707",
  "#329262",
  "#5574A6",
  "#3B3EAC",
];

Chart._adapters._date.override({
  _id: "dayjs-adapter",

  formats() {
    return FORMATS;
  },

  parse(value, unit) {
    if (value === null || typeof value === "undefined") {
      return 0;
    }
    const type = typeof value;
    if (type === "number" || value instanceof Date) {
      return dayjs(value).valueOf();
    } else if (type === "string") {
      if (typeof unit === "string") {
        return dayjs().add(value, unit).valueOf();
      } else {
        return dayjs(value).valueOf();
      }
    }
  },

  format(time, fmt) {
    return dayjs(time).locale("th").format(fmt);
  },

  add(time, amount, unit) {
    switch (unit) {
      case "millisecond":
      case "second":
      case "minute":
      case "hour":
      case "day":
      case "week":
      case "month":
      case "quarter":
      case "year":
        return dayjs(time).add(amount, unit).valueOf();
      default:
        return time;
    }
  },

  diff(time, amount, unit) {
    switch (unit) {
      case "millisecond":
      case "second":
      case "minute":
      case "hour":
      case "day":
      case "week":
      case "month":
      case "quarter":
      case "year":
        return dayjs(time).subtract(amount, unit).valueOf();
      default:
        return 0;
    }
  },

  startOf(time, unit, weekday) {
    switch (unit) {
      case "second":
      case "minute":
      case "hour":
      case "day":
      case "isoWeek":
      case "month":
      case "quarter":
      case "year":
        return dayjs(time).startOf(unit).valueOf();
      case "week":
        return dayjs(time)
          .startOf(unit)
          .add(weekday || 0, "day")
          .valueOf();
      default:
        return time;
    }
  },

  endOf(time, unit) {
    switch (unit) {
      case "second":
      case "minute":
      case "hour":
      case "day":
      case "week":
      case "isoWeek":
      case "month":
      case "quarter":
      case "year":
        return dayjs(time).endOf(unit).valueOf();
      default:
        return time;
    }
  },
});

Vue.filter("dateBBBB", (value) => {
  try {
    return dayjs(value).locale("th").format("D MMM BBBB");
  } catch (err) {
    console.error(err);
    return value;
  }
});

Vue.filter("timeHMS", (value) => {
  try {
    return dayjs(value).locale("th").format("HH:mm:ss");
  } catch (err) {
    console.error(err);
    return value;
  }
});

Vue.filter("wronganswers", (value) => {
  if (Array.isArray(value)) {
    const wrongs = value.reduce((arr, ele, index) => {
      if (!ele) {
        arr.push(index + 1);
      }
      return arr;
    }, []);
    if (wrongs.length > 0) {
      return wrongs.join(",");
    } else {
      return "ไม่มี";
    }
  } else {
    return value;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const app = new Vue({
    el: "#app",
    data() {
      return {
        loading: true,
        studentsData: new StudentsData(),
        chart: null,
        page: 1,
        eachPage: 10,
        totalPage: 1,
        studentsCounts: 0,
        graphFilters: {
          students: [],
          method: "max",
          value: "score",
        },
        filters: {
          school: null,
          allSchools: [],
          grade: null,
          allGrades: [],
          room: null,
          allRooms: [],
          locks: [],
        },
      };
    },
    computed: {
      scoresURL() {
        const params = [
          {
            name: "school",
            value: this.filters.school,
          },
          {
            name: "grade",
            value: this.filters.grade,
          },
          {
            name: "room",
            value: this.filters.room,
          },
          {
            name: "eachPage",
            value: this.eachPage,
          },
          {
            name: "page",
            value: this.page,
          },
        ].filter((ele) => Boolean(ele.value));

        return (
          "/report-ajax/scores?" +
          params.map((ele) => `${ele.name}=${ele.value}`).join("&")
        );
      },
      currentPageRange() {
        const start = Math.min(
          (this.page - 1) * this.eachPage + 1,
          this.studentsCounts
        );
        const end = Math.min(this.page * this.eachPage, this.studentsCounts);
        return {
          start,
          end,
        };
      },
      graphLabels() {
        return StudentsData.groupLabels.slice(0, -1);
      },
      graphDatasets() {
        const subsetData = new StudentsData(this.graphFilters.students);
        const scoreFields = {
          min: "worstScore",
          max: "bestScore",
          avg: "averageScore",
        };
        const durationFields = {
          min: "bestDuration",
          max: "worstDuration",
          avg: "averageDuration",
        };
        const correctFields = {
          min: "worstCorrectCount",
          max: "bestCorrectCount",
          avg: "averageCorrectCount",
        };
        const wrongFields = {
          min: "bestWrongCount",
          max: "worstWrongCount",
          avg: "averageWrongCount",
        };

        return subsetData.students.map((ele, index) => {
          return {
            label: ele.fullname,
            data: subsetData.summaries.slice(0, -1).map((ele) => {
              let field = "bestScore";
              switch (this.graphFilters.value) {
                case "score":
                  field = scoreFields[this.graphFilters.method] || "bestScore";
                  break;
                case "duration":
                  field =
                    durationFields[this.graphFilters.method] || "bestDuration";
                  break;
                case "correct":
                  field =
                    correctFields[this.graphFilters.method] ||
                    "worstCorrectCount";
                  break;
                case "wrong":
                  field =
                    wrongFields[this.graphFilters.method] || "bestWrongCount";
                  break;
              }

              return ele.data[index][field];
            }),
            fill: true,
            backgroundColor: CHART_COLORS[index % CHART_COLORS.length] + "80",
            borderColor: CHART_COLORS[index % CHART_COLORS.length],
            pointBackgroundColor: CHART_COLORS[index % CHART_COLORS.length],
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: CHART_COLORS[index % CHART_COLORS.length],
          };
        });
      },
      exportLink() {
        const params = [
          {
            name: "format",
            value: "csv",
          },
          {
            name: "school",
            value: this.filters.school,
          },
          {
            name: "grade",
            value: this.filters.grade,
          },
          {
            name: "room",
            value: this.filters.room,
          },
        ].filter((ele) => Boolean(ele.value));
        return (
          "/export?" + params.map((ele) => `${ele.name}=${ele.value}`).join("&")
        );
      },
    },
    watch: {
      graphFilters: {
        deep: true,
        handler(val) {
          this.$nextTick(this.initChart);
        },
      },
    },
    mounted() {
      this.reloadData(true);
    },
    methods: {
      async reloadData(isHardReload = false) {
        try {
          this.loading = isHardReload ? "hard" : "soft";
          const [userRes, scoresRes] = await Promise.all([
            fetch("/user", {
              method: "GET",
            }),
            fetch(this.scoresURL, {
              method: "GET",
            }),
          ]);

          const [userData, scoresData] = await Promise.all([
            userRes.json(),
            scoresRes.json(),
          ]);

          const scoresDataRes = scoresData.response;

          this.studentsData = scoresDataRes.students;
          this.studentsCounts = scoresDataRes.studentsCounts;
          this.totalPage = scoresDataRes.totalPage;

          if (isHardReload) {
            this.graphFilters.students = scoresDataRes.students.slice(0, 10);

            this.filters.allSchools = scoresDataRes.filters.schools;
            this.filters.allGrades = scoresDataRes.filters.grades;
            this.filters.allRooms = scoresDataRes.filters.rooms;

            switch (userData.response.role) {
              case "teacher":
                this.filters.school = userData.response.school;
                this.filters.room = null;
                this.filters.grade = null;
                this.filters.locks = ["school"];
                break;
              case "school":
                this.filters.school = userData.response.school;
                this.filters.room = null;
                this.filters.grade = null;
                this.filters.locks = [];
                break;
              case "admin":
                this.filters.school = null;
                this.filters.room = null;
                this.filters.grade = null;
                this.filters.locks = [];
                break;
              case "student":
              default:
                this.filters.school = userData.response.school;
                this.filters.room = userData.response.room;
                this.filters.grade = userData.response.grade;
                this.filters.locks = ["school", "room", "grade"];
                break;
            }
          }
        } catch (error) {
          console.error(error);
        } finally {
          this.loading = false;
        }
      },
      filterData() {
        this.page = 1;
        this.reloadData();
      },
      initChart() {
        if (!this.$refs.compareChart) {
          return;
        }

        if (this.chart) {
          this.chart.destroy();
        }

        const graphValueTarget = this.graphValueTarget;
        const config = {
          type: "radar",
          data: {
            labels: this.graphLabels,
            datasets: this.graphDatasets,
          },
          options: {
            scale: {
              min: 0,
            },
            maintainAspectRatio: false,
            elements: {
              line: {
                borderWidth: 3,
              },
            },
            plugins: {
              legend: {
                position: "right",
                onClick(e, legendItem, legend) {},
              },
              tooltip: {
                callbacks: {
                  title(contexts) {
                    const labels = contexts.reduce((arr, ele) => {
                      if (!arr.includes(ele.label)) {
                        arr.push(ele.label);
                      }
                      return arr;
                    }, []);
                    labels.sort();

                    if (labels.length > 3) {
                      const labels2 = labels.slice(0, 3);
                      labels2.push("...");
                      return labels2.join(", ");
                    } else {
                      return labels.join(", ");
                    }
                  },
                  label(context) {
                    const y = context.parsed.r || context.parsed.y || "0";
                    switch (graphValueTarget) {
                      case "correct":
                      case "wrong":
                        return ` ${y} ข้อ`;
                      case "score":
                        return ` ${y} คะแนน`;
                      case "duration":
                        return ` ${y} หน่วย`;
                      default:
                        return ` ${y}`;
                    }
                  },
                },
              },
            },
          },
        };
        this.chart = new Chart(this.$refs.compareChart, config);
      },
      isStudentInGraph(student) {
        return this.graphFilters.students.find(
          (ele) => ele._id === student._id
        );
      },
      toggleStudentGraph(student) {
        if (this.isStudentInGraph(student)) {
          this.removeStudentGraph(student);
        } else {
          this.addStudentGraph(student);
        }
      },
      addStudentGraph(student) {
        const index = this.graphFilters.students.findIndex(
          (ele) => ele._id === student._id
        );
        if (index !== -1) {
          this.graphFilters.students[index] = student;
        } else {
          this.graphFilters.students.push(student);
          this.graphFilters.students.sort((a, b) =>
            (a._id || "").localeCompare(b._id || "")
          );
        }
      },
      removeStudentGraph(student) {
        const index = this.graphFilters.students.findIndex(
          (ele) => ele._id === student._id
        );
        if (index !== -1) {
          this.graphFilters.students.splice(index, 1);
          this.graphFilters.students.sort((a, b) =>
            (a._id || "").localeCompare(b._id || "")
          );
        }
      },
      percentileStyleObject(group) {
        return {
          "background-color": group.bgColor,
          color: group.textColor,
        };
      },
      starArray(starCount) {
        const result = [];
        while (starCount >= 1) {
          result.push("fa-star");
          starCount -= 1;
        }
        if (starCount >= 0.5) {
          result.push("fa-star-half");
        }
        return result;
      },
      async logout() {
        try {
          const response = await fetch("/logout", {
            method: "POST",
          });
          if (response.status === 200) {
            window.location.href = "/report/login";
          } else {
            // TODO popup error
          }
          const data = await response.json();
          console.log(data);
        } catch (error) {
          console.error(error);
        }
      },
    },
  });
});
