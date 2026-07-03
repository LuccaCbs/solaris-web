import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { PaymentMethod, Sale } from '../../../types/sales'

type NovaSalesListCardProps = {
    sales: Sale[]
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

export function NovaSalesListCard({ sales }: NovaSalesListCardProps) {
    const { t } = useTranslation()

    if (sales.length === 0) {
        return null
    }

    return (
        <div className="space-y-2">
            {sales.map((sale) => (
                <Link
                    key={sale.id}
                    to={`/sales/${sale.id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-3 text-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {t('nova.salesListCard.title', { id: sale.id })}
                            </p>

                            <p className="mt-1 text-xs solaris-muted">
                                {new Date(sale.createdAt).toLocaleString()}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                ${sale.totalAmount.toFixed(2)}
                            </p>

                            {sale.invoiced && (
                                <span className="mt-1 inline-block rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-500 dark:text-green-300">
                                    {t('nova.salesListCard.invoiced')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs solaris-muted">
                        <span>
                            {formatPaymentMethod(sale.paymentMethod, t)}
                        </span>
                        <span>·</span>
                        <span>
                            {t('nova.salesListCard.items', {
                                count: sale.items.length,
                            })}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    )
}
