import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { PaymentMethod, Sale, SaleItem } from '../../../types/sales'

type NovaSaleDetailCardProps = {
    sale: Sale
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

function getItemLabel(item: SaleItem) {
    return item.productName ?? item.customName ?? `#${item.id}`
}

export function NovaSaleDetailCard({ sale }: NovaSaleDetailCardProps) {
    const { t } = useTranslation()

    return (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-slate-950 dark:text-white">
                        {t('nova.saleCard.title', { id: sale.id })}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(sale.createdAt).toLocaleString()}
                    </p>
                </div>

                <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500 dark:text-blue-300">
                    {formatPaymentMethod(sale.paymentMethod, t)}
                </span>
            </div>

            <div className="mt-4 space-y-2">
                {sale.items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"
                    >
                        <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                                {getItemLabel(item)}
                            </p>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {t('nova.saleCard.lineDetail', {
                                    quantity: item.quantity,
                                    unitPrice: item.unitPrice.toFixed(2),
                                })}
                            </p>
                        </div>

                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            ${item.subtotal.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="space-y-1">
                    {sale.invoiced ? (
                        <span className="inline-block rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-500 dark:text-green-300">
                            {t('nova.saleCard.invoiced')}
                        </span>
                    ) : (
                        <span className="inline-block rounded-full bg-slate-500/10 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-300">
                            {t('nova.saleCard.notInvoiced')}
                        </span>
                    )}
                </div>

                <p className="text-lg font-bold text-slate-950 dark:text-white">
                    ${sale.totalAmount.toFixed(2)}
                </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                <Link
                    to={`/sales/${sale.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                    {t('nova.saleCard.viewInApp')}
                </Link>

                {sale.invoiced && sale.fiscalDocumentId && (
                    <Link
                        to={`/fiscal-documents/${sale.fiscalDocumentId}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                        {t('nova.saleCard.viewInvoice')}
                    </Link>
                )}
            </div>
        </div>
    )
}
