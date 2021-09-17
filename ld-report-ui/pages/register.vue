<template>
  <div
    class="flex flex-col items-center justify-center py-6 px-4 sm:px-6 lg:px-8"
  >
    <div class="w-full md:max-w-screen-md space-y-4">
      <div>
        <AppLogo class="mx-auto w-16 h-16 w-auto" />
        <h2 class="mt-6 text-center text-3xl font-bold">ลงทะเบียน</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="register">
        <input type="hidden" name="remember" value="true" />
        <div class="rounded-md shadow-sm space-y-2">
          <div>
            <label for="first-name">ชื่อ</label>
            <AppInput
              v-model="firstName"
              type="text"
              autocomplete="first-name"
              required
              placeholder="ชื่อ"
            />
          </div>
          <div>
            <label for="last-name">นามสกุล</label>
            <AppInput
              v-model="lastName"
              type="text"
              autocomplete="last-name"
              required
              placeholder="นามสกุล"
            />
          </div>
          <div>
            <label for="gender">เพศ</label>
            <VueSelect
              v-model="gender"
              required
              :reduce="(option) => option.value"
              :options="[
                { label: 'ชาย', value: 'male' },
                { label: 'หญิง', value: 'female' },
                { label: 'อื่นๆ', value: 'others' },
              ]"
              placeholder="เพศ"
            />
          </div>
          <div>
            <label for="role">ลงทะเบียนเป็น</label>

            <VueSelect
              v-model="role"
              required
              :reduce="(option) => option.value"
              :options="[
                { label: 'ครู', value: 'teacher' },
                { label: 'โรงเรียน', value: 'school' },
                { label: 'นักวิจัย/นักวิชาการ', value: 'expert' },
              ]"
              placeholder="ประเภท"
            />
          </div>
          <div>
            <label for="school">โรงเรียน</label>
            <AppInput
              v-model="school"
              type="text"
              autocomplete="school"
              required
              placeholder="โรงเรียน"
            />
          </div>
          <div>
            <label for="username">ชื่อผู้ใช้</label>
            <AppInput
              v-model="username"
              type="text"
              autocomplete="username"
              required
              placeholder="ชื่อผู้ใช้"
            />
          </div>
          <div>
            <label for="password">รหัสผ่าน</label>
            <div class="flex">
              <AppInput
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="password"
                class="flex-1 rounded-r-none"
                placeholder="รหัสผ่าน"
              />
              <AppButton
                type="button"
                class="flex-none px-2 rounded-l-none"
                @click="showPassword = !showPassword"
              >
                <IconEye :off="showPassword" />
              </AppButton>
            </div>
          </div>
          <div>
            <label for="confirm-password">ยืนยันรหัสผ่าน</label>
            <div class="flex">
              <AppInput
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="flex-1 rounded-r-none"
                placeholder="ยืนยันรหัสผ่าน"
              />
              <AppButton
                type="button"
                class="flex-none px-2 rounded-l-none"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <IconEye :off="showConfirmPassword" />
              </AppButton>
            </div>
          </div>
        </div>

        <div>
          <AppButton type="submit" class="w-full py-2 px-4">
            ลงทะเบียน
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AppLogo from '~/components/AppLogo.vue'
import AppButton from '~/components/AppButton.vue'
import AppInput from '~/components/AppInput.vue'
import IconEye from '~/components/IconEye.vue'

export default {
  components: {
    AppLogo,
    AppButton,
    AppInput,
    IconEye,
  },
  inject: ['addNotification'],
  data() {
    return {
      firstName: '',
      lastName: '',
      gender: 'male',
      role: 'teacher',
      school: '',
      username: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
    }
  },
  head: {
    title: 'LD Report - ลงทะเบียน',
  },
  computed: {
    formValid() {
      return (
        this.firstName !== '' &&
        this.lastName !== '' &&
        this.school !== '' &&
        this.username !== '' &&
        this.passwordValid
      )
    },
    passwordValid() {
      return this.password !== '' && this.confirmPassword === this.password
    },
  },
  methods: {
    async register() {
      if (!this.passwordValid) {
        return this.addNotification({
          type: 'error',
          title: 'LD Report',
          message: 'กรุณากรอกรหัสผ่านให้ตรงกัน',
          timeout: 5000,
        })
      }
      if (!this.formValid) {
        return this.addNotification({
          type: 'error',
          title: 'LD Report',
          message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          timeout: 5000,
        })
      }

      try {
        await this.$axios.$post('/api/register', {
          firstName: this.firstName,
          lastName: this.lastName,
          gender: this.gender,
          role: this.role,
          school: this.school,
          username: this.username,
          password: this.password,
        })

        this.addNotification({
          type: 'success',
          title: 'LD Report',
          message: 'ลงทะเบียนสำเร็จ',
          timeout: 5000,
        })
        this.$router.push('/login')
      } catch (error) {
        let errorMessage = 'ลงทะเบียนไม่สำเร็จ'
        if (error.response && error.response.data && error.response.data) {
          if (error.response.data.response.error === 'Username Duplicate') {
            errorMessage = 'ชื่อผู้ใช้ซ้ำกัน'
          }
        }

        this.addNotification({
          type: 'error',
          title: 'LD Report',
          message: errorMessage,
          timeout: 5000,
        })
      }
    },
  },
}
</script>
