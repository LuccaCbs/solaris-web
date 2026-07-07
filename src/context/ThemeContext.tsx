import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react'

export type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'solaris_theme'

export function getStoredTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)

    return stored === 'light' ? 'light' : 'dark'
}

export function applyThemeToDocument(theme: Theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function initTheme() {
    applyThemeToDocument(getStoredTheme())
}

type ThemeContextValue = {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => getStoredTheme())

    useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, theme)
        applyThemeToDocument(theme)
    }, [theme])

    useEffect(() => {
        function handleStorage(event: StorageEvent) {
            if (event.key !== THEME_STORAGE_KEY || !event.newValue) {
                return
            }

            const nextTheme: Theme = event.newValue === 'light' ? 'light' : 'dark'
            setThemeState(nextTheme)
        }

        window.addEventListener('storage', handleStorage)

        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    function toggleTheme() {
        setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
    }

    function setTheme(nextTheme: Theme) {
        setThemeState(nextTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)

    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }

    return context
}
