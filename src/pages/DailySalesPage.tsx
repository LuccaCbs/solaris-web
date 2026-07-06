import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { getDailySalesSummary, getSales } from '../api/salesService'
import type { DailySalesSummary, PaymentMethod, Sale } from '../types/sales'
import LoadingScreen from '../components/LoadingScreen'
import { DailySalesSummaryPanel } from '../features/sales/components/DailySalesSummaryPanel'

function getTodayDateInputValue() {
    return new Date().toISOString().split('T')[0]
}

function getValidDateParam(value: string | null) {
    if (!value) return ''

    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''
}

function getPreviousDate(date: string) {
    const parsed = new Date(`${date}T12:00:00`)
    parsed.setDate(parsed.getDate() - 1)

    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function formatPaymentMethod(
    paymentMethod: PaymentMethod,
    t: (key: string) => string
) {
    const labels: Record<PaymentMethod, string> = {
        CASH: t('sales.payment.cash'),
        DEBIT_CARD: t('sales.payment.debitCard'),
        CREDIT_CARD: t('sales.payment.creditCard'),
        TRANSFER: t('sales.payment.transfer'),
        OTHER: t('sales.payment.other'),
    }

    return labels[paymentMethod]
}

function DailySalesPage() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()

    const dateParam = getValidDateParam(searchParams.get('date'))
    const [selectedDate, setSelectedDate] = useState(
        dateParam || getTodayDateInputValue()
    )
    const [summary, setSummary] = useState<DailySalesSummary | null>(null)
    const [previousSummary, setPreviousSummary] =
        useState<DailySalesSummary | null>(null)
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (dateParam && dateParam !== selectedDate) {
            setSelectedDate(dateParam)
        }
    }, [dateParam, selectedDate])

    useEffect(() => {
        async function loadDailyData() {
            try {
                setLoading(true)

                const previousDate = getPreviousDate(selectedDate)
                const [summaryData, previousData, salesData] = await Promise.all([
                    getDailySalesSummary(selectedDate),
                    getDailySalesSummary(previousDate),
                    getSales(),
                ])

                setSummary(summaryData)
                setPreviousSummary(previousData)
                setSales(salesData)
            } catch {
                toast.error(t('sales.daily.loadError'))
            } finally {
                setLoading(false)
            }
        }

        void loadDailyData()
    }, [selectedDate, t])

    const daySales = useMemo(() => {
        return sales
            .filter((sale) => sale.createdAt.split('T')[0] === selectedDate)
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            )
    }, [sales, selectedDate])

    function handleDateChange(value: string) {
        setSelectedDate(value)

        if (value) {
            setSearchParams({ date: value })
        } else {
            setSearchParams({})
        }
    }

    if (loading) {
        return <LoadingScreen />
    }

    if (!summary) {
        return null
    }

    const formattedDate = new Date(`${selectedDate}T12:00:00`).toLocaleDateString()

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <Link
                        to="/sales"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                        <ArrowLeft size={16} />
                        {t('sales.daily.backToSales')}
                    </Link>

                    <h1 className="mt-4 text-4xl font-bold">
                        {t('sales.daily.title')}
                    </h1>
                    <p className="mt-2 solaris-muted">
                        {t('sales.daily.description', { date: formattedDate })}
                    </p>
                </div>

                <div className="w-full lg:max-w-xs">
                    <label className="text-sm solaris-muted">
                        {t('sales.daily.dateLabel')}
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        max={getTodayDateInputValue()}
                        onChange={(event) => handleDateChange(event.target.value)}
                        className="solaris-input mt-2 w-full"
                    />
                </div>
            </div>

            <DailySalesSummaryPanel
                summary={summary}
                previousSummary={previousSummary}
                detailLinkTo={`/sales?from=${selectedDate}&to=${selectedDate}`}
            />

            <section className="solaris-panel">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {t('sales.daily.recentSalesTitle')}
                        </h2>
                        <p className="mt-1 text-sm solaris-muted">
                            {t('sales.daily.recentSalesDescription', {
                                count: daySales.length,
                            })}
                        </p>
                    </div>

                    {daySales.length > 0 && (
                        <Link
                            to={`/sales?from=${selectedDate}&to=${selectedDate}`}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {t('sales.daily.openFullList')}
                        </Link>
                    )}
                </div>

                <div className="mt-6 space-y-2">
                    {daySales.length === 0 && (
                        <p className="text-sm solaris-muted">
                            {t('sales.daily.empty')}
                        </p>
                    )}

                    {daySales.slice(0, 10).map((sale) => (
                        <Link
                            key={sale.id}
                            to={`/sales/${sale.id}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                        >
                            <div className="min-w-0">
                                <p className="font-medium">
                                    {t('sales.saleNumber', { id: sale.id })}
                                </p>
                                <p className="text-sm solaris-muted">
                                    {new Date(sale.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                    {' · '}
                                    {formatPaymentMethod(sale.paymentMethod, t)}
                                    {' · '}
                                    {t('sales.daily.items', {
                                        count: sale.items.length,
                                    })}
                                </p>
                            </div>

                            <span className="shrink-0 font-semibold text-emerald-500 dark:text-emerald-300">
                                ${sale.totalAmount.toFixed(2)}
                            </span>
                        </Link>
                    ))}

                    {daySales.length > 10 && (
                        <p className="pt-2 text-center text-sm solaris-muted">
                            {t('sales.daily.moreSales', {
                                count: daySales.length - 10,
                            })}
                        </p>
                    )}
                </div>
            </section>
        </div>
    )
}

export default DailySalesPage
