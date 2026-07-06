import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
    AlertTriangle,
    ArrowRight,
    Boxes,
    PackagePlus,
    ShoppingCart,
    Sparkles,
    TrendingDown,
    TrendingUp,
} from 'lucide-react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { getDashboard } from '../api/dashboardService'
import type { Dashboard } from '../types/dashboard'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/AuthContext'

function formatPercentChange(current: number, previous: number): number | null {
    if (previous === 0) {
        return current > 0 ? 100 : null
    }

    return ((current - previous) / previous) * 100
}

function ComparisonBadge({
    current,
    previous,
    label,
}: {
    current: number
    previous: number
    label: string
}) {
    const change = formatPercentChange(current, previous)

    if (change === null) {
        return null
    }

    const isPositive = change >= 0

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                isPositive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                    : 'bg-red-500/10 text-red-600 dark:text-red-300'
            }`}
        >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {label}: {isPositive ? '+' : ''}
            {change.toFixed(1)}%
        </span>
    )
}

function DashboardPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { hasMinimumRole } = useAuth()

    const [dashboard, setDashboard] = useState<Dashboard | null>(null)
    const [loading, setLoading] = useState(true)

    const canManage = hasMinimumRole('MANAGER')

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true)
                const data = await getDashboard()
                setDashboard(data)
            } catch {
                toast.error(t('dashboard.loadError'))
            } finally {
                setLoading(false)
            }
        }

        void loadDashboard()
    }, [t])

    const monthlySalesData = useMemo(() => {
        if (!dashboard) return []

        return dashboard.monthlySales.map((item) => ({
            date: item.date.slice(8, 10),
            fullDate: item.date,
            totalAmount: item.totalAmount,
        }))
    }, [dashboard])

    function formatDateInputValue(date: Date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    function goToMonthlySales() {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        navigate(
            `/sales?from=${formatDateInputValue(firstDay)}&to=${formatDateInputValue(lastDay)}`,
        )
    }

    function openNova() {
        window.dispatchEvent(new Event('solaris:open-nova'))
    }

    if (loading) {
        return <LoadingScreen />
    }

    if (!dashboard) {
        return null
    }

    const paymentLabels: Record<string, string> = {
        CASH: t('sales.payment.cash'),
        DEBIT_CARD: t('sales.payment.debitCard'),
        CREDIT_CARD: t('sales.payment.creditCard'),
        TRANSFER: t('sales.payment.transfer'),
        OTHER: t('sales.payment.other'),
    }

    const hasAlerts =
        dashboard.alerts.draftSupplierOrders > 0 ||
        dashboard.alerts.sentSupplierOrders > 0 ||
        dashboard.alerts.rejectedFiscalDocumentsToday > 0 ||
        dashboard.lowStockProductsCount > 0 ||
        dashboard.alerts.inactiveProducts > 0

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">{t('dashboard.title')}</h1>
                <p className="mt-2 solaris-muted">{t('dashboard.description')}</p>
            </div>

            <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide solaris-muted">
                    {t('dashboard.quickActions.title')}
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Link
                        to="/sales/new"
                        className="solaris-panel flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        <ShoppingCart className="text-blue-500" size={22} />
                        <span className="font-semibold">{t('dashboard.quickActions.newSale')}</span>
                    </Link>

                    {canManage && (
                        <Link
                            to="/stock/restock"
                            className="solaris-panel flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            <PackagePlus className="text-blue-500" size={22} />
                            <span className="font-semibold">
                                {t('dashboard.quickActions.merchandiseIntake')}
                            </span>
                        </Link>
                    )}

                    {canManage && (
                        <Link
                            to="/products"
                            className="solaris-panel flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            <Boxes className="text-blue-500" size={22} />
                            <span className="font-semibold">
                                {t('dashboard.quickActions.products')}
                            </span>
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={openNova}
                        className="solaris-panel flex items-center gap-3 text-left transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        <Sparkles className="text-blue-500" size={22} />
                        <span className="font-semibold">{t('dashboard.quickActions.nova')}</span>
                    </button>
                </div>
            </section>

            <section
                className={`rounded-2xl border px-5 py-4 ${
                    dashboard.cashRegister.open
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-amber-500/30 bg-amber-500/5'
                }`}
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold">
                            {dashboard.cashRegister.open
                                ? t('dashboard.cashRegister.open')
                                : t('dashboard.cashRegister.closed')}
                        </p>

                        {dashboard.cashRegister.open && dashboard.cashRegister.openedAt && (
                            <p className="mt-1 text-sm solaris-muted">
                                {t('dashboard.cashRegister.openedAt', {
                                    time: new Date(
                                        dashboard.cashRegister.openedAt,
                                    ).toLocaleString(),
                                    user: dashboard.cashRegister.openedBy ?? '—',
                                })}
                            </p>
                        )}
                    </div>

                    <Link
                        to="/sales"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                        {t('dashboard.cashRegister.goToSales')}
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                <button
                    type="button"
                    onClick={() => navigate('/sales/daily')}
                    className="solaris-panel text-left transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                    <p className="text-sm solaris-muted">{t('dashboard.cards.todaySales')}</p>

                    <div className="mt-4 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-4xl font-bold">{dashboard.todaySalesCount}</p>
                            <p className="mt-1 text-sm solaris-subtle">{t('dashboard.sales')}</p>
                        </div>

                        <div className="text-right">
                            <p className="text-3xl font-bold text-emerald-500 dark:text-emerald-300">
                                ${dashboard.todaySalesAmount.toFixed(2)}
                            </p>
                            <p className="mt-1 text-sm solaris-subtle">{t('dashboard.income')}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <ComparisonBadge
                            current={dashboard.todaySalesAmount}
                            previous={dashboard.comparison.yesterdaySalesAmount}
                            label={t('dashboard.comparison.vsYesterday')}
                        />
                    </div>
                </button>

                {canManage && (
                    <button
                        type="button"
                        onClick={goToMonthlySales}
                        className="solaris-panel text-left transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        <p className="text-sm solaris-muted">
                            {t('dashboard.cards.monthlySales')}
                        </p>

                        <div className="mt-4 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-4xl font-bold">
                                    {dashboard.comparison.currentMonthSalesCount}
                                </p>
                                <p className="mt-1 text-sm solaris-subtle">
                                    {t('dashboard.sales')}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-3xl font-bold text-emerald-500 dark:text-emerald-300">
                                    $
                                    {dashboard.comparison.currentMonthSalesAmount.toFixed(2)}
                                </p>
                                <p className="mt-1 text-sm solaris-subtle">
                                    {t('dashboard.income')}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <ComparisonBadge
                                current={dashboard.comparison.currentMonthSalesAmount}
                                previous={dashboard.comparison.previousMonthSalesAmount}
                                label={t('dashboard.comparison.vsPreviousMonth')}
                            />
                        </div>
                    </button>
                )}

                {canManage && (
                    <button
                        type="button"
                        onClick={() => navigate('/products?stock=low')}
                        className="solaris-panel text-left transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        <p className="text-sm solaris-muted">
                            {t('dashboard.cards.lowStockProducts')}
                        </p>

                        <p className="mt-4 text-4xl font-bold text-red-500 dark:text-red-300">
                            {dashboard.lowStockProductsCount}
                        </p>

                        <p className="mt-2 text-sm solaris-subtle">
                            {t('dashboard.productsNeedRestock')}
                        </p>
                    </button>
                )}

                {canManage && (
                    <div className="solaris-panel">
                        <p className="text-sm solaris-muted">
                            {t('dashboard.cards.pendingOrders')}
                        </p>

                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>{t('dashboard.orderStatus.draft')}</span>
                                <span className="font-bold">
                                    {dashboard.supplierOrders.draft}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span>{t('dashboard.orderStatus.sent')}</span>
                                <span className="font-bold">
                                    {dashboard.supplierOrders.sent}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/supplier-orders')}
                            className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
                        >
                            {t('dashboard.viewSupplierOrders')}
                        </button>
                    </div>
                )}
            </section>

            {canManage && hasAlerts && (
                <section className="solaris-panel">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" size={20} />
                        <h2 className="text-xl font-semibold">{t('dashboard.alerts.title')}</h2>
                    </div>

                    <ul className="mt-4 space-y-3">
                        {dashboard.lowStockProductsCount > 0 && (
                            <li>
                                <button
                                    type="button"
                                    onClick={() => navigate('/stock/restock')}
                                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-300"
                                >
                                    {t('dashboard.alerts.lowStock', {
                                        count: dashboard.lowStockProductsCount,
                                    })}
                                </button>
                            </li>
                        )}

                        {dashboard.alerts.draftSupplierOrders > 0 && (
                            <li>
                                <button
                                    type="button"
                                    onClick={() => navigate('/supplier-orders')}
                                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-300"
                                >
                                    {t('dashboard.alerts.draftOrders', {
                                        count: dashboard.alerts.draftSupplierOrders,
                                    })}
                                </button>
                            </li>
                        )}

                        {dashboard.alerts.sentSupplierOrders > 0 && (
                            <li>
                                <button
                                    type="button"
                                    onClick={() => navigate('/supplier-orders')}
                                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-300"
                                >
                                    {t('dashboard.alerts.sentOrders', {
                                        count: dashboard.alerts.sentSupplierOrders,
                                    })}
                                </button>
                            </li>
                        )}

                        {dashboard.alerts.rejectedFiscalDocumentsToday > 0 && (
                            <li>
                                <button
                                    type="button"
                                    onClick={() => navigate('/fiscal-documents')}
                                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-300"
                                >
                                    {t('dashboard.alerts.rejectedFiscal', {
                                        count: dashboard.alerts.rejectedFiscalDocumentsToday,
                                    })}
                                </button>
                            </li>
                        )}

                        {dashboard.alerts.inactiveProducts > 0 && (
                            <li>
                                <button
                                    type="button"
                                    onClick={() => navigate('/products')}
                                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-300"
                                >
                                    {t('dashboard.alerts.inactiveProducts', {
                                        count: dashboard.alerts.inactiveProducts,
                                    })}
                                </button>
                            </li>
                        )}
                    </ul>
                </section>
            )}

            <section className="grid gap-8 xl:grid-cols-2">
                <div className="solaris-panel">
                    <h2 className="text-xl font-semibold">{t('dashboard.recentSales.title')}</h2>
                    <p className="mt-1 text-sm solaris-muted">
                        {t('dashboard.recentSales.description')}
                    </p>

                    <div className="mt-6 space-y-3">
                        {dashboard.recentSales.length === 0 && (
                            <p className="text-sm solaris-muted">
                                {t('dashboard.recentSales.empty')}
                            </p>
                        )}

                        {dashboard.recentSales.map((sale) => (
                            <button
                                key={sale.id}
                                type="button"
                                onClick={() => navigate(`/sales/${sale.id}`)}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                            >
                                <div>
                                    <p className="font-medium">
                                        #{sale.id} ·{' '}
                                        {paymentLabels[sale.paymentMethod] ?? sale.paymentMethod}
                                    </p>
                                    <p className="text-sm solaris-muted">
                                        {new Date(sale.createdAt).toLocaleString()} ·{' '}
                                        {t('dashboard.recentSales.items', {
                                            count: sale.itemCount,
                                        })}
                                    </p>
                                </div>

                                <span className="font-semibold text-emerald-500 dark:text-emerald-300">
                                    ${sale.totalAmount.toFixed(2)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {canManage && (
                    <div className="solaris-panel">
                        <h2 className="text-xl font-semibold">
                            {t('dashboard.topProducts.title')}
                        </h2>
                        <p className="mt-1 text-sm solaris-muted">
                            {t('dashboard.topProducts.description')}
                        </p>

                        <div className="mt-6 space-y-3">
                            {dashboard.topProducts.length === 0 && (
                                <p className="text-sm solaris-muted">
                                    {t('dashboard.topProducts.empty')}
                                </p>
                            )}

                            {dashboard.topProducts.map((product, index) => (
                                <div
                                    key={product.productId}
                                    className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {index + 1}. {product.productName}
                                        </p>
                                        <p className="text-sm solaris-muted">
                                            {t('dashboard.topProducts.units', {
                                                count: product.quantitySold,
                                            })}
                                        </p>
                                    </div>

                                    <span className="font-semibold">
                                        ${product.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {canManage && (
                <section className="solaris-panel">
                    <h2 className="text-xl font-semibold">
                        {t('dashboard.monthlyOverviewTitle')}
                    </h2>

                    <p className="mt-1 text-sm solaris-muted">
                        {t('dashboard.monthlyOverviewDescription')}
                    </p>

                    <div className="mt-6 h-[360px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={monthlySalesData}
                                margin={{ top: 10, right: 24, left: 8, bottom: 8 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-slate-200 dark:stroke-slate-800"
                                />

                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    className="fill-slate-500"
                                />

                                <YAxis tick={{ fontSize: 12 }} className="fill-slate-500" />

                                <Tooltip
                                    formatter={(value) => [
                                        `$${Number(value).toFixed(2)}`,
                                        t('dashboard.income'),
                                    ]}
                                    labelFormatter={(_label, payload) => {
                                        const item = payload?.[0]?.payload as
                                            | { fullDate?: string }
                                            | undefined

                                        return item?.fullDate ?? t('dashboard.day')
                                    }}
                                    contentStyle={{
                                        backgroundColor: '#020617',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        color: '#ffffff',
                                    }}
                                />

                                <Bar
                                    dataKey="totalAmount"
                                    name={t('dashboard.income')}
                                    radius={[8, 8, 0, 0]}
                                    fill="#2563eb"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            )}
        </div>
    )
}

export default DashboardPage
