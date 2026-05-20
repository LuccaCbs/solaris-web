import { Link, Outlet, useNavigate } from 'react-router-dom'

function AppLayout() {
    const navigate = useNavigate()

    function handleLogout() {
        localStorage.removeItem('solaris_token')
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-800 bg-slate-900 p-6">
                <h1 className="text-2xl font-bold">Solaris</h1>
                <p className="mt-1 text-sm text-slate-400">Business Platform</p>

                <nav className="mt-8 space-y-2">
                    <Link className="block rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white" to="/admin/settings">
                        Admin Settings
                    </Link>

                    <Link className="block rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white" to="/">
                        Dashboard
                    </Link>
                    <Link className="block rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white" to="/products">
                        Products
                    </Link>
                    <Link className="block rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white" to="/categories">
                        Categories
                    </Link>
                    <Link className="block rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white" to="/stock-movements">
                        Stock Movements
                    </Link>
                </nav>

                <button
                    onClick={handleLogout}
                    className="absolute bottom-6 left-6 right-6 rounded-xl bg-red-500/10 px-4 py-3 text-red-300 hover:bg-red-500/20"
                >
                    Logout
                </button>
            </aside>

            <main className="ml-64 min-h-screen p-10">
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout