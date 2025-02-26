import { useTheme } from "../../providers/ThemeProvider"
import { useEffect } from 'react'

export function ThemeDebug() {
  const { theme } = useTheme()

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    console.log('Current theme:', theme)
    console.log('System prefers dark:', mediaQuery.matches)
    console.log('HTML classes:', document.documentElement.classList.toString())
  }, [theme])

  return null
} 