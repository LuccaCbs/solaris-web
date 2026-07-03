import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'solaris_theme'

export function getStoredTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)

    return stored === 'light' ? 'light' : 'dark'
}

export function applyTheme(theme: Theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function initTheme() {
    applyTheme(getStoredTheme())
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => getStoredTheme())

    useEffect(() => {
        applyTheme(theme)
    }, [theme])

    function toggleTheme() {
        setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
    }

    return {
        theme,
        toggleTheme,
    }
}
