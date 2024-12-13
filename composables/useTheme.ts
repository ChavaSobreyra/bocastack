import { ref } from 'vue'

import type { Theme } from '../types/theme'

// default to dark theme cause we're cool 😎
const theme = ref<Theme>('dark')

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.toggle('light')
  }

  return {
    theme,
    toggleTheme,
  }
}
