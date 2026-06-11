import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
    cancelSupplierOrder,
    deleteSupplierOrder,
    getSupplierOrders,
    markSupplierOrderAsCompleted,
    markSupplierOrderAsSent,
} from '../api/supplierOrderService'
import type { SupplierOrder, SupplierOrderStatus } from '../types/supplierOrder'
import LoadingScreen from '../components/LoadingScreen'

type StatusFilter = 'ALL' | SupplierOrderStatus

function SupplierOrdersPage() {
    const { t } = useTranslation()

    const [orders, setOrders] = useState<SupplierOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    async function loadOrders() {
        try {
            setLoading(true)
            const data = await getSupplierOrders()
            setOrders(data)
        } catch {
            toast.error(t('supplierOrders.loadError'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadOrders()
    }, [t])

    const filteredOrders = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim()

        return orders
            .filter((order) => {
                const matchesStatus =
                    statusFilter === 'ALL' || order.status === statusFilter

                const matchesSearch =
                    !normalizedSearch ||
                    order.supplierName.toLowerCase().includes(normalizedSearch) ||
                    order.items.some((item) =>
                        item.productName.toLowerCase().includes(normalizedSearch)
                    )

                return matchesStatus && matchesSearch
            })
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
    }, [orders, statusFilter, search])

    const totalPages = Math.ceil(filteredOrders.length / pageSize)

    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    function clearFilters() {
        setSearch('')
        setStatusFilter('ALL')
        setCurrentPage(1)
    }

    async function handleMarkAsSent(id: number) {
        try {
            await markSupplierOrderAsSent(id)
            toast.success(t('supplierOrders.markSentSuccess'))
            await loadOrders()
        } catch {
            toast.error(t('supplierOrders.updateError'))
        }
    }

    async function handleMarkAsCompleted(id: number) {
        try {
            await markSupplierOrderAsCompleted(id)
            toast.success(t('supplierOrders.markCompletedSuccess'))
            await loadOrders()
        } catch {
            toast.error(t('supplierOrders.updateError'))
        }
    }

    async function handleCancel(id: number) {
        try {
            await cancelSupplierOrder(id)
            toast.success(t('supplierOrders.cancelSuccess'))
            await loadOrders()
        } catch {
            toast.error(t('supplierOrders.cancelError'))
        }
    }

    async function handleDelete(id: number) {
        const confirmed = window.confirm(t('supplierOrders.deleteConfirm'))

        if (!confirmed) return

        try {
            await deleteSupplierOrder(id)
            toast.success(t('supplierOrders.deleteSuccess'))
            await loadOrders()
        } catch {
            toast.error(t('supplierOrders.deleteError'))
        }
    }

    async function openWhatsApp(order: SupplierOrder) {
        if (!order.supplierPhone) {
            toast.error(t('supplierOrders.noPhoneError'))
            return
        }

        const phone = order.supplierPhone.replace('+', '').replace(/\s/g, '')
        const message = encodeURIComponent(order.messagePreview)
        const url = `https://wa.me/${phone}?text=${message}`

        window.open(url, '_blank')

        if (order.status === 'DRAFT') {
            try {
                await markSupplierOrderAsSent(order.id)
                toast.success(t('supplierOrders.markSentSuccess'))
                await loadOrders()
            } catch {
                toast.error(t('supplierOrders.whatsappMarkSentError'))
            }
        }
    }

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        {t('supplierOrders.title')}
                    </h1>

                    <p className="mt-2 solaris-muted">
                        {t('supplierOrders.description')}
                    </p>
                </div>

                <Link
                    to="/supplier-orders/new"
                    className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                >
                    {t('supplierOrders.newOrder')}
                </Link>
            </div>

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid gap-3 md:grid-cols-3">
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder={t('supplierOrders.searchPlaceholder')}
                        className="solaris-input w-full"
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) => {
                            setStatusFilter(event.target.value as StatusFilter)
                            setCurrentPage(1)
                        }}
                        className="solaris-input"
                    >
                        <option value="ALL">{t('supplierOrders.filters.allStatuses')}</option>
                        <option value="DRAFT">{t('supplierOrders.status.draft')}</option>
                        <option value="SENT">{t('supplierOrders.status.sent')}</option>
                        <option value="COMPLETED">{t('supplierOrders.status.completed')}</option>
                        <option value="CANCELLED">{t('supplierOrders.status.cancelled')}</option>
                    </select>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        {t('common.clearFilters')}
                    </button>
                </div>

                <p className="text-sm solaris-muted">
                    {t('supplierOrders.results', { count: filteredOrders.length })}
                </p>
            </div>

            <div className="mt-8 space-y-4 lg:hidden">
                {paginatedOrders.map((order) => (
                    <div key={order.id} className="solaris-panel">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-semibold text-slate-950 dark:text-white">
                                    {t('supplierOrders.orderNumber', { id: order.id })}
                                </h2>

                                <p className="mt-1 text-sm solaris-muted">
                                    {order.supplierName}
                                </p>

                                <p className="mt-1 text-sm solaris-subtle">
                                    {new Date(order.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <StatusBadge status={order.status} />
                        </div>

                        <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                            <p className="text-sm solaris-muted">
                                {t('supplierOrders.itemsCount', {
                                    count: order.items.length,
                                })}
                            </p>

                            <p className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
                                {order.messagePreview}
                            </p>
                        </div>

                        <OrderActions
                            order={order}
                            onWhatsApp={openWhatsApp}
                            onSent={handleMarkAsSent}
                            onCompleted={handleMarkAsCompleted}
                            onCancel={handleCancel}
                            onDelete={handleDelete}
                        />
                    </div>
                ))}
            </div>

            <div className="solaris-card mt-8 hidden overflow-hidden lg:block">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('supplierOrders.table.order')}
                        </th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('supplierOrders.table.supplier')}
                        </th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('supplierOrders.table.items')}
                        </th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('common.status')}
                        </th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('supplierOrders.table.created')}
                        </th>
                        <th className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                            {t('common.actions')}
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {paginatedOrders.map((order) => (
                        <tr
                            key={order.id}
                            className="border-t border-slate-200 dark:border-slate-800"
                        >
                            <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                                {t('supplierOrders.orderNumber', { id: order.id })}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {order.supplierName}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {order.items.length}
                            </td>

                            <td className="px-6 py-4">
                                <StatusBadge status={order.status} />
                            </td>

                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                {new Date(order.createdAt).toLocaleString()}
                            </td>

                            <td className="px-6 py-4 text-right">
                                <OrderActions
                                    order={order}
                                    onWhatsApp={openWhatsApp}
                                    onSent={handleMarkAsSent}
                                    onCompleted={handleMarkAsCompleted}
                                    onCancel={handleCancel}
                                    onDelete={handleDelete}
                                />
                            </td>
                        </tr>
                    ))}

                    {paginatedOrders.length === 0 && (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-6 py-10 text-center solaris-muted"
                            >
                                {t('supplierOrders.empty')}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm solaris-muted">
                        {t('supplierOrders.pagination', {
                            currentPage,
                            totalPages,
                            count: filteredOrders.length,
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
        </div>
    )
}

type StatusBadgeProps = {
    status: SupplierOrderStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
    const { t } = useTranslation()

    const labels: Record<SupplierOrderStatus, string> = {
        DRAFT: t('supplierOrders.status.draft'),
        SENT: t('supplierOrders.status.sent'),
        COMPLETED: t('supplierOrders.status.completed'),
        CANCELLED: t('supplierOrders.status.cancelled'),
    }

    const classNames: Record<SupplierOrderStatus, string> = {
        DRAFT: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
        SENT: 'bg-blue-500/10 text-blue-500 dark:text-blue-300',
        COMPLETED: 'bg-green-500/10 text-green-500 dark:text-green-300',
        CANCELLED: 'bg-red-500/10 text-red-500 dark:text-red-300',
    }

    return (
        <span className={`rounded-lg px-3 py-1 text-sm font-medium ${classNames[status]}`}>
            {labels[status]}
        </span>
    )
}

type OrderActionsProps = {
    order: SupplierOrder
    onWhatsApp: (order: SupplierOrder) => void
    onSent: (id: number) => void
    onCompleted: (id: number) => void
    onCancel: (id: number) => void
    onDelete: (id: number) => void
}

function OrderActions({
                          order,
                          onWhatsApp,
                          onSent,
                          onCompleted,
                          onCancel,
                          onDelete,
                      }: OrderActionsProps) {
    const { t } = useTranslation()

    return (
        <div className="flex flex-wrap justify-end gap-2">
            <Link
                to={`/supplier-orders/${order.id}`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
                {t('supplierOrders.actions.details')}
            </Link>

            <button
                type="button"
                onClick={() => onWhatsApp(order)}
                disabled={!order.supplierPhone || order.status === 'CANCELLED'}
                className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-300"
            >
                {t('supplierOrders.actions.whatsapp')}
            </button>

            {order.status === 'DRAFT' && (
                <button
                    type="button"
                    onClick={() => onSent(order.id)}
                    className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-500 hover:bg-blue-500/20 dark:text-blue-300"
                >
                    {t('supplierOrders.actions.markSent')}
                </button>
            )}

            {order.status === 'SENT' && (
                <button
                    type="button"
                    onClick={() => onCompleted(order.id)}
                    className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-500 hover:bg-green-500/20 dark:text-green-300"
                >
                    {t('supplierOrders.actions.complete')}
                </button>
            )}

            {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                <button
                    type="button"
                    onClick={() => onCancel(order.id)}
                    className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                >
                    {t('supplierOrders.actions.cancel')}
                </button>
            )}

            <button
                type="button"
                onClick={() => onDelete(order.id)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
                {t('common.delete')}
            </button>
        </div>
    )
}

export default SupplierOrdersPage