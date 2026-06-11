import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { verifyEmail } from '../api/authService'

function VerifyEmailPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { t } = useTranslation()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function verify() {
            const token = searchParams.get('token')

            if (!token) {
                setError(t('auth.verifyEmail.missingToken'))
                setLoading(false)
                return
            }

            try {
                await verifyEmail(token)
                navigate('/login?verified=true')
            } catch {
                setError(t('auth.verifyEmail.invalidToken'))
            } finally {
                setLoading(false)
            }
        }

        verify()
    }, [navigate, searchParams, t])

    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
                {loading && (
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-300">
                        {t('auth.verifyEmail.verifying')}
                    </div>
                )}

                {error && (
                    <>
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                            {error}
                        </div>

                        <Link
                            to="/login"
                            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
                        >
                            {t('auth.verifyEmail.backToLogin')}
                        </Link>
                    </>
                )}
            </div>
        </main>
    )
}

export default VerifyEmailPage