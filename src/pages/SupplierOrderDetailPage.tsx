import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
    cancelSupplierOrder,
    getSupplierOrderById,
    markSupplierOrderAsCompleted,
    markSupplierOrderAsSent,
} from '../api/supplierOrderService'
import type { SupplierOrder, SupplierOrderStatus } from '../types/supplierOrder'

function SupplierOrderDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [order, setOrder] = useState<SupplierOrder | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    const loadOrder = useCallback(async () => {
        if (!id) return

        try {
            const data = await getSupplierOrderById(Number(id))
            setOrder(data)
        } catch {
            toast.error('Could not load supplier order')
            navigate('/supplier-orders')
        } finally {
            setLoading(false)
        }
    }, [id, navigate])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadOrder()
    }, [loadOrder])

    async function handleMarkAsSent() {
        if (!order) return

        setProcessing(true)

        try {
            await markSupplierOrderAsSent(order.id)
            toast.success('Order marked as sent')
            await loadOrder()
        } catch {
            toast.error('Could not update order')
        } finally {
            setProcessing(false)
        }
    }

    async function handleMarkAsCompleted() {
        if (!order) return

        setProcessing(true)

        try {
            await markSupplierOrderAsCompleted(order.id)
            toast.success('Order marked as completed')
            await loadOrder()
        } catch {
            toast.error('Could not update order')
        } finally {
            setProcessing(false)
        }
    }

    async function handleCancel() {
        if (!order) return

        const confirmed = window.confirm('Are you sure you want to cancel this supplier order?')

        if (!confirmed) return

        setProcessing(true)

        try {
            await cancelSupplierOrder(order.id)
            toast.success('Order cancelled')
            await loadOrder()
        } catch {
            toast.error('Could not cancel order')
        } finally {
            setProcessing(false)
        }
    }

    async function openWhatsApp() {
        if (!order) return

        if (!order.supplierPhone) {
            toast.error('Supplier has no phone number')
            return
        }

        const phone = order.supplierPhone.replace('+', '').replace(/\s/g, '')
        const message = encodeURIComponent(order.messagePreview)
        const url = `https://wa.me/${phone}?text=${message}`

        window.open(url, '_blank')

        if (order.status === 'DRAFT') {
            try {
                await markSupplierOrderAsSent(order.id)
                toast.success('Order marked as sent')
                await loadOrder()
            } catch {
                toast.error('WhatsApp opened, but could not mark order as sent')
            }
        }
    }

    if (loading) {
        return <SupplierOrderDetailSkeleton />
    }

    if (!order) {
        return null
    }

    return (
        <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-4xl font-bold">Supplier Order #{order.id}</h1>
                        <StatusBadge status={order.status} />
                    </div>

                    <p className="mt-2 solaris-muted">
                        Review order details, supplier information and WhatsApp message.
                    </p>
                </div>

                <Link
                    to="/supplier-orders"
                    className="rounded-xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    Back to Orders
                </Link>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
                <section className="space-y-6">
                    <div className="solaris-panel">
                        <h2 className="text-xl font-semibold">Order Summary</h2>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <InfoCard
                                label="Supplier"
                                value={order.supplierName}
                            />

                            <InfoCard
                                label="Phone"
                                value={order.supplierPhone || 'No phone'}
                            />

                            <InfoCard
                                label="Created"
                                value={new Date(order.createdAt).toLocaleString()}
                            />
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <InfoCard
                                label="Last Updated"
                                value={new Date(order.updatedAt).toLocaleString()}
                            />

                            <InfoCard
                                label="Items"
                                value={String(order.items.length)}
                            />
                        </div>
                    </div>

                    <div className="solaris-card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-100 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                                    Product
                                </th>
                                <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                                    SKU
                                </th>
                                <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                                    Quantity
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
                        <h2 className="text-xl font-semibold">WhatsApp Message</h2>

                        <p className="mt-2 solaris-muted">
                            Message ready to send to the supplier.
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
                            Open WhatsApp
                        </button>
                    </div>

                    <div className="solaris-panel">
                        <h2 className="text-xl font-semibold">Order Actions</h2>

                        <div className="mt-6 flex flex-col gap-3">
                            {order.status === 'DRAFT' && (
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={handleMarkAsSent}
                                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                                >
                                    Mark Sent
                                </button>
                            )}

                            {order.status === 'SENT' && (
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={handleMarkAsCompleted}
                                    className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-60"
                                >
                                    Mark Completed
                                </button>
                            )}

                            {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={handleCancel}
                                    className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                                >
                                    Cancel Order
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
            <p className="text-sm solaris-muted">{label}</p>
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
    const labels: Record<SupplierOrderStatus, string> = {
        DRAFT: 'Draft',
        SENT: 'Sent',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled',
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

function SupplierOrderDetailSkeleton() {
    return (
        <div>
            <div className="h-10 w-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 h-5 w-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <div className="solaris-panel">
                        <div className="h-6 w-44 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="space-y-6">
                    <div className="solaris-panel">
                        <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SupplierOrderDetailPage