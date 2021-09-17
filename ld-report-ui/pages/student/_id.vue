<template>
  <div
    class="flex flex-col items-center justify-center py-4 px-4 sm:px-6 lg:px-8"
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
          @click="$nuxt.refresh"
        >
          <FontAwesomeIcon :icon="['fas', 'sync']" fixed-width />
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

import AppButton from '~/components/AppButton.vue'

dayjs.extend(buddhistEra)

export default {
  components: {
    AppButton,
  },
  async asyncData({ $axios, params }) {
    const studentId = params.id
    const { response: responseStage } = await $axios.$get(
      '/api/scores/stage?studentId=' + studentId
    )
    const { response: responseBoss } = await $axios.$get(
      '/api/scores/boss?studentId=' + studentId
    )

    if (!Array.isArray(responseStage) || !Array.isArray(responseBoss)) {
      throw new TypeError('เกิดความผิดพลาดทาง Server')
    }

    const targetStageData = responseStage.find(
      (studentData) => studentData._id === studentId
    )
    const targetBossData = responseBoss.find(
      (studentData) => studentData._id === studentId
    )

    const studentData = {}
    if (targetStageData) {
      Object.assign(studentData, targetStageData)
      studentData.stageScores = targetStageData.scores
    } else {
      studentData.stageScores = []
    }

    if (targetBossData) {
      Object.assign(studentData, targetBossData)
      studentData.bossScores = targetBossData.scores
    } else {
      studentData.bossScores = []
    }

    if (studentData._id) {
      delete studentData.scores
      return {
        studentData,
      }
    } else {
      throw new Error('ไม่พบข้อมูล')
    }
  },
  data() {
    return {
      studentData: {
        firstName: '',
        lastName: '',
        school: '',
        grade: '',
        room: '',
        gender: '',
        registerTimestamp: new Date(),
        lastUpdateTimestamp: new Date(),
        stageScores: [],
        bossScores: [],
      },
      tableStage: null,
      tableBoss: null,
    }
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
    stageScores() {
      return this.studentData.stageScores
    },
    bossScores() {
      return this.studentData.bossScores
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
        height: '300px',
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
        height: '300px',
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
    formatDate(date) {
      return dayjs(date).locale('th').format('D MMMM พ.ศ. BBBB H:mm น.')
    },
    link(type, format) {
      return `/api/export/${type}?format=${format}&studentId=${this.$nuxt.$route.params.id}`
    },
  },
}
</script>
