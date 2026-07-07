import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithGoogle, registerUser } from '../api/authService'
import { resolvePostLoginPath } from '../utils/onboardingNavigation'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'
import AuthPageLayout, { AUTH_FORM_CLASS } from '../components/AuthPageLayout'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../utils/useTheme'
import toast from 'react-hot-toast'

function RegisterPage() {
    const navigate = useNavigate()

    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const { t } = useTranslation()
    const { login } = useAuth()
    const { theme } = useTheme()

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    async function handleGoogleSuccess(credential?: string) {
        if (!credential) {
            setError(t('auth.login.googleError'))
            return
        }

        setError('')
        setGoogleLoading(true)

        try {
            const data = await loginWithGoogle(credential)
            login(data.token)
            navigate(await resolvePostLoginPath(data.token))
        } catch {
            setError(t('auth.login.googleError'))
        } finally {
            setGoogleLoading(false)
        }
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            toast.error(t('auth.register.passwordsDoNotMatch'))
            return
        }

        setLoading(true)

        try {
            await registerUser({
                firstname,
                lastname,
                email,
                password,
            })

            navigate('/login?registered=true')
        } catch {
            setError(t('auth.register.createError'))
        } finally {
            setLoading(false)
        }
    }

    const isBusy = loading || googleLoading

    return (
        <AuthPageLayout>
            <form onSubmit={handleSubmit} className={`${AUTH_FORM_CLASS} p-8`}>
                <h1 className="text-3xl font-bold">{t('auth.register.title')}</h1>
                <p className="mt-2 text-sm solaris-muted">
                    {t('auth.register.description')}
                </p>

                {googleClientId && (
                    <>
                        <div className="mt-6 flex justify-center">
                            <GoogleLogin
                                onSuccess={(response) => {
                                    void handleGoogleSuccess(response.credential)
                                }}
                                onError={() => setError(t('auth.login.googleError'))}
                                theme={theme === 'dark' ? 'filled_black' : 'outline'}
                                text="continue_with"
                                width="384"
                            />
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                            <span className="text-sm solaris-muted">{t('auth.login.or')}</span>
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        </div>
                    </>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm solaris-muted">{t('auth.register.firstname')}</label>
                        <input
                            className="solaris-input mt-2 w-full"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm solaris-muted">{t('auth.register.lastname')}</label>
                        <input
                            className="solaris-input mt-2 w-full"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="text-sm solaris-muted">{t('auth.register.email')}</label>
                    <input
                        className="solaris-input mt-2 w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm solaris-muted">{t('auth.register.password')}</label>
                    <PasswordInput
                        required
                        value={password}
                        onChange={setPassword}
                        className="solaris-input mt-2 w-full"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm solaris-muted">{t('auth.register.confirmPassword')}</label>
                    <PasswordInput
                        required
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        className="solaris-input mt-2 w-full"
                    />
                </div>

                {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

                <button
                    disabled={isBusy}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                    {loading ? t('auth.register.creatingAccount') : t('auth.register.createAccount')}
                </button>

                <p className="mt-6 text-center text-sm solaris-muted">
                    {t('auth.register.alreadyHaveAccount')}{' '}
                    <Link
                        to="/login"
                        className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {t('auth.register.login')}
                    </Link>
                </p>
            </form>
        </AuthPageLayout>
    )
}

export default RegisterPage
