<template>
  <div class="bg-gray-50 h-screen overflow-hidden flex flex-col">
    <AppHeaderNav class="flex-none" />
    <div class="flex-1 overflow-auto">
      <div class="fixed fixed top-20 right-8 space-y-2" style="z-index: 1000">
        <Notification
          v-for="(notification, i) of notifications"
          :key="i"
          :type="notification.type"
          :title="notification.title"
          :message="notification.message"
          :timeout="notification.timeout"
        />
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import AppHeaderNav from '~/components/AppHeaderNav.vue'
import Notification from '~/components/Notification.vue'

export default {
  components: {
    AppHeaderNav,
    Notification,
  },
  provide() {
    return {
      addNotification: (params) => {
        this.notifications.push(params)
      },
    }
  },
  data() {
    return {
      notifications: [],
    }
  },
}
</script>
