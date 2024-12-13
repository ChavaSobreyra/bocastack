<template>
  <button
    class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300/50 bg-white/40 transition-all hover:bg-slate-200/60 dark:border-slate-700/50 dark:bg-slate-800/40 dark:hover:bg-slate-700/60"
    @click="toggleTheme"
  >
    <div v-if="!isDark" class="h-5 w-5 text-slate-800">🌑</div>
    <div v-else class="h-5 w-5 text-slate-100">☀️</div>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(true)

onMounted(() => {
  // Check localStorage first
  const darkMode = localStorage.getItem('darkMode')
  if (darkMode !== null) isDark.value = darkMode === 'true'
  // Fall back to system preference
  else isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches

  // Set initial class
  if (isDark.value) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
})

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')

  localStorage.setItem('darkMode', isDark.value.toString())
}
</script>
