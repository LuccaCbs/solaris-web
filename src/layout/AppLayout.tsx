import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
    BarChart3,
    Boxes,
    FolderTree,
    History,
    LogOut,
    Settings,
    Sun,
} from 'lucide-react'

const navItems = [
    { label: 'Dashboard', to: '/', icon: BarChart3 },
    { label: 'Products', to: '/products', icon: Boxes },
    { label: 'Categories', to: '/categories', icon: FolderTree },
    { label: 'Movement History', to: '/stock-movements', icon: History },
]

const adminItems = [
    { label: 'Admin Settings', to: '/admin/settings', icon: Settings },
]

function AppLayout() {
    const navigate = useNavigate()
    const location = useLocation()

    function handleLogout() {
        localStorage.removeItem('solaris_token')
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-900/95 p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600">
                        <Sun size={24} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold">Solaris</h1>
                        <p className="text-sm text-slate-400">Business Platform</p>
                    </div>
                </div>

                <nav className="mt-10 space-y-2">
                    {navItems.map((item) => (
                        <SidebarLink
                            key={item.to}
                            label={item.label}
                            to={item.to}
                            icon={item.icon}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>

                <div className="mt-8 border-t border-slate-800 pt-6">
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Admin
                    </p>

                    <div className="space-y-2">
                        {adminItems.map((item) => (
                            <SidebarLink
                                key={item.to}
                                label={item.label}
                                to={item.to}
                                icon={item.icon}
                                active={location.pathname === item.to}
                            />
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-red-300 hover:bg-red-500/20"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </aside>

            <main className="ml-72 min-h-screen p-10">
                <Outlet />
            </main>
        </div>
    )
}

type SidebarLinkProps = {
    label: string
    to: string
    icon: React.ElementType
    active: boolean
}

function SidebarLink({ label, to, icon: Icon, active }: SidebarLinkProps) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
        >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
        </Link>
    )
}

export default AppLayout