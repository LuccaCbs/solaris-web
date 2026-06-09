import logoBlack from '../assets/logo/solaris-black-full-logo.png'
import logoSilver from '../assets/logo/solaris-white-full-logo.png'
import { useTheme } from '../utils/useTheme.ts'

function LoadingScreen() {
    const { theme } = useTheme()

    const logoImage = theme === 'dark' ? logoSilver : logoBlack

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
            <div className="flex flex-col items-center">
                <img
                    src={logoImage}
                    alt="Solaris logo"
                    className="h-24 w-24 animate-pulse object-contain"
                />


                <div className="mt-8 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-500" />

                <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                    Loading workspace...
                </p>
            </div>
        </main>
    )
}

export default LoadingScreen