<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div class="relative flex items-center justify-between h-16">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <button
            type="button"
            class="
              inline-flex
              items-center
              justify-center
              p-2
              rounded-md
              text-gray-400
              hover:text-white hover:bg-indigo-700
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white
              text-xl
            "
            aria-controls="mobile-menu"
            aria-expanded="false"
            @click="toggleMenu(!showMenu)"
          >
            <span class="sr-only">เปิดเมนู</span>
            <FontAwesomeIcon
              v-if="!showMenu"
              :icon="['fas', 'bars']"
              fixed-width
            />
            <FontAwesomeIcon v-else :icon="['fas', 'times']" fixed-width />
          </button>
        </div>
        <div
          class="
            flex-1 flex
            items-center
            justify-center
            sm:items-stretch sm:justify-start
          "
        >
          <div class="flex-shrink-0 flex items-center">
            <AppLogo class="block lg:block w-8 h-8 w-auto" />
          </div>
        </div>
        <div class="absolute right-0 flex items-center pr-2 space-x-4">
          <div v-if="!isLoggin" class="hidden sm:block space-x-1">
            <NuxtLink to="/register">
              <AppButton outlined class="px-4 py-2"> ลงทะเบียน </AppButton>
            </NuxtLink>
            <NuxtLink to="/login">
              <AppButton class="px-4 py-2"> เข้าสู่ระบบ </AppButton>
            </NuxtLink>
          </div>
          <template v-else>
            <div class="hidden sm:block">
              {{ $store.state.user.firstName }}
              {{ $store.state.user.lastName }}
            </div>
            <AppDropdown class="hidden sm:block">
              <div>
                <button
                  type="button"
                  class="
                    bg-gray-800
                    flex
                    text-sm
                    rounded-full
                    focus:outline-none
                    focus:ring-2
                    focus:ring-offset-2
                    focus:ring-offset-gray-800
                    focus:ring-white
                  "
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <img
                    class="h-8 w-8 rounded-full"
                    :src="$store.getters.userImage"
                    alt=""
                  />
                </button>
              </div>
              <template slot="menu">
                <template v-if="isLoggin">
                  <NuxtLink to="/">
                    <button
                      type="button"
                      class="
                        block
                        px-4
                        py-2
                        w-full
                        text-left text-sm text-gray-700
                        hover:bg-gray-100
                        active:bg-gray-200
                      "
                      role="menuitem"
                      tabindex="-1"
                    >
                      หน้าหลัก
                    </button>
                  </NuxtLink>
                  <NuxtLink
                    v-if="
                      ['admin', 'expert', 'teacher'].includes(
                        $store.getters.role
                      )
                    "
                    to="/rawdata"
                  >
                    <button
                      type="button"
                      class="
                        block
                        px-4
                        py-2
                        w-full
                        text-left text-sm text-gray-700
                        hover:bg-gray-100
                        active:bg-gray-200
                      "
                      role="menuitem"
                      tabindex="-1"
                    >
                      ข้อมูลดิบ
                    </button>
                  </NuxtLink>
                  <div style="height: 1px" class="w-full bg-gray-200"></div>
                  <NuxtLink to="/userinfo">
                    <button
                      type="button"
                      class="
                        block
                        px-4
                        py-2
                        w-full
                        text-left text-sm text-gray-700
                        hover:bg-gray-100
                        active:bg-gray-200
                      "
                      role="menuitem"
                      tabindex="-1"
                    >
                      ข้อมูลผู้ใช้
                    </button>
                  </NuxtLink>
                  <button
                    type="button"
                    class="
                      block
                      px-4
                      py-2
                      w-full
                      text-red-500 text-left text-sm text-gray-700
                      hover:bg-red-100
                      active:bg-red-200
                    "
                    role="menuitem"
                    tabindex="-1"
                    @click="logout"
                  >
                    ออกจากระบบ
                  </button>
                </template>
                <template v-else>
                  <NuxtLink to="/login">
                    <button
                      type="button"
                      class="
                        block
                        px-4
                        py-2
                        w-full
                        text-left text-sm text-gray-700
                        hover:bg-gray-100
                        active:bg-gray-200
                      "
                      role="menuitem"
                      tabindex="-1"
                      @click="logout"
                    >
                      เข้าสู่ระบบ
                    </button>
                  </NuxtLink>
                  <NuxtLink to="/register">
                    <button
                      type="button"
                      class="
                        block
                        px-4
                        py-2
                        w-full
                        text-left text-sm text-gray-700
                        hover:bg-gray-100
                        active:bg-gray-200
                      "
                      role="menuitem"
                      tabindex="-1"
                      @click="logout"
                    >
                      ลงทะเบียน
                    </button>
                  </NuxtLink>
                </template>
              </template>
            </AppDropdown>
          </template>
        </div>
      </div>
    </div>

    <transition :duration="200">
      <div v-if="showMenu" class="transition duration-200 sm:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <template v-if="!isLoggin">
            <a
              href="/register"
              class="
                transition
                duration-200
                block
                px-3
                py-2
                rounded-md
                text-base
                font-medium
              "
              :class="
                currentRoute === '/register'
                  ? ['bg-indigo-700', 'text-white']
                  : [
                      'hover:bg-indigo-500',
                      'hover:text-white',
                      'active:bg-indigo-700',
                    ]
              "
            >
              ลงทะเบียน
            </a>
            <a
              href="/login"
              class="
                transition
                duration-200
                block
                px-3
                py-2
                rounded-md
                text-base
                font-medium
              "
              :class="
                currentRoute === '/login'
                  ? ['bg-indigo-700', 'text-white']
                  : [
                      'hover:bg-indigo-500',
                      'hover:text-white',
                      'active:bg-indigo-700',
                    ]
              "
            >
              เข้าสู่ระบบ
            </a>
          </template>
          <template v-else>
            <a
              href="/"
              class="
                transition
                duration-200
                block
                px-3
                py-2
                rounded-md
                text-base
                font-medium
              "
              :class="
                currentRoute === '/'
                  ? ['bg-indigo-700', 'text-white']
                  : [
                      'hover:bg-indigo-500',
                      'hover:text-white',
                      'active:bg-indigo-700',
                    ]
              "
            >
              หน้าหลัก
            </a>
            <a
              v-if="
                ['admin', 'expert', 'teacher'].includes($store.getters.role)
              "
              href="/rawdata"
              class="
                transition
                duration-200
                block
                px-3
                py-2
                rounded-md
                text-base
                font-medium
              "
              :class="
                currentRoute === '/'
                  ? ['bg-indigo-700', 'text-white']
                  : [
                      'hover:bg-indigo-500',
                      'hover:text-white',
                      'active:bg-indigo-700',
                    ]
              "
            >
              ข้อมูลดิบ
            </a>
            <a
              href="/userinfo"
              class="
                transition
                duration-200
                block
                px-3
                py-2
                rounded-md
                text-base
                font-medium
              "
              :class="
                currentRoute === '/userinfo'
                  ? ['bg-indigo-700', 'text-white']
                  : [
                      'hover:bg-indigo-500',
                      'hover:text-white',
                      'active:bg-indigo-700',
                    ]
              "
            >
              ข้อมูลผู้ใช้
            </a>
            <button
              class="
                transition
                duration-200
                block
                w-full
                px-3
                py-2
                rounded-md
                text-left text-base text-red-500
                font-medium
                hover:bg-red-300 hover:text-black
                active:bg-red-500 active:text-white
              "
              @click="logout"
            >
              ออกจากระบบ
            </button>
          </template>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script>
import AppLogo from '~/components/AppLogo.vue'
import AppButton from '~/components/AppButton.vue'
import AppDropdown from '~/components/AppDropdown.vue'

export default {
  components: {
    AppLogo,
    AppButton,
    AppDropdown,
  },
  inject: ['addNotification'],
  data() {
    return {
      showMenu: false,
    }
  },
  computed: {
    isLoggin() {
      return this.$store.getters.role !== 'guest'
    },
    currentRoute() {
      return '/' + this.$nuxt.$route.name
    },
  },
  methods: {
    toggleMenu(state) {
      this.showMenu = state
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
