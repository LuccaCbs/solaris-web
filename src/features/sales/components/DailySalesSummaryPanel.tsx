import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { TrendingDown, TrendingUp } from 'lucide-react'
import type { DailySalesSummary } from '../../../types/sales'

type DailySalesSummaryPanelProps = {
    summary: DailySalesSummary
    previousSummary?: DailySalesSummary | null
    showChart?: boolean
    detailLinkTo?: string
}

const PAYMENT_COLORS = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#64748b']

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

export function DailySalesSummaryPanel({
    summary,
    previousSummary,
    showChart = true,
    detailLinkTo,
}: DailySalesSummaryPanelProps) {
    const { t } = useTranslation()

    const paymentRows = [
        { key: 'cash', label: t('sales.payment.cash'), value: summary.cashTotal },
        { key: 'debit', label: t('sales.payment.debitCard'), value: summary.debitCardTotal },
        { key: 'credit', label: t('sales.payment.creditCard'), value: summary.creditCardTotal },
        { key: 'transfer', label: t('sales.payment.transfer'), value: summary.transferTotal },
        { key: 'other', label: t('sales.payment.other'), value: summary.otherTotal },
    ]

    const chartData = paymentRows
        .filter((row) => row.value > 0)
        .map((row, index) => ({
            name: row.label,
            total: row.value,
            fill: PAYMENT_COLORS[index % PAYMENT_COLORS.length],
        }))

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">
                        {t('sales.daily.salesCount')}
                    </p>
                    <p className="mt-3 text-4xl font-bold">{summary.salesCount}</p>
                    {previousSummary && (
                        <div className="mt-4">
                            <ComparisonBadge
                                current={summary.salesCount}
                                previous={previousSummary.salesCount}
                                label={t('sales.daily.vsPreviousDay')}
                            />
                        </div>
                    )}
                </div>

                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">
                        {t('sales.daily.totalSales')}
                    </p>
                    <p className="mt-3 text-4xl font-bold text-emerald-500 dark:text-emerald-300">
                        ${summary.totalSales.toFixed(2)}
                    </p>
                    {previousSummary && (
                        <div className="mt-4">
                            <ComparisonBadge
                                current={summary.totalSales}
                                previous={previousSummary.totalSales}
                                label={t('sales.daily.vsPreviousDay')}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="solaris-panel">
                <h2 className="text-xl font-semibold">
                    {t('sales.daily.paymentBreakdown')}
                </h2>

                <div className="mt-4 space-y-2">
                    {paymentRows.map((row) => (
                        <div
                            key={row.key}
                            className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800"
                        >
                            <span className="text-sm solaris-muted">{row.label}</span>
                            <span className="font-semibold">${row.value.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {showChart && chartData.length > 0 && (
                    <div className="mt-6 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-slate-200 dark:stroke-slate-800"
                                />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 12 }}
                                    className="fill-slate-500"
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={120}
                                    tick={{ fontSize: 12 }}
                                    className="fill-slate-500"
                                />
                                <Tooltip
                                    formatter={(value) => [
                                        `$${Number(value).toFixed(2)}`,
                                        t('sales.daily.totalSales'),
                                    ]}
                                    contentStyle={{
                                        backgroundColor: '#020617',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        color: '#ffffff',
                                    }}
                                />
                                <Bar dataKey="total" radius={[0, 8, 8, 0]}>
                                    {chartData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {detailLinkTo && (
                <Link
                    to={detailLinkTo}
                    className="block text-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                    {t('sales.daily.viewSalesList')}
                </Link>
            )}
        </div>
    )
}
