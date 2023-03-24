<template>
  <div v-for="(error, i) of errors" :key="i" class="mt-1 text-right text-sm text-red-700">
    {{ error }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  errors?: string[]
}>()
</script>
