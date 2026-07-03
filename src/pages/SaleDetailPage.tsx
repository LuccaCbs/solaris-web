import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getSaleById } from '../api/salesService'
import { emitInvoiceForSale } from '../api/fiscalService'
import { getCustomers } from '../api/customerService'
import type { PaymentMethod, Sale } from '../types/sales'
import type { Customer } from '../types/customer'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/AuthContext'
import { formatRejectionReason } from '../utils/fiscalUtils'

function getApiErrorMessage(error: unknown) {
    const apiError = error as {
        response?: {
            data?: {
                message?: string
            }
        }
    }

    return apiError.response?.data?.message || ''
}

function SaleDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { hasMinimumRole } = useAuth()

    const [sale, setSale] = useState<Sale | null>(null)
    const [loading, setLoading] = useState(true)
    const [invoicing, setInvoicing] = useState(false)
    const [customerModalOpen, setCustomerModalOpen] = useState(false)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loadingCustomers, setLoadingCustomers] = useState(false)

    const canInvoice = hasMinimumRole('CASHIER')

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

    async function openCustomerModal() {
        setCustomerModalOpen(true)
        setLoadingCustomers(true)

        try {
            const data = await getCustomers()
            setCustomers(data)
        } catch {
            toast.error(t('fiscal.invoice.loadCustomersError'))
        } finally {
            setLoadingCustomers(false)
        }
    }

    async function handleEmitInvoice(customerId?: number) {
        if (!sale) return

        setInvoicing(true)

        try {
            const document = await emitInvoiceForSale(
                sale.id,
                customerId ? { customerId } : undefined
            )

            if (document.status === 'REJECTED') {
                const rejectionReason = formatRejectionReason(document.rejectionReason)
                toast.error(
                    rejectionReason
                        ? `${t('fiscal.invoice.rejected')}: ${rejectionReason}`
                        : t('fiscal.invoice.rejected')
                )
            } else {
                toast.success(t('fiscal.invoice.success'))
            }

            setCustomerModalOpen(false)
            setSale({
                ...sale,
                invoiced: true,
                fiscalDocumentId: document.id,
            })
            navigate(`/fiscal-documents/${document.id}`)
        } catch (error) {
            toast.error(getApiErrorMessage(error) || t('fiscal.invoice.error'))
        } finally {
            setInvoicing(false)
        }
    }

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

                <div className="flex flex-col gap-3 sm:flex-row">
                    {canInvoice && !sale.invoiced && (
                        <>
                            <button
                                type="button"
                                disabled={invoicing}
                                onClick={() => handleEmitInvoice()}
                                className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-60"
                            >
                                {invoicing ? t('fiscal.invoice.processing') : t('fiscal.invoice.consumidorFinal')}
                            </button>

                            <button
                                type="button"
                                disabled={invoicing}
                                onClick={openCustomerModal}
                                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                            >
                                {t('fiscal.invoice.withCustomer')}
                            </button>
                        </>
                    )}

                    {sale.invoiced && sale.fiscalDocumentId && (
                        <Link
                            to={`/fiscal-documents/${sale.fiscalDocumentId}`}
                            className="rounded-xl bg-slate-800 px-5 py-3 text-center font-semibold text-white hover:bg-slate-700 dark:bg-slate-700"
                        >
                            {t('fiscal.invoice.viewDocument')}
                        </Link>
                    )}

                    <Link
                        to="/sales"
                        className="rounded-xl border border-slate-300 px-5 py-3 text-center text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        {t('saleDetail.backToSales')}
                    </Link>
                </div>
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
                                {item.productName || item.customName}
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

            {customerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="solaris-panel w-full max-w-lg">
                        <h2 className="text-xl font-semibold">
                            {t('fiscal.invoice.customerModalTitle')}
                        </h2>

                        <p className="mt-2 text-sm solaris-muted">
                            {t('fiscal.invoice.customerModalDescription')}
                        </p>

                        <div className="mt-6 max-h-72 space-y-2 overflow-y-auto">
                            {loadingCustomers ? (
                                <p className="text-sm solaris-muted">{t('common.loading')}</p>
                            ) : customers.length === 0 ? (
                                <p className="text-sm solaris-muted">{t('fiscal.invoice.noCustomers')}</p>
                            ) : (
                                customers.map((customer) => (
                                    <button
                                        key={customer.id}
                                        type="button"
                                        disabled={invoicing}
                                        onClick={() => handleEmitInvoice(customer.id)}
                                        className="flex w-full flex-col rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                                    >
                                        <span className="font-medium">{customer.razonSocial}</span>
                                        <span className="text-sm solaris-muted">
                                            {customer.documentType} {customer.documentNumber}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setCustomerModalOpen(false)}
                                className="rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700"
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
