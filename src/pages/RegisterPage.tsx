import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/authService'
import PasswordInput from '../components/PasswordInput'
import { useTranslation } from 'react-i18next'
import toast from "react-hot-toast";

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
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
            >
                <h1 className="text-3xl font-bold">{t('auth.register.title')}</h1>
                <p className="mt-2 text-sm text-slate-400">
                    {t('auth.register.description')}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm text-slate-400">{t('auth.register.firstname')}</label>
                        <input
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-400">{t('auth.register.lastname')}</label>
                        <input
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="text-sm text-slate-400">{t('auth.register.email')}</label>
                    <input
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm text-slate-400">{t('auth.register.password')}</label>
                    <PasswordInput
                        required
                        value={password}
                        onChange={setPassword}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm text-slate-400">{t('auth.register.confirmPassword')}</label>
                    <PasswordInput
                        required
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                <button
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
                >
                    {
                        loading
                            ? t('auth.register.creatingAccount')
                            : t('auth.register.createAccount')
                    }
                </button>

                <p className="mt-6 text-center text-sm text-slate-400">
                    {t('auth.register.alreadyHaveAccount')}{' '}
                    <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
                        {t('auth.register.login')}
                    </Link>
                </p>
            </form>
        </main>
    )
}

export default RegisterPage