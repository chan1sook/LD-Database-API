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
        <h2 class="text-center text-3xl font-bold">ข้อมูลนักเรียน</h2>
      </div>
      <div class="flex flex-row items-center">
        <div class="flex-1 text-xl">
          <span class="font-bold">ชื่อ-สกุล:</span>
          {{ studentData.firstName }}
          {{ studentData.lastName }}
        </div>
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
        <div class="col-span-12">
          <span class="font-bold">เพศ:</span> {{ genderThai }}
        </div>
        <div class="col-span-12">
          <span class="font-bold">โรงเรียน:</span> {{ studentData.school }}
        </div>
        <div class="col-span-12 sm:col-span-6">
          <span class="font-bold">ชั้นเรียน:</span> {{ studentData.grade }}
        </div>
        <div class="col-span-12 sm:col-span-6">
          <span class="font-bold">ห้อง:</span> {{ studentData.room }}
        </div>
        <div class="col-span-12 sm:col-span-6">
          <span class="font-bold">ลงทะเบียนเมื่อ:</span>
          {{ formatDate(studentData.registerTimestamp) }}
        </div>
        <div class="col-span-12 sm:col-span-6">
          <span class="font-bold">แก้ไขล่าสุดเมื่อ:</span>
          {{ formatDate(studentData.lastUpdateTimestamp) }}
        </div>
      </div>
      <div class="flex flex-row items-center">
        <div class="flex-1 text-2xl font-bold">สถิติ</div>
      </div>
      <div class="grid grid-flow-row grid-cols-12 gap-2">
        <div class="col-span-12 md:col-span-6">
          <span class="font-bold">เล่นครั้งแรก:</span>
          {{ studentStat.firstPlay }}
        </div>
        <div class="col-span-12 sm:col-span-6">
          <span class="font-bold">เล่นล่าสุด:</span>
          {{ studentStat.lastPlay }}
        </div>
        <div class="col-span-12">
          <span class="font-bold">ตัวอักษรที่ผิดมากที่สุด:</span>
          <template v-if="studentStat.mostWrongAlphabets.alphabets.length > 0">
            {{ studentStat.mostWrongAlphabets.alphabets.join(', ') }}
            ({{ studentStat.mostWrongAlphabets.counts }} ครั้ง)
          </template>
          <template v-else>-</template>
        </div>
        <div class="col-span-12">
          <span class="font-bold">ตัวอักษรที่ถูกมากที่สุด:</span>
          <template
            v-if="studentStat.mostCorrectAlphabets.alphabets.length > 0"
          >
            {{ studentStat.mostCorrectAlphabets.alphabets.join(', ') }}
            ({{ studentStat.mostCorrectAlphabets.counts }} ครั้ง)
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
          v-for="stats of studentStat.alphabetsStats"
          v-show="showAlphabetGrid"
          :key="stats.alphabet"
          class="col-span-6 sm:col-span-4 sm:col-span-2 xl:col-span-2"
        >
          <span class="font-bold">{{ stats.alphabet }}:</span>
          {{ stats.corrects }}/{{ stats.wrongs }}
        </div>
      </div>
      <div class="flex flex-row items-center">
        <div class="flex-1 font-bold text-2xl">ประวัติการเล่น</div>
      </div>
      <div class="flex flex-row items-center">
        <div class="flex-1 font-bold text-xl">ด่านปกติ</div>
        <AppDropdown>
          <AppButton theme="indigo" class="px-4 py-2">
            <FontAwesomeIcon :icon="['fas', 'file-export']" fixed-width />
            ส่งออก
          </AppButton>
          <template slot="menu">
            <a
              :href="link('stage', 'csv')"
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
              :href="link('stage', 'xlsx')"
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
              :href="link('stage', 'json')"
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
      <div ref="tabulator-stage" class="h-tabulator w-full border"></div>
      <div class="flex flex-row items-center">
        <div class="flex-1 font-bold text-xl">ด่านบอส</div>
        <AppDropdown>
          <AppButton theme="indigo" class="px-4 py-2">
            <FontAwesomeIcon :icon="['fas', 'file-export']" fixed-width />
            ส่งออก
          </AppButton>
          <template slot="menu">
            <a
              :href="link('boss', 'csv')"
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
              :href="link('boss', 'xlsx')"
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
              :href="link('boss', 'json')"
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
      <div ref="tabulator-boss" class="h-tabulator w-full border"></div>
    </div>
  </div>
</template>

<script>
import { BarChart, useBarChart } from 'vue-chart-3'
import { defineComponent, computed, ref } from '@vue/composition-api'

import Tabulator from 'tabulator-tables'

import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'

import AppButton from '~/components/AppButton.vue'

dayjs.extend(buddhistEra)

const DATA_PER_CHUNK = 200

export default defineComponent({
  components: {
    BarChart,
    AppButton,
  },
  setup() {
    const studentData = ref({
      firstName: '',
      lastName: '',
      school: '',
      grade: '',
      room: '',
      gender: '',
      registerTimestamp: new Date(),
      lastUpdateTimestamp: new Date(),
    })

    function formatDate(date) {
      return dayjs(date).locale('th').format('D MMMM พ.ศ. BBBB H:mm น.')
    }

    const studentStat = computed(() => {
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

      const _studentData = studentData.value

      if (_studentData.firstPlay) {
        result.firstPlay = formatDate(_studentData.firstPlay)
      }
      if (_studentData.lastPlay) {
        result.lastPlay = formatDate(_studentData.lastPlay)
      }
      if (_studentData.alphabetsStats) {
        result.alphabetsStats = _studentData.alphabetsStats
      }
      if (_studentData.mostCorrectAlphabets) {
        result.mostCorrectAlphabets = _studentData.mostCorrectAlphabets
      }
      if (_studentData.mostWrongAlphabets) {
        result.mostWrongAlphabets = _studentData.mostWrongAlphabets
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
      const _studentStat = studentStat.value
      return {
        labels: _studentStat.alphabetsStats.map((ele) => ele.alphabet),
        datasets: [
          {
            label: 'ทั้งหมด',
            backgroundColor: '#6666FF',
            data: _studentStat.alphabetsStats.map((ele) => ele.counts),
          },
          {
            label: 'ถูก',
            backgroundColor: '#41B38A',
            data: _studentStat.alphabetsStats.map((ele) => ele.corrects),
          },
          {
            label: 'ผิด',
            backgroundColor: '#FF0000',
            data: _studentStat.alphabetsStats.map((ele) => ele.wrongs),
          },
        ],
      }
    })

    const { barChartProps, barChartRef } = useBarChart({
      chartData,
      options,
    })

    return {
      studentData,
      studentStat,
      formatDate,
      barChartProps,
      barChartRef,
    }
  },
  data() {
    return {
      stageScores: [],
      bossScores: [],
      tableStage: null,
      tableBoss: null,
      showAlphabetGrid: false,
    }
  },
  async fetch() {
    await Promise.all([
      this.fetchStageData(),
      this.fetchBossData(),
      this.fetchStudentData(),
    ])
  },
  head: {
    title: 'LD Report - ข้อมูลนักเรียน',
  },
  computed: {
    genderThai() {
      switch (this.studentData.gender) {
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
  mounted() {
    this.initTables()
  },
  methods: {
    initTables() {
      this.tableStage = new Tabulator(this.$refs['tabulator-stage'], {
        data: this.stageScores,
        layout: 'fitData',
        columns: [
          {
            title: 'ด่าน',
            field: 'stage',
            hozAlign: 'center',
            sorter: 'string',
            width: 100,
          },
          {
            title: 'ครั้งที่เล่น',
            field: 'playCount',
            sorter: 'number',
            hozAlign: 'center',
            width: 100,
          },
          {
            title: 'ความยาก',
            field: 'difficulty',
            sorter: 'number',
            hozAlign: 'center',
            width: 100,
          },
          {
            title: 'วันที่/เวลา',
            field: 'timestamp',
            sorter: 'number',
            hozAlign: 'center',
            width: 250,
            formatter: (cell, formatterParams, onRendered) => {
              return this.formatDate(cell.getValue())
            },
          },
          {
            title: 'คะแนน',
            field: 'score',
            sorter: 'number',
            hozAlign: 'center',
            width: 100,
          },
          {
            title: 'คะแนนเต็ม',
            field: 'maxScore',
            sorter: 'number',
            hozAlign: 'center',
            width: 100,
          },
          {
            title: 'ดาว',
            field: 'star',
            sorter: 'number',
            hozAlign: 'center',
            width: 150,
          },
          {
            title: 'ระยะเวลา (วินาที)',
            field: 'duration',
            sorter: 'number',
            hozAlign: 'center',
            width: 150,
          },
        ],
      })
      this.tableBoss = new Tabulator(this.$refs['tabulator-boss'], {
        data: this.bossScores,
        layout: 'fitData',
        columns: [
          {
            title: 'ด่าน',
            field: 'stage',
            hozAlign: 'center',
            sorter: 'string',
            width: 100,
          },
          {
            title: 'ครั้งที่เล่น',
            field: 'playCount',
            sorter: 'number',
            hozAlign: 'center',
            width: 100,
          },
          {
            title: 'ความยาก',
            field: 'difficulty',
            sorter: 'number',
            hozAlign: 'center',
            width: 100,
          },
          {
            title: 'วันที่/เวลา',
            field: 'timestamp',
            sorter: 'number',
            hozAlign: 'center',
            width: 250,
            formatter: (cell, formatterParams, onRendered) => {
              return this.formatDate(cell.getValue())
            },
          },
          {
            title: 'คะแนน',
            field: 'score',
            sorter: 'number',
            hozAlign: 'center',
            width: 100,
          },
          {
            title: 'คะแนนเต็ม',
            field: 'maxScore',
            sorter: 'number',
            hozAlign: 'center',
            width: 100,
          },
          {
            title: 'ดาว',
            field: 'star',
            sorter: 'number',
            hozAlign: 'center',
            width: 150,
          },
          {
            title: 'ระยะเวลา (วินาที)',
            field: 'duration',
            sorter: 'number',
            hozAlign: 'center',
            width: 150,
          },
        ],
      })
    },
    async fetchStudentData() {
      const studentId = this.$route.params.id
      const { response } = await this.$axios.$get(
        '/api/report/summary?studentId=' + studentId
      )
      if (!Array.isArray(response.students)) {
        throw new TypeError('เกิดข้อผิดพลาดในการเรียกข้อมูล')
      } else if (response.students.length > 0) {
        this.studentData = response.students[0]
      } else {
        throw new Error('ไม่พบข้อมูล')
      }
    },
    async fetchStageData() {
      this.stageData = []

      let hasNext = true
      let prevIdStart = null

      while (hasNext) {
        const qs = [
          {
            name: 'studentId',
            value: this.$route.params.id,
          },
          {
            name: 'limit',
            value: DATA_PER_CHUNK,
          },
          {
            name: 'prevIdStart',
            value: prevIdStart,
          },
          {
            name: 'flattenStudent',
            value: true,
          },
        ]
          .filter((ele) => Boolean(ele.value))
          .map((ele) => `${ele.name}=${ele.value}`)
          .join('&')

        const { response } = await this.$axios.$get(`/api/report/stage?${qs}`)

        hasNext = response.hasNext
        if (hasNext) {
          prevIdStart = response.data[response.data.length - 1]._id
        }

        this.stageData.push(...response.data)

        if (this.tableStage) {
          this.tableStage.replaceData(this.stageData)
        }
      }
    },
    async fetchBossData() {
      this.bossData = []

      let hasNext = true
      let prevIdStart = null

      while (hasNext) {
        const qs = [
          {
            name: 'studentId',
            value: this.$route.params.id,
          },
          {
            name: 'limit',
            value: DATA_PER_CHUNK,
          },
          {
            name: 'prevIdStart',
            value: prevIdStart,
          },
          {
            name: 'flattenStudent',
            value: true,
          },
        ]
          .filter((ele) => Boolean(ele.value))
          .map((ele) => `${ele.name}=${ele.value}`)
          .join('&')

        const { response } = await this.$axios.$get(`/api/report/boss?${qs}`)

        hasNext = response.hasNext
        if (hasNext) {
          prevIdStart = response.data[response.data.length - 1]._id
        }

        this.bossData.push(...response.data)

        if (this.tableBoss) {
          this.tableBoss.replaceData(this.bossData)
        }
      }
    },
    link(type, format) {
      return `/api/export/${type}?format=${format}&studentId=${this.$nuxt.$route.params.id}`
    },
  },
  fetchOnServer: false,
})
</script>
