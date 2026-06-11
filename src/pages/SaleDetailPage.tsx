import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getSaleById } from '../api/salesService'
import type { PaymentMethod, Sale } from '../types/sales'
import LoadingScreen from '../components/LoadingScreen'

function SaleDetailPage() {
    const { id } = useParams()
    const { t } = useTranslation()

    const [sale, setSale] = useState<Sale | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadSale() {
            if (!id) return

            try {
                setLoading(true)

                const data = await getSaleById(Number(id))
                setSale(data)
            } catch {
                toast.error(t('saleDetail.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadSale()
    }, [id, t])

    if (loading) {
        return <LoadingScreen />
    }

    if (!sale) {
        return (
            <div className="solaris-panel text-center solaris-muted">
                {t('saleDetail.notFound')}
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        {t('saleDetail.title', { id: sale.id })}
                    </h1>

                    <p className="mt-2 solaris-muted">
                        {new Date(sale.createdAt).toLocaleString()}
                    </p>
                </div>

                <Link
                    to="/sales"
                    className="rounded-xl border border-slate-300 px-5 py-3 text-center text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    {t('saleDetail.backToSales')}
                </Link>
            </div>

            <section className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">
                        {t('saleDetail.paymentMethod')}
                    </p>

                    <p className="mt-3 text-2xl font-bold">
                        {formatPaymentMethod(sale.paymentMethod, t)}
                    </p>
                </div>

                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">
                        {t('saleDetail.items')}
                    </p>

                    <p className="mt-3 text-2xl font-bold">
                        {sale.items.length}
                    </p>
                </div>

                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">
                        {t('saleDetail.total')}
                    </p>

                    <p className="mt-3 text-2xl font-bold">
                        ${sale.totalAmount.toFixed(2)}
                    </p>
                </div>
            </section>

            <div className="solaris-card mt-8 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('saleDetail.table.product')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('saleDetail.table.quantity')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('saleDetail.table.unitPrice')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('saleDetail.table.subtotal')}
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {sale.items.map((item) => (
                        <tr
                            key={item.id}
                            className="border-t border-slate-200 dark:border-slate-800"
                        >
                            <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                                {item.productName}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {item.quantity}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                ${item.unitPrice.toFixed(2)}
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-950 dark:text-white">
                                ${item.subtotal.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
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

export default SaleDetailPage