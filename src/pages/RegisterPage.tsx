import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/authService'
import PasswordInput from '../components/PasswordInput'
import AuthPageLayout, { AUTH_FORM_CLASS } from '../components/AuthPageLayout'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()

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

    return (
        <AuthPageLayout>
            <form onSubmit={handleSubmit} className={`${AUTH_FORM_CLASS} p-8`}>
                <h1 className="text-3xl font-bold">{t('auth.register.title')}</h1>
                <p className="mt-2 text-sm solaris-muted">
                    {t('auth.register.description')}
                </p>

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
                    disabled={loading}
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
