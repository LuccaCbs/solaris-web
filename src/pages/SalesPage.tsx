import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSales } from '../api/salesService'
import type { PaymentMethod, Sale } from '../types/sales'
import { exportSales } from '../utils/exportSales'
import {
    closeCashRegister,
    getTodayCashRegister,
    openCashRegister,
    reopenCashRegister,
} from '../api/cashRegisterService'
import type { CashRegisterSession } from '../types/cashRegister'
import { getSystemSettings } from '../api/systemSettingsService'
import { useTranslation } from 'react-i18next'
import LoadingScreen from '../components/LoadingScreen'
import PasswordInput from '../components/PasswordInput'


type PaymentFilter = 'ALL' | PaymentMethod
type CashRegisterAction = 'OPEN' | 'CLOSE' | 'REOPEN' | null

function getTodayDateInputValue() {
    return new Date().toISOString().split('T')[0]
}

function getValidDateParam(value: string | null) {
    if (!value) return ''

    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''
}

function getSaleDate(sale: Sale) {
    return sale.createdAt.split('T')[0]
}

function getApiErrorMessage(error: unknown) {
    const apiError = error as {
        response?: {
            data?: {
                message?: string
                error?: string
            }
        }
    }

    return (
        apiError.response?.data?.message ||
        apiError.response?.data?.error ||
        ''
    )
}

function formatPaymentMethod(paymentMethod: PaymentMethod, t: (key: string) => string) {
    const labels: Record<PaymentMethod, string> = {
        CASH: t('sales.payment.cash'),
        DEBIT_CARD: t('sales.payment.debitCard'),
        CREDIT_CARD: t('sales.payment.creditCard'),
        TRANSFER: t('sales.payment.transfer'),
        OTHER: t('sales.payment.other'),
    }

    return labels[paymentMethod]
}

function SalesPage() {
    const [searchParams] = useSearchParams()
    const { t } = useTranslation()

    const fromParam = getValidDateParam(searchParams.get('from'))
    const toParam = getValidDateParam(searchParams.get('to'))

    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [dateFrom, setDateFrom] = useState(fromParam || getTodayDateInputValue())
    const [dateTo, setDateTo] = useState(toParam)
    const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('ALL')
    const [cashRegister, setCashRegister] = useState<CashRegisterSession | null>(null)
    const [hasAdminAccessPassword, setHasAdminAccessPassword] = useState(false)

    const [cashRegisterAction, setCashRegisterAction] = useState<CashRegisterAction>(null)
    const [adminPassword, setAdminPassword] = useState('')
    const [processingCashRegister, setProcessingCashRegister] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    async function loadData() {
        try {
            const salesData = await getSales()
            setSales(salesData)

            const settingsData = await getSystemSettings()
            setHasAdminAccessPassword(settingsData.hasAdminAccessPassword)

            try {
                const todayCashRegister = await getTodayCashRegister()
                setCashRegister(todayCashRegister)

                if (todayCashRegister.status === 'OPEN') {
                    sessionStorage.setItem('solaris_cash_register_opened', 'true')
                } else {
                    sessionStorage.removeItem('solaris_cash_register_opened')
                }
            } catch {
                setCashRegister(null)
                sessionStorage.removeItem('solaris_cash_register_opened')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const filteredSales = useMemo(() => {
        return sales
            .filter((sale) => {
                if (cashRegister?.id && !dateTo) {
                    return sale.cashRegisterSessionId === cashRegister.id
                }

                const saleDate = getSaleDate(sale)

                if (!dateTo) {
                    return saleDate === dateFrom
                }

                return saleDate >= dateFrom && saleDate <= dateTo
            })
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
    }, [sales, cashRegister, dateFrom, dateTo])
    
    const visibleSales = useMemo(() => {
        if (paymentFilter === 'ALL') return filteredSales

        return filteredSales.filter((sale) => sale.paymentMethod === paymentFilter)
    }, [filteredSales, paymentFilter])

    const summary = useMemo(() => {
        return filteredSales.reduce(
            (acc, sale) => {
                acc.salesCount += 1
                acc.totalSales += sale.totalAmount

                if (sale.paymentMethod === 'CASH') acc.cashTotal += sale.totalAmount
                if (sale.paymentMethod === 'DEBIT_CARD') acc.debitCardTotal += sale.totalAmount
                if (sale.paymentMethod === 'CREDIT_CARD') acc.creditCardTotal += sale.totalAmount
                if (sale.paymentMethod === 'TRANSFER') acc.transferTotal += sale.totalAmount
                if (sale.paymentMethod === 'OTHER') acc.otherTotal += sale.totalAmount

                return acc
            },
            {
                salesCount: 0,
                totalSales: 0,
                cashTotal: 0,
                debitCardTotal: 0,
                creditCardTotal: 0,
                transferTotal: 0,
                otherTotal: 0,
            }
        )
    }, [filteredSales])

    const totalPages = Math.ceil(visibleSales.length / pageSize)

    const paginatedSales = visibleSales.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    const cashRegisterIsOpen = cashRegister?.status === 'OPEN'
    const cashRegisterIsClosed = cashRegister?.status === 'CLOSED'

    async function openAuthorizationModal(action: Exclude<CashRegisterAction, null>) {
        setAdminPassword('')

        if (!hasAdminAccessPassword) {
            await executeCashRegisterAction(action, '')
            return
        }

        setCashRegisterAction(action)
    }

    async function executeCashRegisterAction(
        action: Exclude<CashRegisterAction, null>,
        password: string
    ) {
        setProcessingCashRegister(true)

        try {
            if (action === 'OPEN') {
                await openCashRegister({ adminPassword: password })
                sessionStorage.setItem('solaris_cash_register_opened', 'true')
                toast.success('Cash register opened successfully')
            }

            if (action === 'CLOSE') {
                await closeCashRegister({ adminPassword: password })
                sessionStorage.removeItem('solaris_cash_register_opened')
                toast.success('Cash register closed successfully')
            }

            if (action === 'REOPEN' && cashRegister) {
                await reopenCashRegister(cashRegister.id, {
                    adminPassword: password,
                })

                sessionStorage.setItem('solaris_cash_register_opened', 'true')
                toast.success('Cash register reopened successfully')
            }

            closeAuthorizationModal()
            setPaymentFilter('ALL')
            setCurrentPage(1)
            await loadData()
        } catch (error: unknown) {
            const message = getApiErrorMessage(error)

            if (message.toLowerCase().includes('password')) {
                toast.error('Invalid admin password')
                return
            }

            if (message.toLowerCase().includes('already')) {
                toast.error('There is already a cash register session for today')
                await loadData()
                return
            }

            toast.error(message || 'Cash register action failed')
        } finally {
            setProcessingCashRegister(false)
        }
    }

    function closeAuthorizationModal() {
        setAdminPassword('')
        setCashRegisterAction(null)
    }

    async function handleCashRegisterAuthorization(event: React.FormEvent) {
        event.preventDefault()

        if (!cashRegisterAction) return

        const password = adminPassword.trim()

        if (hasAdminAccessPassword && !password) {
            toast.error('Enter the admin password')
            return
        }

        await executeCashRegisterAction(cashRegisterAction, password)
    }

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">{t('sales.title')}</h1>

                    <p className="mt-2 solaris-muted">
                        {t('sales.description')}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={() => exportSales(visibleSales)}
                        className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/20 dark:text-emerald-300"
                    >
                        {t('sales.exportExcel')}
                    </button>

                    {cashRegisterIsOpen ? (
                        <Link
                            to="/sales/new"
                            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                        >
                            {t('sales.newSale')}
                        </Link>
                    ) : (
                        <button
                            disabled
                            title={t('sales.openRegisterBeforeSale')}
                            className="cursor-not-allowed rounded-xl bg-slate-400 px-5 py-3 text-center font-semibold text-white opacity-70"
                        >
                            {t('sales.newSale')}
                        </button>
                    )}
                </div>
            </div>

            <div className="solaris-panel mt-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">{t('sales.cashRegister.title')}</h2>

                        <p className="mt-1 solaris-muted">
                            {t('sales.cashRegister.description')}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-950 dark:text-slate-300">
              {summary.salesCount} sales
            </span>

                        {cashRegisterIsOpen ? (
                            <span className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400">
                                {t('sales.cashRegister.openStatus')}
                             </span>
                        ) : (
                            <span className="rounded-lg bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400">
                                {t('sales.cashRegister.closedStatus')}
                            </span>
                        )}
                    </div>
                </div>

                {cashRegister ? (
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                            <p className="text-sm solaris-muted">{t('sales.cashRegister.openedAt')}</p>
                            <p className="mt-2 font-semibold">
                                {new Date(cashRegister.openedAt).toLocaleString()}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                            <p className="text-sm solaris-muted">{t('sales.cashRegister.openedBy')}</p>
                            <p className="mt-2 font-semibold">{cashRegister.openedBy}</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                            <p className="text-sm solaris-muted">{t('sales.cashRegister.reopens')}</p>
                            <p className="mt-2 text-2xl font-bold">
                                {cashRegister.reopenCount}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="mt-6 solaris-muted">
                        {t('sales.cashRegister.noRegisterToday')}
                    </p>
                )}

                <div className="mt-6 grid gap-4 xl:grid-cols-[2fr_3fr]">
                    <button
                        type="button"
                        onClick={() => {
                            setPaymentFilter('ALL')
                            setCurrentPage(1)
                        }}
                        className={`rounded-2xl border p-6 text-left transition ${
                            paymentFilter === 'ALL'
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900'
                        }`}
                    >
                        <p className="text-sm solaris-muted">{t('sales.cashRegister.totalSales')}</p>
                        <p className="mt-3 text-5xl font-bold">
                            ${summary.totalSales.toFixed(2)}
                        </p>
                        <p className="mt-3 text-sm solaris-subtle">
                            {t('sales.cashRegister.clickToShowAll')}
                        </p>
                    </button>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <PaymentMetric
                            title={t('sales.payment.cash')}
                            value={summary.cashTotal}
                            active={paymentFilter === 'CASH'}
                            onClick={() => {
                                setPaymentFilter('CASH')
                                setCurrentPage(1)
                            }}
                        />

                        <PaymentMetric
                            title={t('sales.payment.debit')}
                            value={summary.debitCardTotal}
                            active={paymentFilter === 'DEBIT_CARD'}
                            onClick={() => {
                                setPaymentFilter('DEBIT_CARD')
                                setCurrentPage(1)
                            }}
                        />

                        <PaymentMetric
                            title={t('sales.payment.credit')}
                            value={summary.creditCardTotal}
                            active={paymentFilter === 'CREDIT_CARD'}
                            onClick={() => {
                                setPaymentFilter('CREDIT_CARD')
                                setCurrentPage(1)
                            }}
                        />

                        <PaymentMetric
                            title={t('sales.payment.transfer')}
                            value={summary.transferTotal}
                            active={paymentFilter === 'TRANSFER'}
                            onClick={() => {
                                setPaymentFilter('TRANSFER')
                                setCurrentPage(1)
                            }}
                        />

                        <PaymentMetric
                            title={t('sales.payment.other')}
                            value={summary.otherTotal}
                            active={paymentFilter === 'OTHER'}
                            onClick={() => {
                                setPaymentFilter('OTHER')
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    {cashRegisterIsOpen && (
                        <button
                            type="button"
                            onClick={() => openAuthorizationModal('CLOSE')}
                            className="rounded-xl bg-red-600 px-5 py-3 text-center font-semibold text-white hover:bg-red-500"
                        >
                            {t('sales.cashRegister.close')}
                        </button>
                    )}

                    {cashRegisterIsClosed && (
                        <button
                            type="button"
                            onClick={() => openAuthorizationModal('REOPEN')}
                            className="rounded-xl bg-amber-600 px-5 py-3 text-center font-semibold text-white hover:bg-amber-500"
                        >
                            {t('sales.cashRegister.reopen')}
                        </button>
                    )}

                    {!cashRegister && (
                        <button
                            type="button"
                            onClick={() => openAuthorizationModal('OPEN')}
                            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                        >
                            {t('sales.cashRegister.open')}
                        </button>
                    )}
                </div>
            </div>

            <div className="solaris-panel mt-8">
                <h2 className="text-xl font-semibold">{t('sales.calendar.title')}</h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:max-w-2xl">
                    <div>
                        <label className="text-sm solaris-muted">{t('sales.calendar.from')}</label>

                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(event) => {
                                setDateFrom(event.target.value)
                                setPaymentFilter('ALL')
                                setCurrentPage(1)
                            }}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <div>
                        <label className="text-sm solaris-muted">{t('sales.calendar.to')}</label>

                        <input
                            type="date"
                            value={dateTo}
                            min={dateFrom}
                            onChange={(event) => {
                                setDateTo(event.target.value)
                                setPaymentFilter('ALL')
                                setCurrentPage(1)
                            }}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-4 lg:hidden">
                {paginatedSales.map((sale) => (
                    <div key={sale.id} className="solaris-panel">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-semibold text-slate-950 dark:text-white">{t('sales.saleNumber', { id: sale.id })}
                                </h2>

                                <p className="mt-1 text-sm solaris-muted">
                                    {new Date(sale.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500 dark:text-blue-300">
                {formatPaymentMethod(sale.paymentMethod, t)}
              </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                            <span className="solaris-muted">Total</span>
                            <span className="font-semibold text-slate-950 dark:text-white">
                ${sale.totalAmount}
              </span>
                        </div>

                        <div className="mt-4">
                            <Link
                                to={`/sales/${sale.id}`}
                                className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                {t('sales.viewDetail')}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="solaris-card mt-8 hidden overflow-hidden lg:block">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">{t('sales.table.sale')}</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">{t('sales.table.payment')}</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">{t('sales.table.items')}</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">{t('sales.table.total')}</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">{t('sales.table.date')}</th>
                        <th className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-300">{t('common.actions')}</th>
                    </tr>
                    </thead>

                    <tbody>
                    {paginatedSales.map((sale) => (
                        <tr key={sale.id} className="border-t border-slate-200 dark:border-slate-800">
                            <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                                {t('sales.saleNumber', { id: sale.id })}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {formatPaymentMethod(sale.paymentMethod, t)}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {sale.items.length}
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-950 dark:text-white">
                                ${sale.totalAmount}
                            </td>

                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                {new Date(sale.createdAt).toLocaleString()}
                            </td>

                            <td className="px-6 py-4 text-right">
                                <Link
                                    to={`/sales/${sale.id}`}
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    {t('sales.viewDetail')}
                                </Link>
                            </td>
                        </tr>
                    ))}

                    {paginatedSales.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-10 text-center solaris-muted">
                                {t('sales.empty')}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm solaris-muted">
                        {t('sales.pagination', {
                            currentPage,
                            totalPages,
                            count: visibleSales.length,
                        })}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {t('common.previous')}
                        </button>

                        {Array.from({ length: totalPages }).map((_, index) => {
                            const page = index + 1

                            return (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        })}

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((page) => page + 1)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {t('common.next')}
                        </button>
                    </div>
                </div>
            )}

            {cashRegisterAction && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-2xl font-bold">
                            {cashRegisterAction === 'OPEN'
                                ? t('sales.cashRegister.open')
                                : cashRegisterAction === 'REOPEN'
                                    ? t('sales.cashRegister.reopen')
                                    : t('sales.cashRegister.close')}
                        </h2>

                        <p className="mt-2 solaris-muted">
                            {t('sales.cashRegister.enterAdminPassword')}
                        </p>

                        <form onSubmit={handleCashRegisterAuthorization} className="mt-6">
                            <label className="text-sm solaris-muted">
                                {t('sales.cashRegister.adminPassword')}
                            </label>

                            <PasswordInput
                                required
                                autoFocus
                                value={adminPassword}
                                onChange={setAdminPassword}
                                className="solaris-input mt-2 w-full"
                            />

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    disabled={processingCashRegister}
                                    className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60 sm:w-auto"
                                >
                                    {processingCashRegister ? t('sales.cashRegister.processing') : t('sales.cashRegister.confirm')}
                                </button>

                                <button
                                    type="button"
                                    onClick={closeAuthorizationModal}
                                    className="w-full rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

type PaymentMetricProps = {
    title: string
    value: number
    active: boolean
    onClick: () => void
}

function PaymentMetric({ title, value, active, onClick }: PaymentMetricProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl border p-4 text-left transition ${
                active
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900'
            }`}
        >
            <p className="text-sm solaris-muted">{title}</p>
            <p className="mt-2 text-2xl font-bold">${value.toFixed(2)}</p>
        </button>
    )
}



export default SalesPage