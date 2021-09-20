<template>
  <div
    class="
      flex flex-col
      items-center
      justify-start
      py-4
      px-4
      sm:px-6
      lg:px-8
      relative
    "
  >
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
      <div>
        <h2 class="text-center text-3xl font-bold">ระบบหลังบ้าน LD</h2>
      </div>
      <div class="flex flex-row items-center">
        <div class="flex-1 text-2xl font-bold">ภาพรวม</div>
        <AppButton
          class="w-10 h-10 rounded-full"
          alt="Refresh"
          :disabled="$fetchState.pending"
          @click="$fetch"
        >
          <FontAwesomeIcon
            :icon="['fas', 'sync']"
            :spin="$fetchState.pending"
            fixed-width
          />
        </AppButton>
      </div>
      <div class="grid grid-flow-row grid-cols-12 gap-2">
        <div
          v-if="['admin', 'expert'].includes(userData.role)"
          class="col-span-12 lg:col-span-6"
        >
          <span class="font-bold">จำนวนโรงเรียน:</span>
          {{ schools.length }}
        </div>
        <div
          v-if="userData.role !== 'student'"
          class="col-span-12 lg:col-span-6"
        >
          <span class="font-bold">จำนวนนักเรียน:</span>
          {{ studentDocs.length }}
        </div>
        <template v-else class="col-span-12">
          <div class="col-span-12">
            <span class="text-xl font-bold">ชื่อ-นามสกุล:</span>
            {{ userData.firstName }} {{ userData.lastName }}
          </div>
          <div class="col-span-12 md:col-span-6">
            <span class="font-bold">เพศ:</span> {{ genderThai }}
          </div>
          <div class="col-span-12 md:col-span-6">
            <span class="font-bold">โรงเรียน:</span> {{ userData.school }}
          </div>
          <div
            v-if="userData.role === 'student'"
            class="col-span-12 sm:col-span-6"
          >
            <span class="font-bold">ชั้นเรียน:</span> {{ userData.grade }}
          </div>
          <div
            v-if="userData.role === 'student'"
            class="col-span-12 sm:col-span-6"
          >
            <span class="font-bold">ห้อง:</span> {{ userData.room }}
          </div>
        </template>
      </div>
      <template v-if="userData.role === 'student'">
        <div class="flex flex-row items-center">
          <div class="flex-1 text-2xl font-bold">สถิติ</div>
        </div>
        <div class="grid grid-flow-row grid-cols-12 gap-2">
          <div class="col-span-12 md:col-span-6">
            <span class="font-bold">เล่นครั้งแรก:</span>
            {{ firstStudentStats.firstPlay }}
          </div>
          <div class="col-span-12 sm:col-span-6">
            <span class="font-bold">เล่นล่าสุด:</span>
            {{ firstStudentStats.lastPlay }}
          </div>
          <div class="col-span-12">
            <span class="font-bold">ตัวอักษรที่ผิดมากที่สุด:</span>
            <template
              v-if="firstStudentStats.mostWrongAlphabets.alphabets.length > 0"
            >
              {{ firstStudentStats.mostWrongAlphabets.alphabets.join(', ') }}
              ({{ firstStudentStats.mostWrongAlphabets.counts }} ครั้ง)
            </template>
            <template v-else>-</template>
          </div>
          <div class="col-span-12">
            <span class="font-bold">ตัวอักษรที่ถูกมากที่สุด:</span>
            <template
              v-if="firstStudentStats.mostCorrectAlphabets.alphabets.length > 0"
            >
              {{ firstStudentStats.mostCorrectAlphabets.alphabets.join(', ') }}
              ({{ firstStudentStats.mostCorrectAlphabets.counts }} ครั้ง)
            </template>
            <template v-else>-</template>
          </div>
          <div class="col-span-12">
            <span class="font-bold">สถิติตัวอักษร</span>
          </div>
          <div class="col-span-12">
            <client-only>
              <BarChart v-bind="barChartProps" />
            </client-only>
          </div>
          <div class="col-span-12">
            <AppButton
              class="px-4 py-2"
              @click="showAlphabetGrid = !showAlphabetGrid"
            >
              ซ่อน/แสดง
            </AppButton>
          </div>
          <div
            v-for="stats of firstStudentStats.alphabetsStats"
            v-show="showAlphabetGrid"
            :key="stats.alphabet"
            class="col-span-6 sm:col-span-4 sm:col-span-2 xl:col-span-2"
          >
            <span class="font-bold">{{ stats.alphabet }}:</span>
            {{ stats.corrects }}/{{ stats.wrongs }}
          </div>
        </div>
      </template>
      <div class="grid grid-flow-row grid-cols-12 gap-2 items-center">
        <h3 class="col-span-12 md:col-span-4 text-2xl font-bold">
          ข้อมูลนักเรียน
        </h3>
        <div class="col-span-12 md:col-span-8 gap-2 text-center md:text-right">
          <NuxtLink to="/rawdata">
            <AppButton class="px-4 py-2">
              <FontAwesomeIcon :icon="['fas', 'database']" fixed-width />
              ข้อมูลดิบ
            </AppButton>
          </NuxtLink>
          <AppDropdown class="inline-block">
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
                  text-left text-sm text-gray-700
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
                  text-left text-sm text-gray-700
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
                  text-left text-sm text-gray-700
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
      </div>
      <div class="font-bold text-xl">ตัวกรอง</div>
      <StudentFilterContainer
        v-model="filters"
        :role="$store.getters.role"
        :students="studentDocs"
      />
      <div ref="tabulator-summary" class="h-tabulator w-full border"></div>
    </div>
  </div>
</template>

<script>
import { BarChart, useBarChart } from 'vue-chart-3'
import { defineComponent, ref, computed } from '@vue/composition-api'

import Tabulator from 'tabulator-tables'

import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'

import StudentFilterContainer from '~/components/StudentFilterContainer.vue'

dayjs.extend(buddhistEra)

const DATA_PER_CHUNK = 10

export default defineComponent({
  components: {
    BarChart,
    StudentFilterContainer,
  },
  loading: {
    continuous: true,
  },
  setup() {
    const studentDocs = ref([])

    function formatDate(date) {
      return dayjs(date).locale('th').format('D MMMM พ.ศ. BBBB H:mm น.')
    }

    const firstStudentStats = computed(() => {
      const result = {
        firstPlay: '-',
        lastPlay: '-',
        alphabetsStats: [],
        mostCorrectAlphabets: {
          alphabets: [],
          counts: 0,
        },
        mostWrongAlphabets: {
          alphabets: [],
          counts: 0,
        },
      }

      const _studentDocs = studentDocs.value
      if (_studentDocs.length > 0) {
        if (_studentDocs[0].firstPlay) {
          result.firstPlay = formatDate(_studentDocs[0].firstPlay)
        }
        if (_studentDocs[0].lastPlay) {
          result.lastPlay = formatDate(_studentDocs[0].lastPlay)
        }

        result.alphabetsStats = _studentDocs[0].alphabetsStats
        result.mostCorrectAlphabets = _studentDocs[0].mostCorrectAlphabets
        result.mostWrongAlphabets = _studentDocs[0].mostWrongAlphabets
      }

      return result
    })
    const options = computed(() => ({
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    }))
    const chartData = computed(() => {
      const _firstStudentStats = firstStudentStats.value
      return {
        labels: _firstStudentStats.alphabetsStats.map((ele) => ele.alphabet),
        datasets: [
          {
            label: 'ทั้งหมด',
            backgroundColor: '#6666FF',
            data: _firstStudentStats.alphabetsStats.map((ele) => ele.counts),
          },
          {
            label: 'ถูก',
            backgroundColor: '#41B38A',
            data: _firstStudentStats.alphabetsStats.map((ele) => ele.corrects),
          },
          {
            label: 'ผิด',
            backgroundColor: '#FF0000',
            data: _firstStudentStats.alphabetsStats.map((ele) => ele.wrongs),
          },
        ],
      }
    })

    const { barChartProps, barChartRef } = useBarChart({
      chartData,
      options,
    })

    return {
      studentDocs,
      firstStudentStats,
      formatDate,
      barChartProps,
      barChartRef,
    }
  },
  data() {
    return {
      tableSummary: null,
      filters: {},
      showAlphabetGrid: false,
    }
  },
  async fetch() {
    await this.fetchSummary()
  },
  head: {
    title: 'LD Report - หน้าหลัก',
  },
  computed: {
    userData() {
      return this.$store.state.user
        ? this.$store.state.user
        : {
            role: 'student',
          }
    },
    schools() {
      return Array.from(new Set(this.studentDocs.map((ele) => ele.school)))
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
      if (!this.$refs['tabulator-summary']) {
        return
      }

      this.tableSummary = new Tabulator(this.$refs['tabulator-summary'], {
        data: this.studentDocs,
        layout: 'fitData',
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
    async fetchSummary() {
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
          prevIdStart = response.students[response.students.length - 1]._id
        }

        this.studentDocs.push(...response.students)

        if (this.tableSummary) {
          this.tableSummary.replaceData(this.studentDocs)
        }
      }
    },
    link(format) {
      return `/api/report/export/summary?format=${format}`
    },
  },
  fetchOnServer: false,
})
</script>
