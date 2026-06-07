import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Sun } from 'lucide-react'
import { verifyEmail } from '../api/authService'

function VerifyEmailPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function verify() {
            const token = searchParams.get('token')

            if (!token) {
                setError('Verification token is missing.')
                setLoading(false)
                return
            }

            try {
                await verifyEmail(token)
                navigate('/login?verified=true')
            } catch {
                setError('The verification link is invalid or expired.')
            } finally {
                setLoading(false)
            }
        }

        verify()
    }, [navigate, searchParams])

    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-3">
                        <Sun
                            className="h-10 w-10 text-yellow-400"
                            strokeWidth={2.5}
                        />

                        <h1 className="text-5xl font-bold text-white">
                            Solaris
                        </h1>
                    </div>

                    <p className="mt-1 text-xs tracking-[0.25em] text-slate-500 uppercase">
                        Business Management Platform
                    </p>
                </div>

                {loading && (
                    <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-300">
                        Verifying your email...
                    </div>
                )}

                {error && (
                    <>
                        <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                            {error}
                        </div>

                        <Link
                            to="/login"
                            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
                        >
                            Back to login
                        </Link>
                    </>
                )}
            </div>
        </main>
    )
}

export default VerifyEmailPage