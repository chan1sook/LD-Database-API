<template>
  <button
    :type="type"
    class="
      transition
      duration-200
      appearance-none
      relative
      border
      rounded-md
      focus:outline-none
      disabled:opacity-50 disabled:cursor-default
      text-base
      sm:text-sm
    "
    :class="classes"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot>Button</slot>
  </button>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'button',
    },
    theme: {
      type: String,
      default: 'indigo',
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    classes() {
      switch (this.theme) {
        case 'red':
          return this.outlined
            ? [
                `border-red-600`,
                `text-red-600`,
                'bg-white',
                'hover:bg-gray-200',
                `hover:border-red-700`,
                'active:bg-gray-50',
              ]
            : [
                `border-red-600`,
                'text-white',
                `bg-red-600`,
                `hover:bg-red-700`,
                `active:bg-red-500`,
              ]
        case 'yellow':
          return this.outlined
            ? [
                `border-yellow-600`,
                `text-yellow-600`,
                'bg-white',
                'hover:bg-gray-200',
                `hover:border-yellow-700`,
                'active:bg-gray-50',
              ]
            : [
                `border-yellow-600`,
                'text-white',
                `bg-yellow-600`,
                `hover:bg-yellow-700`,
                `active:bg-yellow-500`,
              ]
        case 'indigo':
        default:
          return this.outlined
            ? [
                `border-indigo-600`,
                `text-indigo-600`,
                'bg-white',
                'hover:bg-gray-200',
                `hover:border-indigo-700`,
                'active:bg-gray-50',
              ]
            : [
                `border-indigo-600`,
                'text-white',
                `bg-indigo-600`,
                `hover:bg-indigo-700`,
                `active:bg-indigo-500`,
              ]
      }
    },
  },
}
</script>
