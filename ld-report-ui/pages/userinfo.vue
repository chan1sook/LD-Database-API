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
        <h2 class="text-center text-3xl font-bold">ข้อมูลผู้ใช้</h2>
      </div>
      <img
        class="h-36 w-36 rounded-full m-auto"
        :src="$store.getters.userImage"
        alt="User Avatar"
      />
      <div class="text-xl">
        <span class="font-bold">ชื่อ-สกุล:</span>
        {{ userData.firstName }}
        {{ userData.lastName }}
      </div>
      <div class="grid grid-flow-row grid-cols-12 gap-2">
        <div class="col-span-12 sm:col-span-6">
          <span class="font-bold">สถานะ:</span> {{ roleThai }}
        </div>
        <div class="col-span-12 sm:col-span-6">
          <span class="font-bold">เพศ:</span> {{ genderThai }}
        </div>
        <div class="col-span-12">
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
        <div class="col-span-12 sm:col-span-6">
          <span class="font-bold">ลงทะเบียนเมื่อ:</span>
          {{ formatDate(userData.registerTimestamp) }}
        </div>
        <div class="col-span-12 sm:col-span-6">
          <span class="font-bold">แก้ไขล่าสุดเมื่อ:</span>
          {{ formatDate(userData.lastUpdateTimestamp) }}
        </div>
        <div class="col-span-12 text-center">
          <AppButton theme="red" class="px-4 py-2" @click="logout">
            ออกจากระบบ
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'

import AppButton from '~/components/AppButton.vue'

dayjs.extend(buddhistEra)

export default {
  components: {
    AppButton,
  },
  data() {
    return {}
  },
  head: {
    title: 'LD Report - ข้อมูลผู้ใช้',
  },
  computed: {
    userData() {
      return this.$store.state.user ? this.$store.state.user : {}
    },
    roleThai() {
      switch (this.userData.role) {
        case 'student':
          return 'นักเรียน'
        case 'teacher':
          return 'ครู'
        case 'school':
          return 'โรงเรียน'
        case 'expert':
          return 'นักวิจัย/นักวิชาการ'
        case 'admin':
          return 'ผู้ดูแลระบบ'
        case 'guest':
        default:
          return 'อื่นๆ'
      }
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
  methods: {
    formatDate(date) {
      return dayjs(date).locale('th').format('D MMMM พ.ศ. BBBB H:mm น.')
    },
    async logout() {
      try {
        await this.$axios.$post('/api/logout')
        this.$store.commit('SET_USER', null)

        this.addNotification({
          type: 'success',
          title: 'LD Report',
          message: 'ออกจากระบบสำเร็จ',
          timeout: 5000,
        })

        this.$router.push('/login')
      } catch (error) {
        this.addNotification({
          type: 'error',
          title: 'LD Report',
          message: 'ออกจากระบบไม่สำเร็จ',
          timeout: 5000,
        })
      }
    },
  },
}
</script>
