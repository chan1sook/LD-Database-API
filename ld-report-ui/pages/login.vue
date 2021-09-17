<template>
  <div
    class="flex flex-col items-center justify-center py-6 px-4 sm:px-6 lg:px-8"
  >
    <div class="w-full md:max-w-screen-md space-y-4">
      <div>
        <AppLogo class="mx-auto w-16 h-16 w-auto" />
        <h2 class="mt-6 text-center text-3xl font-bold">เข้าสู่ระบบ</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="login">
        <input type="hidden" name="remember" value="true" />
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">ชื่อผู้ใช้</label>
            <AppInput
              v-model="username"
              type="text"
              autocomplete="username"
              placeholder="ชื่อผู้ใช้"
              required
              class="rounded-b-none"
            />
          </div>
          <div>
            <label for="password" class="sr-only">รหัสผ่าน</label>
            <div class="flex">
              <AppInput
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="password"
                placeholder="รหัสผ่าน"
                required
                class="rounded-t-none rounded-br-none"
              />
              <AppButton
                type="button"
                class="flex-none px-2 rounded-t-none rounded-bl-none"
                @click="showPassword = !showPassword"
              >
                <IconEye :off="showPassword" />
              </AppButton>
            </div>
          </div>
        </div>

        <div>
          <AppButton
            type="submit"
            class="w-full py-2 px-4"
            :disabled="!formValid"
          >
            เข้าสู่ระบบ
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
      showPassword: false,
      username: '',
      password: '',
    }
  },
  head: {
    title: 'LD Report - เข้าสู่ระบบ',
  },
  computed: {
    formValid() {
      return this.username !== '' && this.password !== ''
    },
  },
  methods: {
    async login() {
      if (!this.formValid) {
        return this.addNotification({
          type: 'error',
          title: 'LD Report',
          message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          timeout: 5000,
        })
      }

      try {
        const { response: userData } = await this.$axios.$post('/api/login', {
          username: this.username,
          password: this.password,
        })
        this.$store.commit('SET_USER', userData)

        this.addNotification({
          type: 'success',
          title: 'LD Report',
          message: 'เข้าสู่ระบบสำเร็จ',
          timeout: 5000,
        })

        this.$router.push('/')
      } catch (error) {
        let errorMessage = 'เข้าสู่ระบบไม่สำเร็จ'
        if (error.response && error.response.data) {
          const resBody = error.response.data
          if (resBody.response.error === 'Invalid Username/Password') {
            errorMessage = 'ชื่อผู้ใช้/รหัสผ่านไม่ถูกต้อง'
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
