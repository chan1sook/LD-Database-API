<template>
  <input
    :value="value"
    :type="type"
    :autocomplete="autocomplete"
    :required="required"
    :readonly="readonly"
    class="
      transition
      duration-200
      appearance-none
      relative
      rounded-md
      block
      w-full
      px-3
      py-2
      border
      placeholder-gray-500
      text-gray-900
      focus:outline-none focus:z-10
      text-base
      sm:text-sm
    "
    :placeholder="placeholder"
    :class="
      invalid
        ? ['border-red-300', 'focus:border-red-500']
        : ['border-gray-300', 'focus:border-indigo-500']
    "
    @input="$emit('input', $event.target.value)"
  />
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    autocomplete: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    invalid: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
