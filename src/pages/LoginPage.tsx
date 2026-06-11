import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loginUser } from '../api/authService'
import PasswordInput from '../components/PasswordInput'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo/solaris-white-full-logo.png'

function LoginPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const registered = searchParams.get('registered') === 'true'
    const verified = searchParams.get('verified') === 'true'
    const passwordReset = searchParams.get('passwordReset') === 'true'

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { t } = useTranslation()

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            const data = await loginUser({ email, password })
            localStorage.setItem('solaris_token', data.token)
            navigate('/')
        } catch {
            setError(t('auth.login.invalidCredentials'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 px-8 pb-8 pt-6 shadow-2xl"
            >
                <div className="flex flex-col items-center">
                    <img
                        src={logo}
                        alt="Solaris logo"
                        className="h-60 w-80 object-contain"
                    />

                    <p className="-mt-1 text-center text-sm text-slate-400">
                        Business Management Platform
                    </p>
                </div>

                {registered && (
                    <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-300">
                        {t('auth.login.registeredMessage')}
                    </div>
                )}

                {verified && (
                    <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
                        {t('auth.login.verifiedMessage')}
                    </div>
                )}

                {passwordReset && (
                    <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
                        {t('auth.login.passwordResetMessage')}
                    </div>
                )}

                <div className="mt-6">
                    <label className="text-sm text-slate-400">{t('auth.login.email')}</label>
                    <input
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm text-slate-400">{t('auth.login.password')}</label>
                    <PasswordInput
                        required
                        value={password}
                        onChange={setPassword}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div className="mt-3 text-right">
                    <Link
                        to="/forgot-password"
                        className="text-sm font-semibold text-blue-400 hover:text-blue-300"
                    >
                        {t('auth.login.forgotPassword')}
                    </Link>
                </div>

                {error && (
                    <p className="mt-4 text-sm text-red-400">
                        {error}
                    </p>
                )}

                <button
                    disabled={loading}
                    className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
                >
                    {loading ? t('auth.login.signingIn') : t('auth.login.signIn')}
                </button>

                <p className="mt-5 text-center text-sm text-slate-400">
                    {t('auth.login.noAccount')}{' '}
                    <Link
                        to="/register"
                        className="font-semibold text-blue-400 hover:text-blue-300"
                    >
                        {t('auth.login.register')}
                    </Link>
                </p>
            </form>
        </main>
    )
}

export default LoginPage