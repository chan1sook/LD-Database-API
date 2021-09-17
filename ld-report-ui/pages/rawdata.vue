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
      <div class="relative">
        <h2 class="text-center text-3xl font-bold">ข้อมูลดิบ</h2>
        <div class="absolute right-0 top-1/2 transform -translate-y-1/2">
          <AppButton
            class="absolute right-0 w-10 h-10 rounded-full"
            alt="Refresh"
            @click="$fetch"
          >
            <FontAwesomeIcon :icon="['fas', 'sync']" fixed-width />
          </AppButton>
        </div>
      </div>
      <div class="font-bold text-xl">ตัวกรอง</div>
      <StudentFilterContainer
        v-model="filters"
        :role="$store.getters.role"
        :students="studentDocs"
      />
      <div class="flex flex-row items-center">
        <div class="flex-1 font-bold text-2xl">ด่านปกติ</div>
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
      <div
        ref="tabulator-stage"
        class="w-full border"
        style="height: 300px"
      ></div>
      <div class="flex flex-row items-center">
        <div class="flex-1 font-bold text-2xl">ด่านบอส</div>
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
      <div
        ref="tabulator-boss"
        class="w-full border"
        style="height: 300px"
      ></div>
    </div>
  </div>
</template>

<script>
import Tabulator from 'tabulator-tables'

import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'

import LoadingOverlay from '~/components/LoadingOverlay.vue'
import StudentFilterContainer from '~/components/StudentFilterContainer.vue'

const DATA_PER_CHUNK = 200
const STUDENT_PER_CHUNK = 50

dayjs.extend(buddhistEra)

export default {
  components: {
    LoadingOverlay,
    StudentFilterContainer,
  },
  middleware({ route, store, redirect }) {
    if (!['admin', 'expert'].includes(store.getters.role)) {
      return redirect('/')
    }
  },
  data() {
    return {
      studentDocs: [],
      stageData: [],
      bossData: [],
      filters: {},
      tableStage: null,
      tableBoss: null,
    }
  },
  async fetch() {
    await this.fetchStageData()
    await this.fetchBossData()
    await this.fetchStudentData()

    if (this.tableStage) {
      this.tableStage.replaceData(this.stageData)
    }
    if (this.tableBoss) {
      this.tableBoss.replaceData(this.bossData)
    }
  },
  head: {
    title: 'LD Report - ข้อมูลดิบ',
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
      if (this.tableStage) {
        this.tableStage.setFilter(value)
      }
      if (this.tableBoss) {
        this.tableBoss.setFilter(value)
      }
    },
  },
  mounted() {
    this.initTables()
  },
  methods: {
    initTables() {
      this.tableStage = new Tabulator(this.$refs['tabulator-stage'], {
        data: this.stageData,
        layout: 'fitData',
        height: '300px',
        columns: [
          'timestamp',
          'datetime',
          'firstName',
          'lastName',
          'gender',
          'school',
          'grade',
          'room',
          'stage',
          'difficulty',
          'playCount',
          'score',
          'maxScore',
          'duration',
          'questionNo',
          'questionAlphabet',
          'questionWord',
          'answerDuration',
          'answerAlphabet',
          'answerScore',
          'isCorrect',
        ].map((ele) => {
          return {
            title: ele,
            field: ele,
          }
        }),
      })
      this.tableBoss = new Tabulator(this.$refs['tabulator-boss'], {
        data: this.bossData,
        layout: 'fitData',
        height: '300px',
        columns: [
          'timestamp',
          'datetime',
          'firstName',
          'lastName',
          'gender',
          'school',
          'grade',
          'room',
          'stage',
          'difficulty',
          'playCount',
          'score',
          'maxScore',
          'duration',
          'questionNo',
          'questionAlphabet',
          'answerDuration',
          'answerAlphabet',
          'answerScore',
          'isCorrect',
        ].map((ele) => {
          return {
            title: ele,
            field: ele,
          }
        }),
      })

      this.tableStage.setFilter(this.tableFilters)
      this.tableBoss.setFilter(this.tableFilters)
    },
    async fetchStageData() {
      this.stageData = []

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

        const { response } = await this.$axios.$get(`/api/report/stage?${qs}`)

        hasNext = response.hasNext
        if (hasNext) {
          prevIdStart = response.data[response.data.length - 1]._id
        }

        this.stageData.push(...response.data)

        // console.log(this.stageData.length, hasNext, prevIdStart)
      }
    },
    async fetchBossData() {
      this.bossData = []

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

        const { response } = await this.$axios.$get(`/api/report/boss?${qs}`)

        hasNext = response.hasNext
        if (hasNext) {
          prevIdStart = response.data[response.data.length - 1]._id
        }

        this.stageData.push(...response.data)

        // console.log(this.bossData.length, hasNext, prevIdStart)
      }
    },
    async fetchStudentData() {
      this.studentDocs = []

      let hasNext = true
      let prevIdStart = null

      while (hasNext) {
        const qs = [
          {
            name: 'limit',
            value: STUDENT_PER_CHUNK,
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

        // console.log(this.studentDocs.length, hasNext, prevIdStart)
      }
    },
    link(type, format) {
      return `/api/export/${type}?format=${format}`
    },
  },
  fetchOnServer: false,
}
</script>
