import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Customer } from '../../../types/customer'
import { formatCustomerDocumentsCompact } from '../../../types/customer'

type NovaCustomerCardProps = {
    customer: Customer
}

export function NovaCustomerCard({ customer }: NovaCustomerCardProps) {
    const { t } = useTranslation()

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-slate-950 dark:text-white">
                        {customer.razonSocial}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {formatCustomerDocumentsCompact(customer)}
                    </p>
                </div>

                <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500 dark:text-blue-300">
                    {t(`customers.condicionesIva.${customer.condicionIva}`)}
                </span>
            </div>

            <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {customer.email && (
                    <p>
                        <strong>{t('nova.customerCard.email')}:</strong> {customer.email}
                    </p>
                )}

                {customer.phone && (
                    <p>
                        <strong>{t('nova.customerCard.phone')}:</strong> {customer.phone}
                    </p>
                )}

                {customer.address && (
                    <p>
                        <strong>{t('nova.customerCard.address')}:</strong> {customer.address}
                    </p>
                )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                <Link
                    to="/customers"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                    {t('nova.customerCard.viewInApp')}
                </Link>

                <Link
                    to={`/customers/${customer.id}/edit`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                    {t('nova.customerCard.edit')}
                </Link>
            </div>
        </div>
    )
}
