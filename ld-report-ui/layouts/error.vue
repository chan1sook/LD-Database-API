<template>
  <div class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <AppLogo class="mx-auto w-16 h-16 w-auto" />
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ error.statusCode }}
        </h2>
      </div>
      <div class="mt-4 text-gray-500">
        <template v-if="error.statusCode === 404">ไม่พบหน้าที่ต้องการ</template>
        <template v-else> เกิดข้อผิดพลาด: {{ error.message }} </template>
      </div>
      <div class="mt-4">
        <NuxtLink to="/">
          <AppButton class="px-4 py-2 w-full"> หน้าหลัก </AppButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default() {
        return {
          statusCode: 500,
          message: 'เกิดข้อผิดพลาดอื่นๆ',
        }
      },
    },
  },
  head: {
    title: 'LD Report',
  },
}
</script>
