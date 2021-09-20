<template>
  <div class="grid grid-flow-row grid-cols-12 gap-2 items-center">
    <span class="col-span-2 md:col-span-1 text-center">โรงเรียน</span>
    <VueSelect
      :value="isValueNotNull(value.student) ? value.student : null"
      :disabled="role === 'teacher'"
      class="col-span-10 md:col-span-5 lg:col-span-3"
      :reduce="(option) => option.value"
      :options="schoolOptions"
      placeholder="โรงเรียน"
      @input="emitInput('school', $event)"
    />
    <span class="col-span-2 md:col-span-1 text-center">ชั้นเรียน</span>
    <VueSelect
      :value="isValueNotNull(value.grade) ? value.grade : null"
      class="col-span-10 md:col-span-5 lg:col-span-3"
      :reduce="(option) => option.value"
      :options="gradeOptions"
      placeholder="ชั้นเรียน"
      @input="emitInput('grade', $event)"
    />
    <span class="col-span-2 md:col-span-1 text-center">ห้อง</span>
    <VueSelect
      :value="isValueNotNull(value.room) ? value.room : null"
      class="col-span-10 md:col-span-5 lg:col-span-3"
      :reduce="(option) => option.value"
      :options="roomOptions"
      placeholder="ห้อง"
      @input="emitInput('room', $event)"
    />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default() {
        return {
          student: null,
          grade: null,
          room: null,
        }
      },
    },
    role: {
      type: String,
      default: 'admin',
    },
    students: {
      type: Array,
      default() {
        return []
      },
    },
  },
  computed: {
    schoolOptions() {
      const allSchools = Array.from(
        new Set(this.students.map((ele) => ele.school))
      )
      return [{ label: 'ทั้งหมด', value: null }].concat(
        allSchools.map((ele) => {
          return {
            label: ele,
            value: ele,
          }
        })
      )
    },
    gradeOptions() {
      const allGrades = Array.from(
        new Set(this.students.map((ele) => ele.grade))
      )
      return [{ label: 'ทั้งหมด', value: null }].concat(
        allGrades.map((ele) => {
          return {
            label: ele,
            value: ele,
          }
        })
      )
    },
    roomOptions() {
      const allRooms = Array.from(new Set(this.students.map((ele) => ele.room)))
      return [{ label: 'ทั้งหมด', value: null }].concat(
        allRooms.map((ele) => {
          return {
            label: ele,
            value: ele,
          }
        })
      )
    },
  },
  methods: {
    isValueNotNull(value) {
      return value !== null && typeof value !== 'undefined'
    },
    emitInput(type, value) {
      const emitData = Object.assign(Object.assign({}, this.value), {
        [type]: value,
      })
      this.$emit('input', emitData)
    },
  },
}
</script>
