import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
    cancelSupplierOrder,
    getSupplierOrderById,
    markSupplierOrderAsCompleted,
    markSupplierOrderAsSent,
} from '../api/supplierOrderService'
import type { SupplierOrder, SupplierOrderStatus } from '../types/supplierOrder'
import LoadingScreen from '../components/LoadingScreen'

function SupplierOrderDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [order, setOrder] = useState<SupplierOrder | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    const loadOrder = useCallback(async () => {
        if (!id) return

        try {
            setLoading(true)

            const data = await getSupplierOrderById(Number(id))
            setOrder(data)
        } catch {
            toast.error(t('supplierOrderDetail.loadError'))
            navigate('/supplier-orders')
        } finally {
            setLoading(false)
        }
    }, [id, navigate, t])

    useEffect(() => {
        void loadOrder()
    }, [loadOrder])

    async function handleMarkAsSent() {
        if (!order) return

        setProcessing(true)

        try {
            await markSupplierOrderAsSent(order.id)
            toast.success(t('supplierOrderDetail.markSentSuccess'))
            await loadOrder()
        } catch {
            toast.error(t('supplierOrderDetail.updateError'))
        } finally {
            setProcessing(false)
        }
    }

    async function handleMarkAsCompleted() {
        if (!order) return

        setProcessing(true)

        try {
            await markSupplierOrderAsCompleted(order.id)
            toast.success(t('supplierOrderDetail.markCompletedSuccess'))
            await loadOrder()
        } catch {
            toast.error(t('supplierOrderDetail.updateError'))
        } finally {
            setProcessing(false)
        }
    }

    async function handleCancel() {
        if (!order) return

        const confirmed = window.confirm(t('supplierOrderDetail.cancelConfirm'))

        if (!confirmed) return

        setProcessing(true)

        try {
            await cancelSupplierOrder(order.id)
            toast.success(t('supplierOrderDetail.cancelSuccess'))
            await loadOrder()
        } catch {
            toast.error(t('supplierOrderDetail.cancelError'))
        } finally {
            setProcessing(false)
        }
    }

    async function openWhatsApp() {
        if (!order) return

        if (!order.supplierPhone) {
            toast.error(t('supplierOrderDetail.noPhoneError'))
            return
        }

        const phone = order.supplierPhone.replace('+', '').replace(/\s/g, '')
        const message = encodeURIComponent(order.messagePreview)
        const url = `https://wa.me/${phone}?text=${message}`

        window.open(url, '_blank')

        if (order.status === 'DRAFT') {
            try {
                await markSupplierOrderAsSent(order.id)
                toast.success(t('supplierOrderDetail.markSentSuccess'))
                await loadOrder()
            } catch {
                toast.error(t('supplierOrderDetail.whatsappMarkSentError'))
            }
        }
    }

    if (loading) {
        return <LoadingScreen />
    }

    if (!order) {
        return null
    }

    return (
        <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-4xl font-bold">
                            {t('supplierOrderDetail.title', { id: order.id })}
                        </h1>

                        <StatusBadge status={order.status} />
                    </div>

                    <p className="mt-2 solaris-muted">
                        {t('supplierOrderDetail.description')}
                    </p>
                </div>

                <Link
                    to="/supplier-orders"
                    className="rounded-xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    {t('supplierOrderDetail.backToOrders')}
                </Link>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
                <section className="space-y-6">
                    <div className="solaris-panel">
                        <h2 className="text-xl font-semibold">
                            {t('supplierOrderDetail.summary.title')}
                        </h2>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <InfoCard
                                label={t('supplierOrderDetail.summary.supplier')}
                                value={order.supplierName}
                            />

                            <InfoCard
                                label={t('supplierOrderDetail.summary.phone')}
                                value={order.supplierPhone || t('supplierOrderDetail.summary.noPhone')}
                            />

                            <InfoCard
                                label={t('supplierOrderDetail.summary.created')}
                                value={new Date(order.createdAt).toLocaleString()}
                            />
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <InfoCard
                                label={t('supplierOrderDetail.summary.lastUpdated')}
                                value={new Date(order.updatedAt).toLocaleString()}
                            />

                            <InfoCard
                                label={t('supplierOrderDetail.summary.items')}
                                value={String(order.items.length)}
                            />
                        </div>
                    </div>

                    <div className="solaris-card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-100 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                                    {t('supplierOrderDetail.table.product')}
                                </th>

                                <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                                    {t('supplierOrderDetail.table.sku')}
                                </th>

                                <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                                    {t('supplierOrderDetail.table.quantity')}
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {order.items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                                        {item.productName}
                                    </td>

                                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                        {item.productSku}
                                    </td>

                                    <td className="px-6 py-4">
                                            <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-sm text-blue-500 dark:text-blue-300">
                                                {item.quantity}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <aside className="space-y-6">
                    <div className="solaris-panel">
                        <h2 className="text-xl font-semibold">
                            {t('supplierOrderDetail.whatsapp.title')}
                        </h2>

                        <p className="mt-2 solaris-muted">
                            {t('supplierOrderDetail.whatsapp.description')}
                        </p>

                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
                                {order.messagePreview}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openWhatsApp}
                            disabled={!order.supplierPhone || order.status === 'CANCELLED'}
                            className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t('supplierOrderDetail.whatsapp.open')}
                        </button>
                    </div>

                    <div className="solaris-panel">
                        <h2 className="text-xl font-semibold">
                            {t('supplierOrderDetail.actions.title')}
                        </h2>

                        <div className="mt-6 flex flex-col gap-3">
                            {order.status === 'DRAFT' && (
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={handleMarkAsSent}
                                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                                >
                                    {t('supplierOrderDetail.actions.markSent')}
                                </button>
                            )}

                            {order.status === 'SENT' && (
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={handleMarkAsCompleted}
                                    className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-60"
                                >
                                    {t('supplierOrderDetail.actions.markCompleted')}
                                </button>
                            )}

                            {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={handleCancel}
                                    className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                                >
                                    {t('supplierOrderDetail.actions.cancelOrder')}
                                </button>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

type InfoCardProps = {
    label: string
    value: string
}

function InfoCard({ label, value }: InfoCardProps) {
    return (
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm solaris-muted">
                {label}
            </p>

            <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                {value}
            </p>
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

export default SupplierOrderDetailPage