<template>
  <transition :duration="200">
    <div
      v-if="showNotification"
      class="
        flex flex-row
        space-x-4
        border
        rounded-lg
        px-2
        py-2
        w-64
        bg-white
        shadow
        transition
        duration-150
        ease-in-out
      "
      :class="[showNotification ? 'opacity-100' : 'opacity-0']"
    >
      <span v-if="type === 'success'" class="text-xl text-green-700">
        <FontAwesomeIcon :icon="['far', 'check-circle']" fixed-width />
      </span>
      <span v-else-if="type === 'error'" class="text-xl text-red-500">
        <FontAwesomeIcon :icon="['far', 'times-circle']" fixed-width />
      </span>
      <div class="flex-1 space-y-1">
        <h4 class="font-bold">{{ title }}</h4>
        <div class="text-sm text-gray-500">{{ message }}</div>
      </div>
      <button class="text-xl self-start text-gray-500" @click="close">
        <FontAwesomeIcon :icon="['far', 'times']" fixed-width />
      </button>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: 'LD Report',
    },
    message: {
      type: String,
      default: 'LD Report',
    },
    timeout: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      showNotificationID: 0,
      showNotification: true,
    }
  },
  mounted() {
    if (this.timeout > 0) {
      this.showNotificationID = setTimeout(this.close, this.timeout)
    }
  },
  beforeDestroy() {
    this.close()
  },
  methods: {
    close() {
      clearTimeout(this.showNotificationID)
      this.showNotification = false
    },
  },
}
</script>
