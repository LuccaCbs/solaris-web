import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getSupplierPreview } from '../api/supplierService'
import type { SupplierPreview } from '../api/supplierService'
import LoadingScreen from '../components/LoadingScreen'

function SupplierViewPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [preview, setPreview] = useState<SupplierPreview | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadPreview() {
            if (!id) return

            try {
                setLoading(true)
                const data = await getSupplierPreview(Number(id))
                setPreview(data)
            } catch {
                toast.error(t('supplierView.loadError'))
            } finally {
                setLoading(false)
            }
        }

        void loadPreview()
    }, [id, t])

    if (loading) {
        return <LoadingScreen />
    }

    if (!preview) {
        return (
            <div className="solaris-panel text-center solaris-muted">
                {t('supplierView.notFound')}
            </div>
        )
    }

    const { supplier } = preview

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/suppliers')}
                        className="mb-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                        {t('supplierView.backToSuppliers')}
                    </button>

                    <h1 className="text-4xl font-bold">{supplier.name}</h1>

                    <p className="mt-2 solaris-muted">
                        {t('supplierView.description')}
                    </p>
                </div>

                <Link
                    to={`/suppliers/${supplier.id}/edit`}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                >
                    {t('supplierView.editSupplier')}
                </Link>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="solaris-panel space-y-4">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                        {t('supplierView.detailsTitle')}
                    </h2>

                    <dl className="grid gap-3 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('suppliers.table.contact')}</dt>
                            <dd className="text-slate-950 dark:text-white">
                                {supplier.contactName || '—'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('suppliers.table.email')}</dt>
                            <dd className="text-slate-950 dark:text-white">
                                {supplier.email || '—'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('suppliers.table.phone')}</dt>
                            <dd className="text-slate-950 dark:text-white">
                                {supplier.phone || '—'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('supplierForm.address')}</dt>
                            <dd className="text-right text-slate-950 dark:text-white">
                                {supplier.address || '—'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('supplierForm.notes')}</dt>
                            <dd className="text-right text-slate-950 dark:text-white">
                                {supplier.notes || '—'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('suppliers.table.status')}</dt>
                            <dd className="font-semibold text-slate-950 dark:text-white">
                                {supplier.active
                                    ? t('suppliers.status.active')
                                    : t('suppliers.status.inactive')}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="solaris-panel space-y-4">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                        {t('supplierView.statsTitle')}
                    </h2>

                    <dl className="grid gap-3 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('supplierView.totalOrders')}</dt>
                            <dd className="font-semibold text-slate-950 dark:text-white">
                                {preview.totalOrders}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="solaris-card mt-8 overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                        {t('supplierView.recentOrders')}
                    </h2>
                </div>

                {preview.recentOrders.length === 0 ? (
                    <p className="px-6 py-8 text-center text-sm solaris-muted">
                        {t('supplierView.noOrders')}
                    </p>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-100 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm text-slate-600 dark:text-slate-300">
                                    {t('supplierView.orderDate')}
                                </th>
                                <th className="px-6 py-3 text-left text-sm text-slate-600 dark:text-slate-300">
                                    {t('supplierView.orderStatus')}
                                </th>
                                <th className="px-6 py-3 text-right text-sm text-slate-600 dark:text-slate-300">
                                    {t('supplierView.orderItems')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {preview.recentOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-t border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-6 py-3 text-sm">
                                        <Link
                                            to={`/supplier-orders/${order.id}`}
                                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                        >
                                            {t('supplierOrders.orderNumber', { id: order.id })}
                                        </Link>
                                        <p className="mt-1 text-xs solaris-muted">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                                        {t(`supplierOrders.status.${order.status.toLowerCase()}`)}
                                    </td>
                                    <td className="px-6 py-3 text-right text-sm font-medium text-slate-950 dark:text-white">
                                        {order.items.length}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default SupplierViewPage
