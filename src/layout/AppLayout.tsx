import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
    BarChart3,
    Boxes,
    FolderTree,
    History,
    LogOut,
    Menu,
    Moon,
    Settings,
    Sun,
    X,
    ShoppingCart,
    Truck,
    ClipboardList,
    User,
} from 'lucide-react'
import AdminPasswordModal from '../components/AdminPasswordModal'
import { useTheme } from '../utils/useTheme'
import { getSystemSettings } from '../api/systemSettingsService'

import logoSilver from '../assets/logo/solaris-white-full-logo.png'
import logoGold from '../assets/logo/solaris-black-full-logo.png'

const navItems = [
    { label: 'Dashboard', to: '/', icon: BarChart3 },
    { label: 'Sales', to: '/sales', icon: ShoppingCart },
    { label: 'Supplier Orders', to: '/supplier-orders', icon: ClipboardList },
    { label: 'Products', to: '/products', icon: Boxes },
    { label: 'Categories', to: '/categories', icon: FolderTree },
    { label: 'Suppliers', to: '/suppliers', icon: Truck },
    { label: 'Movement History', to: '/stock-movements', icon: History },
]

function AppLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
    const [adminPasswordModalOpen, setAdminPasswordModalOpen] = useState(false)
    const { theme, toggleTheme } = useTheme()

    const logoImage = theme === 'dark' ? logoSilver : logoGold

    async function handleAdminSettingsClick() {
        const settings = await getSystemSettings()

        if (!settings.hasAdminAccessPassword) {
            closeSidebar()
            navigate('/admin/settings')
            return
        }

        setAdminPasswordModalOpen(true)
    }

    function handleLogout() {
        localStorage.removeItem('solaris_token')
        sessionStorage.removeItem('solaris_cash_register_opened')
        navigate('/login')
    }

    function closeSidebar() {
        setSidebarOpen(false)
    }

    return (
        <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar overlay"
                    onClick={closeSidebar}
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent border-r border-slate-200 bg-white p-6 transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900/95 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between gap-3">
                    <Brand logoImage={logoImage}  />

                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="shrink-0 rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button
                        type="button"
                        onClick={closeSidebar}
                        className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="mt-10 space-y-2">
                    {navItems.map((item) => (
                        <SidebarLink
                            key={item.to}
                            label={item.label}
                            to={item.to}
                            icon={item.icon}
                            active={location.pathname === item.to}
                            onClick={closeSidebar}
                        />
                    ))}
                </nav>

                <div className="mt-auto border-t border-slate-200 pt-6 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => setSettingsMenuOpen((value) => !value)}
                        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        <span className="flex items-center gap-3">
                            <Settings size={18} />
                            <span className="font-medium">Settings</span>
                        </span>

                        <span className="text-sm">
                            {settingsMenuOpen ? '−' : '+'}
                        </span>
                    </button>

                    {settingsMenuOpen && (
                        <div className="mt-2 space-y-2 pl-3">
                            <SidebarButton
                                label="Admin Settings"
                                icon={Settings}
                                active={location.pathname === '/admin/settings'}
                                onClick={handleAdminSettingsClick}
                            />

                            <SidebarLink
                                label="My Profile"
                                to="/profile"
                                icon={User}
                                active={location.pathname === '/profile'}
                                onClick={closeSidebar}
                            />

                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-red-400 hover:bg-red-500/20"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:hidden">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                    <Menu size={22} />
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <img
                            src={logoImage}
                            alt="Solaris logo"
                            className="h-25 w-45 object-contain"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </header>

            <main className="min-h-screen p-4 sm:p-6 lg:ml-72 lg:p-10">
                <Outlet />
            </main>

            <AdminPasswordModal
                isOpen={adminPasswordModalOpen}
                title="Admin Settings Access"
                description="Enter the admin password to access system settings."
                onClose={() => setAdminPasswordModalOpen(false)}
                onSuccess={() => {
                    closeSidebar()
                    navigate('/admin/settings')
                }}
            />
        </div>
    )
}

type BrandProps = {
    logoImage: string
}

function Brand({ logoImage }: BrandProps) {
    return (
        <div className="flex min-w-0 flex-1 items-center gap-0">
            <img
                src={logoImage}
                alt="Solaris logo"
                className="h-35 w-50 shrink-0 object-contain"
            />

        </div>
    )
}

type SidebarLinkProps = {
    label: string
    to: string
    icon: React.ElementType
    active: boolean
    onClick: () => void
}

function SidebarLink({
                         label,
                         to,
                         icon: Icon,
                         active,
                         onClick,
                     }: SidebarLinkProps) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
        >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
        </Link>
    )
}

type SidebarButtonProps = {
    label: string
    icon: React.ElementType
    active: boolean
    onClick: () => void
}

function SidebarButton({
                           label,
                           icon: Icon,
                           active,
                           onClick,
                       }: SidebarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
        >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
        </button>
    )
}

export default AppLayout