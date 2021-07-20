(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"../utils/student-data":6,"./vue-extends":2,"dayjs":3,"dayjs/locale/th":4,"dayjs/plugin/buddhistEra":5}],2:[function(require,module,exports){
function _tooltipParams(binding) {
  let trigger = "hover";
  if (
    binding.modifiers.focus ||
    binding.modifiers.hover ||
    binding.modifiers.click
  ) {
    const t = [];
    if (binding.modifiers.focus) t.push("focus");
    if (binding.modifiers.hover) t.push("hover");
    if (binding.modifiers.click) t.push("click");
    trigger = t.join(" ");
  }
  return {
    title: binding.value || "",
    placement: binding.arg || "top",
    trigger,
    html: !!binding.modifiers.html,
  };
}

Vue.directive("tooltip", {
  bind(el, binding) {
    bootstrap.Tooltip.getOrCreateInstance(el, _tooltipParams(binding));
  },
  update(el, binding) {
    bootstrap.Tooltip.getOrCreateInstance(el, _tooltipParams(binding));
  },
  unbind(el, binding) {
    bootstrap.Tooltip.getOrCreateInstance(el).dispose();
  },
});

Vue.component("b-toast", {
  props: {
    title: {
      type: String,
      default: "LD Admin",
    },
  },
  data() {
    return {
      toast: null,
    };
  },
  mounted() {
    this.toast = new bootstrap.Toast(this.$refs.toast);
  },
  beforeDestroy() {
    this.toast.dispose();
  },
  template: `
    <div ref="toast" class="toast hide mb-2" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">{{ title }}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body"><slot></slot></div>
    </div>
  `,
});

Vue.component("b-pagebar", {
  props: {
    value: {
      type: Number,
      default: 1,
    },
    totalPage: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {};
  },
  template: `
    <nav aria-label="หน้า">
      <ul class="pagination justify-content-center">
        <li class="page-item" v-tooltip="'หน้าแรก'" :class="{disabled: value <= 1 }">
          <a class="page-link" href="#" @click.prevent="setPage(1)">
            <i class="fas fa-angle-double-left"></i>
          </a>
        </li>
        <li class="page-item" v-tooltip="'หน้าที่แล้ว'" :class="{disabled: value <= 1 }">
          <a class="page-link" href="#" @click.prevent="setPage(value - 1)">
            <i class="fas fa-angle-left"></i>
          </a>
        </li>
        <li class="page-item" v-if="value > 2">
          <a class="page-link" href="#" @click.prevent="setPage(1)">1</a>
        </li>
        <li class="page-item disabled" v-if="value > 4">
          <a class="page-link" href="#" @click.prevent>...</a>
        </li>
        <li class="page-item" v-else-if="value > 3">
          <a class="page-link" href="#" @click.prevent="setPage(2)">2</a>
        </li>
        <li v-if="value > 1" class="page-item">
          <a class="page-link" href="#" @click.prevent="setPage(value - 1)">
            {{ value - 1 }}
          </a>
        </li>
        <li class="page-item">
          <a class="fw-bold page-link" href="#" @click.prevent="promptPage">
            {{ value }}
          </a>
        </li>
        <li v-if="value < totalPage" class="page-item">
          <a class="page-link" href="#" @click.prevent="setPage(value + 1)">
            {{ value + 1 }}
          </a>
        </li>
        <li class="page-item disabled" v-if="value < totalPage - 3">
          <a class="page-link" href="#" @click.prevent>...</a>
        </li>
        <li class="page-item" v-else-if="value < totalPage - 2">
          <a class="page-link" href="#" @click.prevent="setPage(totalPage - 1)">
            {{ totalPage - 1 }}
          </a>
        </li>
        <li class="page-item" v-if="value < totalPage - 1">
          <a class="page-link" href="#" @click.prevent="setPage(totalPage)">
            {{ totalPage }}
          </a>
        </li>
        <li class="page-item" v-tooltip="'หน้าถัดไป'" :class="{disabled:value >= totalPage}">
          <a class="page-link" href="#" @click.prevent="setPage(value + 1)">
            <i class="fas fa-angle-right"></i>
          </a>
        </li>
        <li class="page-item" v-tooltip="'หน้าสุดท้าย'" :class="{disabled:value >= totalPage}" >
          <a class="page-link" href="#" @click.prevent="setPage(totalPage)">
            <i class="fas fa-angle-double-right"></i>
          </a>
        </li>
      </ul>
    </nav>
  `,
  methods: {
    setPage(p) {
      if (p < 1 || p > this.totalPage) {
        return;
      }

      this.$emit("input", p);
    },
    promptPage() {
      const r = prompt("ระบุหน้า");
      if (typeof r === "string") {
        const pageNum = Number(r);
        if (
          isNaN(pageNum) ||
          !isFinite(pageNum) ||
          !Number.isInteger(pageNum) ||
          pageNum < 1 ||
          pageNum > this.totalPage
        ) {
          return;
        }
        this.setPage(pageNum);
      }
    },
  },
});

},{}],3:[function(require,module,exports){
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).dayjs=e()}(this,(function(){"use strict";var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",s="minute",u="hour",a="day",o="week",f="month",h="quarter",c="year",d="date",$="Invalid Date",l=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,M={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},m=function(t,e,n){var r=String(t);return!r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},g={s:m,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return(e<=0?"+":"-")+m(r,2,"0")+":"+m(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return-t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,f),s=n-i<0,u=e.clone().add(r+(s?-1:1),f);return+(-(r+(n-i)/(s?i-u:u-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:f,y:c,w:o,d:a,D:d,h:u,m:s,s:i,ms:r,Q:h}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},D="en",v={};v[D]=M;var p=function(t){return t instanceof _},S=function(t,e,n){var r;if(!t)return D;if("string"==typeof t)v[t]&&(r=t),e&&(v[t]=e,r=t);else{var i=t.name;v[i]=t,r=i}return!n&&r&&(D=r),r||!n&&D},w=function(t,e){if(p(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new _(n)},O=g;O.l=S,O.i=p,O.w=function(t,e){return w(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var _=function(){function M(t){this.$L=S(t.locale,null,!0),this.parse(t)}var m=M.prototype;return m.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(O.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match(l);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.$x=t.x||{},this.init()},m.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},m.$utils=function(){return O},m.isValid=function(){return!(this.$d.toString()===$)},m.isSame=function(t,e){var n=w(t);return this.startOf(e)<=n&&n<=this.endOf(e)},m.isAfter=function(t,e){return w(t)<this.startOf(e)},m.isBefore=function(t,e){return this.endOf(e)<w(t)},m.$g=function(t,e,n){return O.u(t)?this[e]:this.set(n,t)},m.unix=function(){return Math.floor(this.valueOf()/1e3)},m.valueOf=function(){return this.$d.getTime()},m.startOf=function(t,e){var n=this,r=!!O.u(e)||e,h=O.p(t),$=function(t,e){var i=O.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(a)},l=function(t,e){return O.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},y=this.$W,M=this.$M,m=this.$D,g="set"+(this.$u?"UTC":"");switch(h){case c:return r?$(1,0):$(31,11);case f:return r?$(1,M):$(0,M+1);case o:var D=this.$locale().weekStart||0,v=(y<D?y+7:y)-D;return $(r?m-v:m+(6-v),M);case a:case d:return l(g+"Hours",0);case u:return l(g+"Minutes",1);case s:return l(g+"Seconds",2);case i:return l(g+"Milliseconds",3);default:return this.clone()}},m.endOf=function(t){return this.startOf(t,!1)},m.$set=function(t,e){var n,o=O.p(t),h="set"+(this.$u?"UTC":""),$=(n={},n[a]=h+"Date",n[d]=h+"Date",n[f]=h+"Month",n[c]=h+"FullYear",n[u]=h+"Hours",n[s]=h+"Minutes",n[i]=h+"Seconds",n[r]=h+"Milliseconds",n)[o],l=o===a?this.$D+(e-this.$W):e;if(o===f||o===c){var y=this.clone().set(d,1);y.$d[$](l),y.init(),this.$d=y.set(d,Math.min(this.$D,y.daysInMonth())).$d}else $&&this.$d[$](l);return this.init(),this},m.set=function(t,e){return this.clone().$set(t,e)},m.get=function(t){return this[O.p(t)]()},m.add=function(r,h){var d,$=this;r=Number(r);var l=O.p(h),y=function(t){var e=w($);return O.w(e.date(e.date()+Math.round(t*r)),$)};if(l===f)return this.set(f,this.$M+r);if(l===c)return this.set(c,this.$y+r);if(l===a)return y(1);if(l===o)return y(7);var M=(d={},d[s]=e,d[u]=n,d[i]=t,d)[l]||1,m=this.$d.getTime()+r*M;return O.w(m,this)},m.subtract=function(t,e){return this.add(-1*t,e)},m.format=function(t){var e=this,n=this.$locale();if(!this.isValid())return n.invalidDate||$;var r=t||"YYYY-MM-DDTHH:mm:ssZ",i=O.z(this),s=this.$H,u=this.$m,a=this.$M,o=n.weekdays,f=n.months,h=function(t,n,i,s){return t&&(t[n]||t(e,r))||i[n].substr(0,s)},c=function(t){return O.s(s%12||12,t,"0")},d=n.meridiem||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r},l={YY:String(this.$y).slice(-2),YYYY:this.$y,M:a+1,MM:O.s(a+1,2,"0"),MMM:h(n.monthsShort,a,f,3),MMMM:h(f,a),D:this.$D,DD:O.s(this.$D,2,"0"),d:String(this.$W),dd:h(n.weekdaysMin,this.$W,o,2),ddd:h(n.weekdaysShort,this.$W,o,3),dddd:o[this.$W],H:String(s),HH:O.s(s,2,"0"),h:c(1),hh:c(2),a:d(s,u,!0),A:d(s,u,!1),m:String(u),mm:O.s(u,2,"0"),s:String(this.$s),ss:O.s(this.$s,2,"0"),SSS:O.s(this.$ms,3,"0"),Z:i};return r.replace(y,(function(t,e){return e||l[t]||i.replace(":","")}))},m.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},m.diff=function(r,d,$){var l,y=O.p(d),M=w(r),m=(M.utcOffset()-this.utcOffset())*e,g=this-M,D=O.m(this,M);return D=(l={},l[c]=D/12,l[f]=D,l[h]=D/3,l[o]=(g-m)/6048e5,l[a]=(g-m)/864e5,l[u]=g/n,l[s]=g/e,l[i]=g/t,l)[y]||g,$?D:O.a(D)},m.daysInMonth=function(){return this.endOf(f).$D},m.$locale=function(){return v[this.$L]},m.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=S(t,e,!0);return r&&(n.$L=r),n},m.clone=function(){return O.w(this.$d,this)},m.toDate=function(){return new Date(this.valueOf())},m.toJSON=function(){return this.isValid()?this.toISOString():null},m.toISOString=function(){return this.$d.toISOString()},m.toString=function(){return this.$d.toUTCString()},M}(),b=_.prototype;return w.prototype=b,[["$ms",r],["$s",i],["$m",s],["$H",u],["$W",a],["$M",f],["$y",c],["$D",d]].forEach((function(t){b[t[1]]=function(e){return this.$g(e,t[0],t[1])}})),w.extend=function(t,e){return t.$i||(t(e,_,w),t.$i=!0),w},w.locale=S,w.isDayjs=p,w.unix=function(t){return w(1e3*t)},w.en=v[D],w.Ls=v,w.p={},w}));
},{}],4:[function(require,module,exports){
!function(_,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("dayjs")):"function"==typeof define&&define.amd?define(["dayjs"],e):(_="undefined"!=typeof globalThis?globalThis:_||self).dayjs_locale_th=e(_.dayjs)}(this,(function(_){"use strict";function e(_){return _&&"object"==typeof _&&"default"in _?_:{default:_}}var t=e(_),d={name:"th",weekdays:"อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์".split("_"),weekdaysShort:"อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัส_ศุกร์_เสาร์".split("_"),weekdaysMin:"อา._จ._อ._พ._พฤ._ศ._ส.".split("_"),months:"มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม".split("_"),monthsShort:"ม.ค._ก.พ._มี.ค._เม.ย._พ.ค._มิ.ย._ก.ค._ส.ค._ก.ย._ต.ค._พ.ย._ธ.ค.".split("_"),formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY เวลา H:mm",LLLL:"วันddddที่ D MMMM YYYY เวลา H:mm"},relativeTime:{future:"อีก %s",past:"%sที่แล้ว",s:"ไม่กี่วินาที",m:"1 นาที",mm:"%d นาที",h:"1 ชั่วโมง",hh:"%d ชั่วโมง",d:"1 วัน",dd:"%d วัน",M:"1 เดือน",MM:"%d เดือน",y:"1 ปี",yy:"%d ปี"},ordinal:function(_){return _+"."}};return t.default.locale(d,null,!0),d}));
},{"dayjs":3}],5:[function(require,module,exports){
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).dayjs_plugin_buddhistEra=e()}(this,(function(){"use strict";return function(t,e){var n=e.prototype,i=n.format;n.format=function(t){var e=this,n=(t||"YYYY-MM-DDTHH:mm:ssZ").replace(/(\[[^\]]+])|BBBB|BB/g,(function(t,n){var i,o=String(e.$y+543),f="BB"===t?[o.slice(-2),2]:[o,4];return n||(i=e.$utils()).s.apply(i,f.concat(["0"]))}));return i.bind(this)(n)}}}));
},{}],6:[function(require,module,exports){
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

},{}]},{},[1]);
