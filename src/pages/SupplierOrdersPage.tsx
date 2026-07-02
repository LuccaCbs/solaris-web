import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
    Ban,
    CheckCircle2,
    Eye,
    Menu,
    MessageCircle,
    Send,
    SquarePen,
    Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
    const navigate = useNavigate()

    const [orders, setOrders] = useState<SupplierOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [openActionsOrderId, setOpenActionsOrderId] = useState<number | null>(
        null,
    )

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
        void loadOrders()
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
                        item.productName
                            .toLowerCase()
                            .includes(normalizedSearch),
                    )

                return matchesStatus && matchesSearch
            })
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            )
    }, [orders, statusFilter, search])

    const totalPages = Math.ceil(filteredOrders.length / pageSize)

    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
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

    function toggleActions(orderId: number) {
        setOpenActionsOrderId((currentId) =>
            currentId === orderId ? null : orderId,
        )
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
                        <option value="ALL">
                            {t('supplierOrders.filters.allStatuses')}
                        </option>
                        <option value="DRAFT">
                            {t('supplierOrders.status.draft')}
                        </option>
                        <option value="SENT">
                            {t('supplierOrders.status.sent')}
                        </option>
                        <option value="COMPLETED">
                            {t('supplierOrders.status.completed')}
                        </option>
                        <option value="CANCELLED">
                            {t('supplierOrders.status.cancelled')}
                        </option>
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
                    {t('supplierOrders.results', {
                        count: filteredOrders.length,
                    })}
                </p>
            </div>

            <div className="mt-8 space-y-4 lg:hidden">
                {paginatedOrders.map((order) => (
                    <div key={order.id} className="solaris-panel">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-semibold text-slate-950 dark:text-white">
                                    {t('supplierOrders.orderNumber', {
                                        id: order.id,
                                    })}
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
                        </div>

                        <div className="mt-3 flex justify-end">
                            <OrderActions
                                order={order}
                                onDetails={(id) =>
                                    navigate(`/supplier-orders/${id}`)
                                }
                                onWhatsApp={openWhatsApp}
                                onSent={handleMarkAsSent}
                                onCompleted={handleMarkAsCompleted}
                                onCancel={handleCancel}
                                onDelete={handleDelete}
                                onEdit={(id) =>
                                    navigate(`/supplier-orders/${id}/edit`)
                                }
                                isOpen={openActionsOrderId === order.id}
                                onToggle={() => toggleActions(order.id)}
                                onClose={() => setOpenActionsOrderId(null)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="solaris-card mt-8 hidden overflow-visible lg:block">
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
                                {t('supplierOrders.orderNumber', {
                                    id: order.id,
                                })}
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

                            <td className="relative overflow-visible px-6 py-4">
                                <OrderActions
                                    order={order}
                                    onDetails={(id) =>
                                        navigate(`/supplier-orders/${id}`)
                                    }
                                    onWhatsApp={openWhatsApp}
                                    onSent={handleMarkAsSent}
                                    onCompleted={handleMarkAsCompleted}
                                    onCancel={handleCancel}
                                    onDelete={handleDelete}
                                    onEdit={(id) =>
                                        navigate(
                                            `/supplier-orders/${id}/edit`,
                                        )
                                    }
                                    isOpen={openActionsOrderId === order.id}
                                    onToggle={() => toggleActions(order.id)}
                                    onClose={() =>
                                        setOpenActionsOrderId(null)
                                    }
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
        <span
            className={`rounded-lg px-3 py-1 text-sm font-medium ${classNames[status]}`}
        >
            {labels[status]}
        </span>
    )
}

type OrderActionsProps = {
    order: SupplierOrder
    onDetails: (id: number) => void
    onWhatsApp: (order: SupplierOrder) => void
    onSent: (id: number) => void
    onCompleted: (id: number) => void
    onCancel: (id: number) => void
    onDelete: (id: number) => void
    onEdit: (id: number) => void
    isOpen: boolean
    onToggle: () => void
    onClose: () => void
}

type ActionMenuItemProps = {
    icon: LucideIcon
    label: string
    onClick: () => void
    danger?: boolean
    disabled?: boolean
}

function ActionMenuItem({
                            icon: Icon,
                            label,
                            onClick,
                            danger = false,
                            disabled = false,
                        }: ActionMenuItemProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                danger
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
        >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{label}</span>
        </button>
    )
}

function OrderActions({
                          order,
                          onDetails,
                          onWhatsApp,
                          onSent,
                          onCompleted,
                          onCancel,
                          onDelete,
                          onEdit,
                          isOpen,
                          onToggle,
                          onClose,
                      }: OrderActionsProps) {
    const { t } = useTranslation()

    function handleAction(action: () => void) {
        action()
        onClose()
    }

    const canEdit = order.status === 'DRAFT'
    const canMarkSent = order.status === 'DRAFT'
    const canComplete = order.status === 'SENT'
    const canCancel =
        order.status !== 'COMPLETED' && order.status !== 'CANCELLED'
    const canDelete = order.status !== 'COMPLETED'
    const canWhatsApp = Boolean(order.supplierPhone) && order.status !== 'CANCELLED'

    return (
        <div className="relative flex justify-end lg:overflow-visible">
            <button
                type="button"
                onClick={onToggle}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label={t('common.actions')}
            >
                <Menu className="h-5 w-5" />
            </button>

            {isOpen && (
                <>
                    <button
                        type="button"
                        aria-label={t('common.close')}
                        onClick={onClose}
                        className="fixed inset-0 z-40 cursor-default bg-black/20 lg:hidden"
                    />

                    <div className="fixed inset-x-4 bottom-24 z-50 max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:absolute lg:inset-auto lg:right-0 lg:top-11 lg:w-64">
                        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
                            {t('common.actions')}
                        </div>

                        <ActionMenuItem
                            icon={Eye}
                            label={t('supplierOrders.actions.details')}
                            onClick={() =>
                                handleAction(() => onDetails(order.id))
                            }
                        />

                        {canEdit && (
                            <ActionMenuItem
                                icon={SquarePen}
                                label={t('supplierOrders.actions.edit')}
                                onClick={() =>
                                    handleAction(() => onEdit(order.id))
                                }
                            />
                        )}

                        <ActionMenuItem
                            icon={MessageCircle}
                            label={t('supplierOrders.actions.whatsapp')}
                            disabled={!canWhatsApp}
                            onClick={() =>
                                handleAction(() => onWhatsApp(order))
                            }
                        />

                        {canMarkSent && (
                            <ActionMenuItem
                                icon={Send}
                                label={t('supplierOrders.actions.markSent')}
                                onClick={() =>
                                    handleAction(() => onSent(order.id))
                                }
                            />
                        )}

                        {canComplete && (
                            <ActionMenuItem
                                icon={CheckCircle2}
                                label={t('supplierOrders.actions.complete')}
                                onClick={() =>
                                    handleAction(() => onCompleted(order.id))
                                }
                            />
                        )}

                        {(canCancel || canDelete) && (
                            <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                        )}

                        {canCancel && (
                            <ActionMenuItem
                                icon={Ban}
                                label={t('supplierOrders.actions.cancel')}
                                danger
                                onClick={() =>
                                    handleAction(() => onCancel(order.id))
                                }
                            />
                        )}

                        {canDelete && (
                            <ActionMenuItem
                                icon={Trash2}
                                label={t('common.delete')}
                                danger
                                onClick={() =>
                                    handleAction(() => onDelete(order.id))
                                }
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default SupplierOrdersPage