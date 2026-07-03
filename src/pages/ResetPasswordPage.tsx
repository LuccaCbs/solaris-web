import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { resetPassword } from '../api/authService'
import PasswordInput from '../components/PasswordInput'
import AuthPageLayout, { AUTH_FORM_CLASS } from '../components/AuthPageLayout'

function ResetPasswordPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { t } = useTranslation()

    const token = searchParams.get('token') ?? ''

    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setError('')
        setLoading(true)

        if (!token) {
            setError(t('auth.resetPassword.missingToken'))
            setLoading(false)
            return
        }

        try {
            await resetPassword(token, newPassword)
            navigate('/login?passwordReset=true')
        } catch {
            setError(t('auth.resetPassword.invalidToken'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthPageLayout>
            <form onSubmit={handleSubmit} className={`${AUTH_FORM_CLASS} p-8`}>
                <div className="mb-8 flex flex-col items-center">
                    <h1 className="text-3xl font-bold">
                        {t('auth.resetPassword.title')}
                    </h1>

                    <p className="mt-2 text-center text-sm solaris-muted">
                        {t('auth.resetPassword.description')}
                    </p>
                </div>

                <label className="text-sm solaris-muted">
                    {t('auth.resetPassword.newPassword')}
                </label>

                <PasswordInput
                    required
                    value={newPassword}
                    onChange={setNewPassword}
                    className="solaris-input mt-2 w-full"
                />

                {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                        {error}
                    </div>
                )}

                <button
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                    {loading
                        ? t('auth.resetPassword.saving')
                        : t('auth.resetPassword.resetPassword')}
                </button>

                <p className="mt-6 text-center text-sm solaris-muted">
                    <Link
                        to="/login"
                        className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {t('auth.resetPassword.backToLogin')}
                    </Link>
                </p>
            </form>
        </AuthPageLayout>
    )
}

export default ResetPasswordPage
