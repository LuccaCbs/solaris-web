import { Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTheme } from '../utils/useTheme'

export const AUTH_FORM_CLASS =
    'w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900'

type AuthPageLayoutProps = {
    children: ReactNode
}

export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
    const { theme, toggleTheme } = useTheme()

    return (
        <main className="relative flex min-h-screen items-center justify-center bg-slate-100 px-4 py-6 text-slate-950 dark:bg-black dark:text-white">
            <button
                type="button"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="absolute right-4 top-4 rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {children}
        </main>
    )
}
