import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
    BarChart3,
    Boxes,
    FolderTree,
    History,
    LogOut,
    Menu,
    Building2,
    CreditCard,
    Moon,
    Settings,
    Sun,
    X,
    ShoppingCart,
    Truck,
    Users,
    PackagePlus,
    ClipboardList,
    User,
    ScrollText,
    UsersRound,
} from 'lucide-react'
import AdminPasswordModal from '../components/AdminPasswordModal'
import { useAuth } from '../context/AuthContext'
import { useEntitlements } from '../hooks/useEntitlements'
import { useTheme } from '../utils/useTheme'
import type { ModuleCode } from '../types/subscription'
import { getSystemSettings } from '../api/systemSettingsService'
import { getOrganization } from '../api/organizationService'
import { useTranslation } from 'react-i18next'
import { NovaCopilotButton } from '../features/nova/components/NovaCopilotButton'
import { NovaCopilotPanel } from '../features/nova/components/NovaCopilotPanel'
import type { OrganizationRole } from '../types/auth'

import logoSilver from '../assets/logo/solaris-white-full-logo.png'
import logoGold from '../assets/logo/solaris-black-full-logo.png'

type NavItem = {
    label: string
    to: string
    icon: React.ElementType
    minimumRole: OrganizationRole
    requiredModule?: ModuleCode | null
}

function AppLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
    const [adminPasswordModalOpen, setAdminPasswordModalOpen] = useState(false)
    const { theme, toggleTheme } = useTheme()
    const { t, i18n } = useTranslation()
    const [isNovaOpen, setIsNovaOpen] = useState(false)
    const {
        logout,
        hasMinimumRole,
        orgId,
        orgName,
        role,
        storeId,
        user,
        setOrgName,
    } = useAuth()
    const { hasModule } = useEntitlements()

    const logoImage = theme === 'dark' ? logoSilver : logoGold

    const allNavItems: NavItem[] = [
        { label: t('nav.dashboard'), to: '/', icon: BarChart3, minimumRole: 'CASHIER' },
        { label: t('nav.sales'), to: '/sales', icon: ShoppingCart, minimumRole: 'CASHIER' },
        {
            label: t('nav.supplierOrders'),
            to: '/supplier-orders',
            icon: ClipboardList,
            minimumRole: 'MANAGER',
            requiredModule: 'INVENTORY',
        },
        {
            label: t('nav.products'),
            to: '/products',
            icon: Boxes,
            minimumRole: 'MANAGER',
            requiredModule: 'INVENTORY',
        },
        {
            label: t('nav.merchandiseIntake'),
            to: '/stock/restock',
            icon: PackagePlus,
            minimumRole: 'MANAGER',
            requiredModule: 'INVENTORY',
        },
        {
            label: t('nav.categories'),
            to: '/categories',
            icon: FolderTree,
            minimumRole: 'MANAGER',
            requiredModule: 'INVENTORY',
        },
        {
            label: t('nav.suppliers'),
            to: '/suppliers',
            icon: Truck,
            minimumRole: 'MANAGER',
            requiredModule: 'INVENTORY',
        },
        {
            label: t('nav.customers'),
            to: '/customers',
            icon: Users,
            minimumRole: 'MANAGER',
            requiredModule: 'CUSTOMERS',
        },
        {
            label: t('nav.movementHistory'),
            to: '/stock-movements',
            icon: History,
            minimumRole: 'MANAGER',
            requiredModule: 'INVENTORY',
        },
        {
            label: t('nav.auditLogs'),
            to: '/audit-logs',
            icon: ScrollText,
            minimumRole: 'ADMIN',
            requiredModule: 'AUDIT',
        },
        {
            label: t('nav.team'),
            to: '/team',
            icon: UsersRound,
            minimumRole: 'ADMIN',
            requiredModule: 'TEAM',
        },
    ]

    const navItems = allNavItems.filter(
        (item) =>
            hasMinimumRole(item.minimumRole)
            && (item.requiredModule == null || hasModule(item.requiredModule))
    )
    const canAccessAdminSettings = hasMinimumRole('ADMIN')
    const organizationLabel = orgName ?? (orgId ? t('auth.organization.fallbackName', { id: orgId }) : null)

    useEffect(() => {
        if (!orgId) {
            return
        }

        void getOrganization(orgId)
            .then((organization) => setOrgName(organization.displayName))
            .catch(() => {})
    }, [orgId, setOrgName])

    useEffect(() => {
        function openNova() {
            setIsNovaOpen(true)
        }

        window.addEventListener('solaris:open-nova', openNova)

        return () => {
            window.removeEventListener('solaris:open-nova', openNova)
        }
    }, [])

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
        logout()
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

                {organizationLabel && (
                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {t('auth.organization.label')}
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-slate-900 dark:text-white">
                            {organizationLabel}
                        </p>
                        {role && (
                            <p className="mt-1 text-xs text-slate-500">
                                {t(`auth.roles.${role}`)}
                                {storeId ? ` · ${t('auth.organization.store', { id: storeId })}` : ''}
                            </p>
                        )}
                        {user?.email && (
                            <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>
                        )}
                    </div>
                )}

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
                            <span className="font-medium">{t('common.settings')}</span>
                        </span>

                        <span className="text-sm">
                            {settingsMenuOpen ? '−' : '+'}
                        </span>
                    </button>

                    {settingsMenuOpen && (
                        <div className="mt-2 space-y-2 pl-3">
                            <div className="rounded-xl px-4 py-3">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Language
                                </label>

                                <select
                                    value={i18n.language}
                                    onChange={(event) => i18n.changeLanguage(event.target.value)}
                                    className="solaris-input mt-2 w-full"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="ca">Català</option>
                                </select>
                            </div>

                            {canAccessAdminSettings && (
                                <SidebarLink
                                    label={t('nav.organization')}
                                    to="/admin/organization"
                                    icon={Building2}
                                    active={location.pathname === '/admin/organization'}
                                    onClick={closeSidebar}
                                />
                            )}

                            {canAccessAdminSettings && (
                                <SidebarLink
                                    label={t('nav.billing')}
                                    to="/admin/billing"
                                    icon={CreditCard}
                                    active={location.pathname === '/admin/billing'}
                                    onClick={closeSidebar}
                                />
                            )}

                            {canAccessAdminSettings && (
                                <SidebarButton
                                    label={t('nav.adminSettings')}
                                    icon={Settings}
                                    active={location.pathname === '/admin/settings'}
                                    onClick={handleAdminSettingsClick}
                                />
                            )}

                            <SidebarLink
                                label={t('nav.myProfile')}
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
                                {t('common.logout')}
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

            <NovaCopilotPanel
                isOpen={isNovaOpen}
                onClose={() => setIsNovaOpen(false)}
            />

            <NovaCopilotButton
                isOpen={isNovaOpen}
                onClick={() => setIsNovaOpen((current) => !current)}
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