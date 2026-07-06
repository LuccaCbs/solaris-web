import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import type { Sale } from '../../../types/sales'
import { createSalesExportDownloadUrl } from '../../../utils/exportSales'

type NovaExportReportCardProps = {
    from: string
    to: string
    sales: Sale[]
}

export function NovaExportReportCard({
    from,
    to,
    sales,
}: NovaExportReportCardProps) {
    const { t } = useTranslation()

    const download = useMemo(
        () => createSalesExportDownloadUrl(sales, from, to),
        [sales, from, to],
    )

    useEffect(() => {
        return () => {
            URL.revokeObjectURL(download.url)
        }
    }, [download.url])

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-slate-950 dark:text-white">
                        {t('nova.exportReportCard.title')}
                    </h3>
                    <p className="mt-1 text-sm solaris-muted">
                        {from === to
                            ? t('nova.exportReportCard.singleDate', { date: from })
                            : t('nova.exportReportCard.dateRange', { from, to })}
                    </p>
                    <p className="mt-2 text-sm solaris-muted">
                        {t('nova.exportReportCard.records', {
                            count: sales.length,
                        })}
                    </p>
                </div>

                <Download className="shrink-0 text-blue-500" size={20} />
            </div>

            <a
                href={download.url}
                download={download.filename}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
                {t('nova.exportReportCard.download')}
            </a>
        </div>
    )
}
