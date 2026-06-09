import { useNavigate } from 'react-router-dom'
import { Sun, ArrowLeft, Home, LogIn } from 'lucide-react'

function NotFoundPage() {
    const navigate = useNavigate()
    const isAuthenticated = Boolean(localStorage.getItem('solaris_token'))

    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
            <div className="w-full max-w-xl text-center">
                <div className="flex flex-col items-center">
                    <Sun
                        className="h-12 w-12 text-yellow-400"
                        strokeWidth={2.5}
                    />

                    <h1 className="mt-4 text-7xl font-bold text-white">
                        404
                    </h1>

                    <h2 className="mt-4 text-2xl font-semibold">
                        Page not found
                    </h2>

                    <p className="mt-3 text-slate-400">
                        The page you are looking for does not exist or may have been moved.
                    </p>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate(isAuthenticated ? '/' : '/login')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 transition-colors"
                    >
                        {isAuthenticated ? (
                            <>
                                <Home size={18} />
                                Dashboard
                            </>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Login
                            </>
                        )}
                    </button>
                </div>
            </div>
        </main>
    )
}

export default NotFoundPage