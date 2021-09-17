<template>
  <div
    class="
      flex flex-col
      items-center
      justify-center
      py-4
      px-4
      sm:px-6
      lg:px-8
      relative
    "
  >
    <LoadingOverlay v-if="$fetchState.pending" class="rounded-lg" />
    <div
      class="
        w-full
        md:max-w-screen-md
        lg:max-w-screen-lg
        xl:max-w-screen-xl
        2xl:max-w-screen-2xl
        space-y-4
      "
    >
      <div class="flex flex-row items-center">
        <div class="flex-1 text-2xl font-bold">กราฟเปรียบเทียบ</div>
        <AppButton class="w-10 h-10 rounded-full" alt="Refresh" @click="$fetch">
          <FontAwesomeIcon :icon="['fas', 'sync']" fixed-width />
        </AppButton>
      </div>
      <client-only>
        <VueChartRadar :chart-data="chartData2" />
      </client-only>
      <div class="flex flex-row items-center space-x-2">
        <h3 class="flex-1 text-2xl font-bold">ข้อมูลนักเรียน</h3>
        <AppDropdown>
          <AppButton theme="indigo" class="px-4 py-2">
            <FontAwesomeIcon :icon="['fas', 'file-export']" fixed-width />
            ส่งออก
          </AppButton>
          <template slot="menu">
            <a
              :href="link('csv')"
              download
              class="
                block
                px-4
                py-2
                text-sm text-gray-700
                hover:bg-gray-100
                active:bg-gray-200
              "
              role="menuitem"
              tabindex="-1"
            >
              CSV
            </a>
            <a
              :href="link('xlsx')"
              download
              class="
                block
                px-4
                py-2
                text-sm text-gray-700
                hover:bg-gray-100
                active:bg-gray-200
              "
              role="menuitem"
              tabindex="-1"
            >
              XLSX
            </a>
            <a
              :href="link('json')"
              download
              class="
                block
                px-4
                py-2
                text-sm text-gray-700
                hover:bg-gray-100
                active:bg-gray-200
              "
              role="menuitem"
              tabindex="-1"
            >
              JSON
            </a>
          </template>
        </AppDropdown>
      </div>
      <template v-if="userData.role !== 'student'">
        <div class="font-bold text-xl">ตัวกรอง</div>
        <StudentFilterContainer
          v-model="filters"
          :role="$store.getters.role"
          :students="studentDocs"
        />
      </template>
      <template v-if="userData.role !== 'student'">
        <div>ตัวกรอง</div>
        <div>โรงเรียน</div>
        <div>
          <NuxtLink to="/graph">
            <AppButton>กราฟเปรียบเทียบ</AppButton>
          </NuxtLink>
        </div>
      </template>
      <div ref="tabulator-summary" class="w-full" style="height: 300px"></div>
    </div>
  </div>
</template>

<script>
import Tabulator from 'tabulator-tables'
import { Radar } from 'vue-chartjs'

import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'

import LoadingOverlay from '~/components/LoadingOverlay.vue'
import StudentFilterContainer from '~/components/StudentFilterContainer.vue'

dayjs.extend(buddhistEra)

const DATA_PER_CHUNK = 50

// eslint-disable-next-line no-unused-vars
const CHART_COLORS = [
  '#3366CC',
  '#DC3912',
  '#FF9900',
  '#109618',
  '#990099',
  '#3B3EAC',
  '#0099C6',
  '#DD4477',
  '#66AA00',
  '#B82E2E',
  '#316395',
  '#994499',
  '#22AA99',
  '#AAAA11',
  '#6633CC',
  '#E67300',
  '#8B0707',
  '#329262',
  '#5574A6',
  '#3B3EAC',
]

export default {
  components: {
    VueChartRadar: Radar,
    LoadingOverlay,
    StudentFilterContainer,
  },
  middleware({ route, store, redirect }) {
    return redirect('/')
  },
  data() {
    return {
      studentDocs: [],
      selectedStudents: [],
      filters: {},
      tableSummary: null,
      chartData2: {
        labels: ['1', '2'],
        datasets: [
          {
            label: 'Data One',
            backgroundColor: '#f87979',
            data: [1, 3],
          },
          {
            label: 'Data One',
            backgroundColor: '#f87979',
            data: [2, 4],
          },
        ],
      },
      /*
      chartData: {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            label: 'A',
            data: [12, 24, 36],
            fill: true,
            backgroundColor: CHART_COLORS[0 % CHART_COLORS.length] + '80',
            borderColor: CHART_COLORS[0 % CHART_COLORS.length],
            pointBackgroundColor: CHART_COLORS[0 % CHART_COLORS.length],
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: CHART_COLORS[0 % CHART_COLORS.length],
          },
        ],
      },
      */
      chartOption: {
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
            position: 'right',
            onClick(e, legendItem, legend) {},
          },
          tooltip: {
            callbacks: {
              title(contexts) {
                const labels = contexts.reduce((arr, ele) => {
                  if (!arr.includes(ele.label)) {
                    arr.push(ele.label)
                  }
                  return arr
                }, [])
                labels.sort()

                if (labels.length > 3) {
                  const labels2 = labels.slice(0, 3)
                  labels2.push('...')
                  return labels2.join(', ')
                } else {
                  return labels.join(', ')
                }
              },
              label(context) {
                const y = context.parsed.r || context.parsed.y || '0'
                /*
                  switch (graphValueTarget) {
                    case 'correct':
                    case 'wrong':
                      return ` ${y} ข้อ`
                    case 'score':
                      return ` ${y} คะแนน`
                    case 'duration':
                      return ` ${y} หน่วย`
                    default:
                      return ` ${y}`
                  }
                  */
                return ` ${y}`
              },
            },
          },
        },
      },
    }
  },
  async fetch() {
    this.studentDocs = []

    let hasNext = true
    let prevIdStart = null

    while (hasNext) {
      const qs = [
        {
          name: 'limit',
          value: DATA_PER_CHUNK,
        },
        {
          name: 'prevIdStart',
          value: prevIdStart,
        },
      ]
        .filter((ele) => Boolean(ele.value))
        .map((ele) => `${ele.name}=${ele.value}`)
        .join('&')

      const { response } = await this.$axios.$get(`/api/report/summary?${qs}`)

      hasNext = response.hasNext
      if (hasNext) {
        this.studentDocs.push(...response.students)
        prevIdStart = response.students[response.students.length - 1]._id
      }

      // console.log(this.studentDocs.length, hasNext, prevIdStart)
    }

    if (this.tableSummary) {
      this.tableSummary.replaceData(this.studentDocs)
    }
  },
  head: {
    title: 'LD Report - กราฟข้อมูล',
  },
  computed: {
    userData() {
      return this.$store.state.user
        ? this.$store.state.user
        : {
            role: 'student',
          }
    },
    tableFilters() {
      const filters = []
      if (typeof this.filters.school === 'string') {
        filters.push({ field: 'school', type: '=', value: this.filters.school })
      }
      if (typeof this.filters.room === 'string') {
        filters.push({ field: 'room', type: '=', value: this.filters.room })
      }
      if (typeof this.filters.grade === 'string') {
        filters.push({ field: 'grade', type: '=', value: this.filters.grade })
      }
      return filters
    },
    genderThai() {
      switch (this.userData.gender) {
        case 'male':
          return 'ชาย'
        case 'female':
          return 'หญิง'
        case 'others':
        default:
          return 'อื่นๆ'
      }
    },
  },
  watch: {
    tableFilters(value) {
      if (this.tableSummary) {
        this.tableSummary.setFilter(value)
      }
    },
  },
  mounted() {
    this.initTables()
  },
  methods: {
    initTables() {
      this.tableSummary = new Tabulator(this.$refs['tabulator-summary'], {
        data: this.studentDocs,
        layout: 'fitData',
        height: '300px',
        columns: [
          {
            title: '',
            hozAlign: 'center',
            headerSort: false,
            formatter: (cell) => {
              const data = cell.getData()
              return `<a href='/student/${data._id}' class="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hover:text-gray-600 active:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </a>`
            },
            width: 16,
            frozen: true,
            resizable: false,
          },
          {
            title: 'ชื่อ-นามสกุล',
            hozAlign: 'left',
            sorter: 'string',
            formatter: (cell) => {
              const data = cell.getData()
              return `${data.firstName} ${data.lastName}`
            },
            width: 200,
            frozen: true,
          },
          {
            title: 'เพศ',
            field: 'gender',
            hozAlign: 'center',
            sorter: 'string',
            formatter: (cell) => {
              switch (cell.getValue()) {
                case 'male':
                  return 'ชาย'
                case 'female':
                  return 'หญิง'
                case 'others':
                default:
                  return 'อื่นๆ'
              }
            },
            width: 100,
          },
          {
            title: 'โรงเรียน',
            field: 'school',
            hozAlign: 'center',
            sorter: 'string',
            width: 200,
          },
          {
            title: 'ระดับชั้น',
            field: 'room',
            hozAlign: 'center',
            sorter: 'string',
            width: 100,
          },
          {
            title: 'ห้อง',
            field: 'room',
            hozAlign: 'center',
            sorter: 'string',
            width: 100,
          },
          ...new Array(9)
            .fill(undefined)
            .map((_, i) => {
              const stageNo = i + 1
              return [
                {
                  title: `ด่าน ${stageNo}`,
                  field: `stage${stageNo}`,
                  hozAlign: 'center',
                  sorter: 'summaryStar',
                  formatter: 'summaryStar',
                  width: 120,
                },
                {
                  title: `Pr`,
                  field: `stage${stageNo}`,
                  hozAlign: 'center',
                  sorter: 'pr',
                  formatter: 'pr',
                  width: 75,
                },
              ]
            })
            .reduce((result, value) => result.concat(value), []),
          {
            title: 'บอส',
            field: 'boss',
            hozAlign: 'center',
            sorter: 'summaryStar',
            formatter: 'summaryStar',
            width: 120,
          },
          {
            title: `Pr`,
            field: `boss`,
            hozAlign: 'center',
            sorter: 'pr',
            formatter: 'pr',
            width: 75,
          },
          {
            title: 'รวม',
            field: 'total',
            hozAlign: 'center',
            sorter: 'summaryStar',
            formatter: 'summaryStar',
            width: 120,
          },
          {
            title: `Pr`,
            field: `total`,
            hozAlign: 'center',
            sorter: 'pr',
            formatter: 'pr',
            width: 75,
          },
        ],
      })
      this.tableSummary.setFilter(this.tableFilters)
    },
    formatDate(date) {
      return dayjs(date).locale('th').format('D MMMM พ.ศ. BBBB H:mm น.')
    },
    link(format) {
      return `/api/report/export/summary?format=${format}`
    },
  },
  fetchOnServer: false,
}
</script>
