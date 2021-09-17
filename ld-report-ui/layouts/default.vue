<template>
  <AppContainer>
    <Nuxt />
  </AppContainer>
</template>

<script>
import AppContainer from '~/components/AppContainer.vue'
export default {
  components: {
    AppContainer,
  },
}
</script>

<style>
@import url('~/node_modules/tabulator-tables/dist/css/tabulator.min.css');
.tabulator {
  @apply shadow transition duration-200;
  border-color: theme('colors.gray.300');
  background-color: theme('colors.gray.50');
}
.tabulator .tabulator-header {
  border-bottom-color: theme('colors.gray.300');
}
.tabulator .tabulator-header .tabulator-col {
  background-color: theme('colors.gray.200');
  border-right-color: theme('colors.gray.300');
}
.tabulator .tabulator-header .tabulator-col.tabulator-sortable:hover {
  background-color: theme('colors.gray.300');
}
.tabulator
  .tabulator-header
  .tabulator-col.tabulator-sortable[aria-sort='none']
  .tabulator-col-content
  .tabulator-col-sorter
  .tabulator-arrow {
  border-bottom-color: theme('colors.gray.400');
}
.tabulator
  .tabulator-header
  .tabulator-col.tabulator-sortable[aria-sort='asc']
  .tabulator-col-content
  .tabulator-col-sorter
  .tabulator-arrow {
  border-bottom-color: theme('colors.gray.700');
}
.tabulator
  .tabulator-header
  .tabulator-col.tabulator-sortable[aria-sort='desc']
  .tabulator-col-content
  .tabulator-col-sorter
  .tabulator-arrow {
  border-top-color: theme('colors.gray.700');
}
.tabulator-row .tabulator-cell {
  border-right-color: theme('colors.gray.300');
}
.tabulator-row.tabulator-row-even {
  background-color: theme('colors.gray.50');
}
.tabulator-row.tabulator-selectable:hover {
  background-color: theme('colors.gray.100');
}
.tabulator-table {
  border-bottom: 1px solid theme('colors.gray.300');
}

.v-select {
  @apply rounded-md focus:border-indigo-500;
  background: theme('colors.white');
}
.v-select .vs__dropdown-toggle {
  @apply px-1;
}
</style>
