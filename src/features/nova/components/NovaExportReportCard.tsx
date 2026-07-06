import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import type { Sale } from '../../../types/sales'
import type { Product } from '../../../types/product'
import { createSalesExportDownloadUrl } from '../../../utils/exportSales'
import { createProductsExportDownloadUrl } from '../../../utils/exportProducts'

type NovaExportReportCardProps =
    | {
          module: 'sales'
          from: string
          to: string
          sales: Sale[]
      }
    | {
          module: 'products'
          products: Product[]
      }

export function NovaExportReportCard(props: NovaExportReportCardProps) {
    const { t } = useTranslation()

    const download = useMemo(() => {
        if (props.module === 'sales') {
            return createSalesExportDownloadUrl(
                props.sales,
                props.from,
                props.to,
            )
        }

        return createProductsExportDownloadUrl(props.products)
    }, [props])

    useEffect(() => {
        return () => {
            URL.revokeObjectURL(download.url)
        }
    }, [download.url])

    const recordCount =
        props.module === 'sales' ? props.sales.length : props.products.length

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-slate-950 dark:text-white">
                        {props.module === 'sales'
                            ? t('nova.exportReportCard.salesTitle')
                            : t('nova.exportReportCard.productsTitle')}
                    </h3>
                    {props.module === 'sales' ? (
                        <p className="mt-1 text-sm solaris-muted">
                            {props.from === props.to
                                ? t('nova.exportReportCard.singleDate', {
                                      date: props.from,
                                  })
                                : t('nova.exportReportCard.dateRange', {
                                      from: props.from,
                                      to: props.to,
                                  })}
                        </p>
                    ) : null}
                    <p className="mt-2 text-sm solaris-muted">
                        {t('nova.exportReportCard.records', {
                            count: recordCount,
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
