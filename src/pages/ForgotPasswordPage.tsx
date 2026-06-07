import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sun } from 'lucide-react'
import { forgotPassword } from '../api/authService'

function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setMessage('')
        setError('')
        setLoading(true)

        try {
            const response = await forgotPassword(email)
            setMessage(response.message)
        } catch {
            setError('Could not request password reset')
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
                <div className="flex flex-col items-center mb-8">
                    <Sun className="h-10 w-10 text-yellow-400" strokeWidth={2.5} />

                    <h1 className="mt-4 text-3xl font-bold text-white">
                        Forgot Password
                    </h1>

                    <p className="mt-2 text-center text-sm text-slate-400">
                        Enter your email and we&apos;ll send you a reset link.
                    </p>
                </div>

                <label className="text-sm text-slate-400">Email</label>

                <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                {message && (
                    <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <button
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
                >
                    {loading ? 'Sending...' : 'Send reset link'}
                </button>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Remembered your password?{' '}
                    <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
                        Back to login
                    </Link>
                </p>
            </form>
        </main>
    )
}

export default ForgotPasswordPage