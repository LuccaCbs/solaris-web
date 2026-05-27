import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('solaris_theme') as Theme) || 'dark'
    })

    useEffect(() => {
        localStorage.setItem('solaris_theme', theme)
        document.documentElement.classList.toggle('dark', theme === 'dark')
    }, [theme])

    function toggleTheme() {
        setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
    }

    return {
        theme,
        toggleTheme,
    }
}