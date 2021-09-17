<template>
  <span>
    <FontAwesomeIcon v-if="off" :icon="['fas', 'eye-slash']" fixed-width />
    <FontAwesomeIcon v-else :icon="['fas', 'eye']" fixed-width />
  </span>
</template>

<script>
export default {
  props: {
    off: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
