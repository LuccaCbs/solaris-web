import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/authService'
import AuthPageLayout, { AUTH_FORM_CLASS } from '../components/AuthPageLayout'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../utils/useTheme'
import logoDark from '../assets/logo/solaris-black-logo-only.png'
import logoLight from '../assets/logo/solaris-white-logo-only.png'

function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { t } = useTranslation()
    const { theme } = useTheme()

    const logo = theme === 'dark' ? logoLight : logoDark

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setMessage('')
        setError('')
        setLoading(true)

        try {
            const response = await forgotPassword(email)
            setMessage(response.message)
        } catch {
            setError(t('auth.forgotPassword.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthPageLayout>
            <form onSubmit={handleSubmit} className={`${AUTH_FORM_CLASS} p-8`}>
                <div className="mb-8 flex flex-col items-center">
                    <img
                        src={logo}
                        alt="Solaris logo"
                        className="h-25 w-45 object-contain"
                    />

                    <h1 className="mt-4 text-3xl font-bold">
                        {t('auth.forgotPassword.title')}
                    </h1>

                    <p className="mt-2 text-center text-sm solaris-muted">
                        {t('auth.forgotPassword.description')}
                    </p>
                </div>

                <label className="text-sm solaris-muted">{t('auth.forgotPassword.email')}</label>

                <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="solaris-input mt-2 w-full"
                />

                {message && (
                    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                        {error}
                    </div>
                )}

                <button
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                    {loading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendResetLink')}
                </button>

                <p className="mt-6 text-center text-sm solaris-muted">
                    {t('auth.forgotPassword.rememberedPassword')}{' '}
                    <Link
                        to="/login"
                        className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {t('auth.forgotPassword.backToLogin')}
                    </Link>
                </p>
            </form>
        </AuthPageLayout>
    )
}

export default ForgotPasswordPage
