import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loginUser } from '../api/authService'
import { resolvePostLoginPath } from '../utils/onboardingNavigation'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'
import AuthPageLayout, { AUTH_FORM_CLASS } from '../components/AuthPageLayout'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../utils/useTheme'
import logoDark from '../assets/logo/solaris-black-full-logo.png'
import logoLight from '../assets/logo/solaris-white-full-logo.png'

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
    const { login } = useAuth()
    const { theme } = useTheme()

    const logo = theme === 'dark' ? logoLight : logoDark

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            const data = await loginUser({ email, password })
            login(data.token)
            navigate(await resolvePostLoginPath(data.token))
        } catch {
            setError(t('auth.login.invalidCredentials'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthPageLayout>
            <form
                onSubmit={handleSubmit}
                className={`${AUTH_FORM_CLASS} px-8 pb-8 pt-6`}
            >
                <div className="flex flex-col items-center">
                    <img
                        src={logo}
                        alt="Solaris logo"
                        className="h-60 w-80 object-contain"
                    />

                    <p className="-mt-1 text-center text-sm solaris-muted">
                        Business Management Platform
                    </p>
                </div>

                {registered && (
                    <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                        {t('auth.login.registeredMessage')}
                    </div>
                )}

                {verified && (
                    <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
                        {t('auth.login.verifiedMessage')}
                    </div>
                )}

                {passwordReset && (
                    <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
                        {t('auth.login.passwordResetMessage')}
                    </div>
                )}

                <div className="mt-6">
                    <label className="text-sm solaris-muted">{t('auth.login.email')}</label>
                    <input
                        className="solaris-input mt-2 w-full"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm solaris-muted">{t('auth.login.password')}</label>
                    <PasswordInput
                        required
                        value={password}
                        onChange={setPassword}
                        className="solaris-input mt-2 w-full"
                    />
                </div>

                <div className="mt-3 text-right">
                    <Link
                        to="/forgot-password"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {t('auth.login.forgotPassword')}
                    </Link>
                </div>

                {error && (
                    <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}

                <button
                    disabled={loading}
                    className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                    {loading ? t('auth.login.signingIn') : t('auth.login.signIn')}
                </button>

                <p className="mt-5 text-center text-sm solaris-muted">
                    {t('auth.login.noAccount')}{' '}
                    <Link
                        to="/register"
                        className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {t('auth.login.register')}
                    </Link>
                </p>
            </form>
        </AuthPageLayout>
    )
}

export default LoginPage
