import { useTranslation } from 'react-i18next'
import type { DailySalesSummary } from '../../../types/sales'

type NovaDailySalesSummaryCardProps = {
    summary: DailySalesSummary
}

export function NovaDailySalesSummaryCard({
    summary,
}: NovaDailySalesSummaryCardProps) {
    const { t } = useTranslation()

    const rows = [
        { label: t('sales.payment.cash'), value: summary.cashTotal },
        { label: t('sales.payment.debitCard'), value: summary.debitCardTotal },
        { label: t('sales.payment.creditCard'), value: summary.creditCardTotal },
        { label: t('sales.payment.transfer'), value: summary.transferTotal },
        { label: t('sales.payment.other'), value: summary.otherTotal },
    ]

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-950 dark:text-white">
                {t('nova.salesSummaryCard.title', { date: summary.date })}
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs solaris-muted">
                        {t('nova.salesSummaryCard.salesCount')}
                    </p>
                    <p className="mt-1 text-xl font-bold">{summary.salesCount}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs solaris-muted">
                        {t('nova.salesSummaryCard.totalSales')}
                    </p>
                    <p className="mt-1 text-xl font-bold">
                        ${summary.totalSales.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="flex items-center justify-between text-sm"
                    >
                        <span className="solaris-muted">{row.label}</span>
                        <span className="font-medium">${row.value.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
