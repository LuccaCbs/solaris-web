import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getCustomerPreview } from '../api/customerService'
import type { CustomerPreview } from '../api/customerService'
import LoadingScreen from '../components/LoadingScreen'

function CustomerViewPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [preview, setPreview] = useState<CustomerPreview | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadPreview() {
            if (!id) return

            try {
                setLoading(true)
                const data = await getCustomerPreview(Number(id))
                setPreview(data)
            } catch {
                toast.error(t('customerView.loadError'))
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
                {t('customerView.notFound')}
            </div>
        )
    }

    const { customer } = preview

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/customers')}
                        className="mb-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                        {t('customerView.backToCustomers')}
                    </button>

                    <h1 className="text-4xl font-bold">{customer.razonSocial}</h1>

                    <p className="mt-2 solaris-muted">
                        {t('customerView.description')}
                    </p>
                </div>

                <Link
                    to={`/customers/${customer.id}/edit`}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                >
                    {t('customerView.editCustomer')}
                </Link>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="solaris-panel space-y-4">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                        {t('customerView.detailsTitle')}
                    </h2>

                    <dl className="grid gap-3 text-sm">
                        <div>
                            <dt className="solaris-muted">{t('customerForm.documentsTitle')}</dt>
                            <dd className="mt-2 space-y-2 text-slate-950 dark:text-white">
                                {(customer.documents?.length
                                    ? customer.documents
                                    : [{
                                        documentType: customer.documentType,
                                        documentNumber: customer.documentNumber,
                                        primary: true,
                                    }]
                                ).map((document, index) => (
                                    <div
                                        key={`${document.documentType}-${document.documentNumber}-${index}`}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <span>
                                            {document.documentType} {document.documentNumber}
                                        </span>
                                        {document.primary && (
                                            <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-300">
                                                {t('customerForm.primaryDocument')}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('customers.table.condicionIva')}</dt>
                            <dd className="text-slate-950 dark:text-white">
                                {t(`customers.condicionesIva.${customer.condicionIva}`)}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('customers.table.email')}</dt>
                            <dd className="text-slate-950 dark:text-white">
                                {customer.email || '—'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('customers.table.phone')}</dt>
                            <dd className="text-slate-950 dark:text-white">
                                {customer.phone || '—'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('customerForm.address')}</dt>
                            <dd className="text-right text-slate-950 dark:text-white">
                                {customer.address || '—'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('customers.table.customer')}</dt>
                            <dd className="font-semibold text-slate-950 dark:text-white">
                                {customer.active !== false
                                    ? t('suppliers.status.active')
                                    : t('customers.status.inactive')}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="solaris-panel space-y-4">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                        {t('customerView.statsTitle')}
                    </h2>

                    <dl className="grid gap-3 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('customerView.invoicedSales')}</dt>
                            <dd className="font-semibold text-slate-950 dark:text-white">
                                {preview.totalInvoicedDocuments}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="solaris-card mt-8 overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                        {t('customerView.invoicedDocumentsTitle')}
                    </h2>
                </div>

                {preview.invoicedDocuments.length === 0 ? (
                    <p className="px-6 py-8 text-center text-sm solaris-muted">
                        {t('customerView.noInvoicedDocuments')}
                    </p>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-100 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm text-slate-600 dark:text-slate-300">
                                    {t('customerView.documentDate')}
                                </th>
                                <th className="px-6 py-3 text-left text-sm text-slate-600 dark:text-slate-300">
                                    {t('customerView.documentNumber')}
                                </th>
                                <th className="px-6 py-3 text-left text-sm text-slate-600 dark:text-slate-300">
                                    {t('customerView.documentStatus')}
                                </th>
                                <th className="px-6 py-3 text-right text-sm text-slate-600 dark:text-slate-300">
                                    {t('customerView.documentTotal')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {preview.invoicedDocuments.map((document) => (
                                <tr
                                    key={document.id}
                                    className="border-t border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                                        {new Date(document.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-sm">
                                        <Link
                                            to={`/fiscal-documents/${document.id}`}
                                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                        >
                                            {t('fiscalDocument.comprobanteNumber', {
                                                puntoVenta: String(document.puntoVenta).padStart(5, '0'),
                                                numero: String(document.numeroComprobante).padStart(8, '0'),
                                            })}
                                        </Link>
                                        {document.saleId && (
                                            <p className="mt-1 text-xs solaris-muted">
                                                <Link
                                                    to={`/sales/${document.saleId}`}
                                                    className="hover:text-blue-500"
                                                >
                                                    {t('fiscalDocument.viewSale')}
                                                </Link>
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                                        {t(`fiscalDocument.status.${document.status}`)}
                                    </td>
                                    <td className="px-6 py-3 text-right text-sm font-medium text-slate-950 dark:text-white">
                                        ${document.importeTotal.toFixed(2)}
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

export default CustomerViewPage
