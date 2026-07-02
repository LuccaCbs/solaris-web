import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

function NotFoundPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { isAuthenticated, getDefaultPath } = useAuth()

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-950 dark:bg-slate-950 dark:text-white">
            <div className="w-full max-w-xl text-center">
                <h1 className="text-7xl font-bold">
                    404
                </h1>

                <h2 className="mt-4 text-2xl font-semibold">
                    {t('notFound.title')}
                </h2>

                <p className="mt-3 text-slate-500 dark:text-slate-400">
                    {t('notFound.description')}
                </p>

                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft size={18} />
                        {t('notFound.goBack')}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(isAuthenticated ? getDefaultPath() : '/login')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
                    >
                        {isAuthenticated ? (
                            <>
                                <Home size={18} />
                                {t('notFound.dashboard')}
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                {t('notFound.login')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </main>
    )
}

export default NotFoundPage