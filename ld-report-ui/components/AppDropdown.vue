<template>
  <div class="relative">
    <div @click.stop="showDropdown = !showDropdown">
      <slot>
        <AppButton>Dropdown</AppButton>
      </slot>
    </div>
    <transition :duration="100">
      <div
        v-if="showDropdown"
        class="
          transition
          ease-out
          duration-100
          origin-top-right
          absolute
          mt-2
          w-48
          rounded-md
          shadow-lg
          py-1
          bg-white
          ring-1 ring-black ring-opacity-5
          focus:outline-none
        "
        :class="classes"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu-button"
        style="z-index: 10000"
        tabindex="-1"
      >
        <slot name="menu">
          <a
            href="#"
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
            Menu
          </a>
        </slot>
      </div>
    </transition>
  </div>
</template>

<script>
import AppButton from '~/components/AppButton.vue'

export default {
  components: {
    AppButton,
  },
  props: {
    placement: {
      type: String,
      default: 'bottom-end',
    },
  },
  data() {
    return {
      showDropdown: false,
    }
  },
  computed: {
    classes() {
      const classes = ['transform']
      if (this.showDropdown) {
        classes.push('opacity-100', 'scale-100')
      } else {
        classes.push('opacity-0', 'scale-95')
      }
      classes.push('right-0')

      return classes
    },
  },
  mounted() {
    document.body.addEventListener('click', this.closeDropdown)
  },
  beforeDestroy() {
    document.body.removeEventListener('click', this.closeDropdown)
  },
  methods: {
    closeDropdown() {
      this.toggleDropdown(false)
    },
    toggleDropdown(state) {
      this.showDropdown = state
    },
  },
}
</script>

<style scoped>
.bottom-full-2 {
  bottom: calc(100% + 1rem);
}
</style>
