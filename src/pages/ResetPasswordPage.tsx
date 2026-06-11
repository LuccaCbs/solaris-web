import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { resetPassword } from '../api/authService'
import PasswordInput from '../components/PasswordInput'

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
        <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
            >
                <div className="mb-8 flex flex-col items-center">
                    <h1 className="text-3xl font-bold text-white">
                        {t('auth.resetPassword.title')}
                    </h1>

                    <p className="mt-2 text-center text-sm text-slate-400">
                        {t('auth.resetPassword.description')}
                    </p>
                </div>

                <label className="text-sm text-slate-400">
                    {t('auth.resetPassword.newPassword')}
                </label>

                <PasswordInput
                    required
                    value={newPassword}
                    onChange={setNewPassword}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                {error && (
                    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <button
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
                >
                    {loading
                        ? t('auth.resetPassword.saving')
                        : t('auth.resetPassword.resetPassword')}
                </button>

                <p className="mt-6 text-center text-sm text-slate-400">
                    <Link
                        to="/login"
                        className="font-semibold text-blue-400 hover:text-blue-300"
                    >
                        {t('auth.resetPassword.backToLogin')}
                    </Link>
                </p>
            </form>
        </main>
    )
}

export default ResetPasswordPage