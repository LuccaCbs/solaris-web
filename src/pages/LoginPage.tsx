import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api/authService'

function LoginPage() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('lucca@test.com')
    const [password, setPassword] = useState('123456')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            const data = await loginUser({ email, password })
            localStorage.setItem('solaris_token', data.token)
            navigate('/')
        } catch {
            setError('Invalid email or password')
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
                <h1 className="text-3xl font-bold">Login</h1>

                <div className="mt-6">
                    <label className="text-sm text-slate-400">Email</label>
                    <input
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm text-slate-400">Password</label>
                    <input
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                    />
                </div>

                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                <button
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </main>
    )
}

export default LoginPage