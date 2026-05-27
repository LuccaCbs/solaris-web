import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

type PaymentFilter = 'ALL' | PaymentMethod
type CashRegisterAction = 'OPEN' | 'CLOSE' | 'REOPEN' | null

function getTodayDateInputValue() {
    return new Date().toISOString().split('T')[0]
}

function getSaleDate(sale: Sale) {
    return sale.createdAt.split('T')[0]
}

function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [dateFrom, setDateFrom] = useState(getTodayDateInputValue())
    const [dateTo, setDateTo] = useState('')
    const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('ALL')
    const [cashRegister, setCashRegister] = useState<CashRegisterSession | null>(null)

    const [cashRegisterAction, setCashRegisterAction] = useState<CashRegisterAction>(null)
    const [adminPassword, setAdminPassword] = useState('')
    const [processingCashRegister, setProcessingCashRegister] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    async function loadData() {
        try {
            const salesData = await getSales()
            setSales(salesData)

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
    }, [sales, dateFrom, dateTo])

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

    function openAuthorizationModal(action: Exclude<CashRegisterAction, null>) {
        setAdminPassword('')
        setCashRegisterAction(action)
    }

    function closeAuthorizationModal() {
        setAdminPassword('')
        setCashRegisterAction(null)
    }

    async function handleCashRegisterAuthorization(event: React.FormEvent) {
        event.preventDefault()

        if (!cashRegisterAction) return

        setProcessingCashRegister(true)

        try {
            if (cashRegisterAction === 'OPEN') {
                const openedCashRegister = await openCashRegister({ adminPassword })

                setCashRegister(openedCashRegister)
                sessionStorage.setItem('solaris_cash_register_opened', 'true')
                toast.success('Cash register opened successfully')
            }

            if (cashRegisterAction === 'CLOSE') {
                const closedCashRegister = await closeCashRegister({ adminPassword })

                setCashRegister(closedCashRegister)
                sessionStorage.removeItem('solaris_cash_register_opened')
                toast.success('Cash register closed successfully')
                await loadData()
            }

            if (cashRegisterAction === 'REOPEN' && cashRegister) {
                const reopenedCashRegister = await reopenCashRegister(cashRegister.id, {
                    adminPassword,
                })

                setCashRegister(reopenedCashRegister)
                sessionStorage.setItem('solaris_cash_register_opened', 'true')
                toast.success('Cash register reopened successfully')
            }

            closeAuthorizationModal()
        } catch {
            toast.error('Invalid admin password or cash register action failed')
        } finally {
            setProcessingCashRegister(false)
        }
    }

    if (loading) {
        return <SalesSkeleton />
    }

    return (
        <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Sales</h1>

                    <p className="mt-2 solaris-muted">
                        Track daily sales and cash register activity.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={() => exportSales(visibleSales)}
                        className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/20 dark:text-emerald-300"
                    >
                        Export Excel
                    </button>

                    {cashRegisterIsOpen ? (
                        <Link
                            to="/sales/new"
                            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                        >
                            New Sale
                        </Link>
                    ) : (
                        <button
                            disabled
                            title="Open or reopen cash register before creating sales"
                            className="cursor-not-allowed rounded-xl bg-slate-400 px-5 py-3 text-center font-semibold text-white opacity-70"
                        >
                            New Sale
                        </button>
                    )}
                </div>
            </div>

            <div className="solaris-panel mt-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Cash Register</h2>

                        <p className="mt-1 solaris-muted">
                            Daily sales control grouped by payment method.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-950 dark:text-slate-300">
              {summary.salesCount} sales
            </span>

                        {cashRegisterIsOpen ? (
                            <span className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500 dark:text-green-300">
                OPEN
              </span>
                        ) : (
                            <span className="rounded-lg bg-red-500/10 px-3 py-1 text-sm font-medium text-red-500 dark:text-red-300">
                CLOSED
              </span>
                        )}
                    </div>
                </div>

                {cashRegister ? (
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                            <p className="text-sm solaris-muted">Opened At</p>
                            <p className="mt-2 font-semibold">
                                {new Date(cashRegister.openedAt).toLocaleString()}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                            <p className="text-sm solaris-muted">Opened By</p>
                            <p className="mt-2 font-semibold">{cashRegister.openedBy}</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                            <p className="text-sm solaris-muted">Reopens</p>
                            <p className="mt-2 text-2xl font-bold">
                                {cashRegister.reopenCount}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="mt-6 solaris-muted">
                        No cash register exists for today.
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
                        <p className="text-sm solaris-muted">Total Sales</p>
                        <p className="mt-3 text-5xl font-bold">
                            ${summary.totalSales.toFixed(2)}
                        </p>
                        <p className="mt-3 text-sm solaris-subtle">
                            Click to show all sales.
                        </p>
                    </button>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <PaymentMetric
                            title="Cash"
                            value={summary.cashTotal}
                            active={paymentFilter === 'CASH'}
                            onClick={() => {
                                setPaymentFilter('CASH')
                                setCurrentPage(1)
                            }}
                        />

                        <PaymentMetric
                            title="Debit"
                            value={summary.debitCardTotal}
                            active={paymentFilter === 'DEBIT_CARD'}
                            onClick={() => {
                                setPaymentFilter('DEBIT_CARD')
                                setCurrentPage(1)
                            }}
                        />

                        <PaymentMetric
                            title="Credit"
                            value={summary.creditCardTotal}
                            active={paymentFilter === 'CREDIT_CARD'}
                            onClick={() => {
                                setPaymentFilter('CREDIT_CARD')
                                setCurrentPage(1)
                            }}
                        />

                        <PaymentMetric
                            title="Transfer"
                            value={summary.transferTotal}
                            active={paymentFilter === 'TRANSFER'}
                            onClick={() => {
                                setPaymentFilter('TRANSFER')
                                setCurrentPage(1)
                            }}
                        />

                        <PaymentMetric
                            title="Other"
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
                            Close Cash Register
                        </button>
                    )}

                    {cashRegisterIsClosed && (
                        <button
                            type="button"
                            onClick={() => openAuthorizationModal('REOPEN')}
                            className="rounded-xl bg-amber-600 px-5 py-3 text-center font-semibold text-white hover:bg-amber-500"
                        >
                            Reopen Cash Register
                        </button>
                    )}

                    {!cashRegister && (
                        <button
                            type="button"
                            onClick={() => openAuthorizationModal('OPEN')}
                            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                        >
                            Open Cash Register
                        </button>
                    )}
                </div>
            </div>

            <div className="solaris-panel mt-8">
                <h2 className="text-xl font-semibold">Sales Calendar</h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:max-w-2xl">
                    <div>
                        <label className="text-sm solaris-muted">From</label>

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
                        <label className="text-sm solaris-muted">To</label>

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
                                <h2 className="font-semibold text-slate-950 dark:text-white">
                                    Sale #{sale.id}
                                </h2>

                                <p className="mt-1 text-sm solaris-muted">
                                    {new Date(sale.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500 dark:text-blue-300">
                {formatPaymentMethod(sale.paymentMethod)}
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
                                View Detail
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="solaris-card mt-8 hidden overflow-hidden lg:block">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Sale</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Payment</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Items</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Total</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Date</th>
                        <th className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-300">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {paginatedSales.map((sale) => (
                        <tr key={sale.id} className="border-t border-slate-200 dark:border-slate-800">
                            <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                                Sale #{sale.id}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {formatPaymentMethod(sale.paymentMethod)}
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
                                    View Detail
                                </Link>
                            </td>
                        </tr>
                    ))}

                    {paginatedSales.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-10 text-center solaris-muted">
                                No sales found for the selected filters.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm solaris-muted">
                        Page {currentPage} of {totalPages} · {visibleSales.length} sales
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Previous
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
                            Next
                        </button>
                    </div>
                </div>
            )}

            {cashRegisterAction && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-2xl font-bold">
                            {cashRegisterAction === 'OPEN'
                                ? 'Open Cash Register'
                                : cashRegisterAction === 'REOPEN'
                                    ? 'Reopen Cash Register'
                                    : 'Close Cash Register'}
                        </h2>

                        <p className="mt-2 solaris-muted">
                            Enter the admin password to continue.
                        </p>

                        <form onSubmit={handleCashRegisterAuthorization} className="mt-6">
                            <label className="text-sm solaris-muted">
                                Admin Password
                            </label>

                            <input
                                required
                                autoFocus
                                type="password"
                                value={adminPassword}
                                onChange={(event) => setAdminPassword(event.target.value)}
                                className="solaris-input mt-2 w-full"
                            />

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    disabled={processingCashRegister}
                                    className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60 sm:w-auto"
                                >
                                    {processingCashRegister ? 'Processing...' : 'Confirm'}
                                </button>

                                <button
                                    type="button"
                                    onClick={closeAuthorizationModal}
                                    className="w-full rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
                                >
                                    Cancel
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

function formatPaymentMethod(paymentMethod: PaymentMethod) {
    const labels: Record<PaymentMethod, string> = {
        CASH: 'Cash',
        DEBIT_CARD: 'Debit Card',
        CREDIT_CARD: 'Credit Card',
        TRANSFER: 'Transfer',
        OTHER: 'Other',
    }

    return labels[paymentMethod]
}

function SalesSkeleton() {
    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-3 h-5 w-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="h-12 w-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>

            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="solaris-panel">
                        <div className="h-4 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                        <div className="mt-4 h-8 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                    </div>
                ))}
            </section>
        </div>
    )
}

export default SalesPage