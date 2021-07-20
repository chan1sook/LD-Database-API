const dayjs = require("dayjs");
require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);

require("./vue-extends");

const { StudentData } = require("../utils/student-data");

document.addEventListener("DOMContentLoaded", () => {
  const app = new Vue({
    el: "#app",
    data() {
      return {
        loading: true,
        student: new StudentData(),
      };
    },
    computed: {
      scores() {
        return this.student.stageGroupScores.reduce((arr, group) => {
          const totalLength = group.substages.reduce(
            (v, ele) => v + Math.max(ele.scores.length, 1),
            0
          );

          const arr2 = group.substages.reduce((arr, substage, i) => {
            if (substage.scores.length > 0) {
              arr = arr.concat(
                substage.scores.map((ele, j, arr) => {
                  return {
                    rowspanStage: i + j === 0 ? totalLength : undefined,
                    rowspanSubstage: j === 0 ? arr.length : undefined,
                    stage: group.stage,
                    substage: substage.stage,
                    count: j + 1,
                    date: dayjs(ele.timestamp)
                      .locale("th")
                      .format("D MMM BBBB HH:mm น."),
                    score: ele.score,
                    duration: ele.duration,
                  };
                })
              );
            } else {
              arr.push({
                rowspanStage: i === 0 ? totalLength : undefined,
                rowspanSubstage: 1,
                stage: group.stage,
                substage: substage.stage,
                count: 1,
                date: "-",
                score: "-",
                duration: "-",
              });
            }
            return arr;
          }, []);
          return arr.concat(arr2);
        }, []);
      },
      exportLink() {
        return typeof STUDENT_ID !== "undefined"
          ? `/export?format=csv&_id=${STUDENT_ID}`
          : "/export?format=csv";
      },
    },
    mounted() {
      this.reloadData();
    },
    methods: {
      async reloadData() {
        try {
          this.loading = true;
          const response = await fetch(
            typeof STUDENT_ID !== "undefined"
              ? `/scores?_id=${STUDENT_ID}`
              : "/scores",
            {
              method: "GET",
            }
          );
          const data = await response.json();
          this.student = new StudentData(data.response[0]);
        } catch (error) {
        } finally {
          this.loading = false;
        }
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
          type: this.graphLabels.length > 2 ? "radar" : "bar",
          data: {
            labels: this.graphLabels,
            datasets: this.graphDatasets,
          },
          options: {
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
                    const y = context.parsed.y || "0";
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
      toggleStudentPanel(student) {
        student._expanded = !student._expanded;
        this.$forceUpdate();
      },
      isCompare(student) {
        return this.graphStudents.find((ele) => ele._id === student._id);
      },
      addCompareStudent(student) {
        const index = this.graphStudents.findIndex(
          (ele) => ele._id === student._id
        );
        if (index !== -1) {
          this.graphStudents[index] = student;
        } else {
          this.graphStudents.push(student);
          this.graphStudents.sort((a, b) =>
            (a._id || "").localeCompare(b._id || "")
          );
        }
        this.$forceUpdate();
      },
      removeCompareStudent(student) {
        const index = this.graphStudents.findIndex(
          (ele) => ele._id === student._id
        );
        if (index !== -1) {
          this.graphStudents.splice(index, 1);
          this.graphStudents.sort((a, b) =>
            (a._id || "").localeCompare(b._id || "")
          );
        }
        this.$forceUpdate();
      },
      async logout() {
        try {
          const response = await fetch("/logout", {
            method: "POST",
          });
          if (response.status === 200) {
            window.location.href = "/report/login";
          } else {
            this.$refs.errorToast.toast.show();
          }
        } catch (error) {
          console.error(error);
        }
      },
    },
  });
});
