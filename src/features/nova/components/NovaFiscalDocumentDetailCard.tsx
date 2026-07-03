import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { FiscalDocument, TipoComprobante } from '../../../types/fiscal'
import { formatRejectionReason } from '../../../utils/fiscalUtils'

type NovaFiscalDocumentDetailCardProps = {
    document: FiscalDocument
}

function formatTipoComprobante(tipo: TipoComprobante, t: (key: string) => string) {
    const labels: Record<TipoComprobante, string> = {
        FACTURA_B: t('fiscal.tipoComprobante.facturaB'),
        FACTURA_C: t('fiscal.tipoComprobante.facturaC'),
    }

    return labels[tipo]
}

function statusClassName(status: FiscalDocument['status']) {
    switch (status) {
        case 'AUTHORIZED':
            return 'bg-green-500/10 text-green-500 dark:text-green-300'
        case 'REJECTED':
            return 'bg-red-500/10 text-red-500 dark:text-red-300'
        default:
            return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-300'
    }
}

export function NovaFiscalDocumentDetailCard({
    document,
}: NovaFiscalDocumentDetailCardProps) {
    const { t } = useTranslation()
    const rejectionReason = formatRejectionReason(document.rejectionReason)

    return (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-slate-950 dark:text-white">
                        {formatTipoComprobante(document.tipoComprobante, t)}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t('fiscalDocument.comprobanteNumber', {
                            puntoVenta: String(document.puntoVenta).padStart(5, '0'),
                            numero: String(document.numeroComprobante).padStart(8, '0'),
                        })}
                    </p>
                </div>

                <span
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${statusClassName(document.status)}`}
                >
                    {t(`fiscalDocument.status.${document.status}`)}
                </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs solaris-muted">{t('fiscal.cae')}</p>
                    <p className="font-medium">{document.cae || '—'}</p>
                </div>

                <div>
                    <p className="text-xs solaris-muted">{t('fiscalDocument.customer')}</p>
                    <p className="font-medium">{document.customerRazonSocial}</p>
                </div>

                <div>
                    <p className="text-xs solaris-muted">{t('fiscal.importeNeto')}</p>
                    <p className="font-medium">${document.importeNeto.toFixed(2)}</p>
                </div>

                <div>
                    <p className="text-xs solaris-muted">{t('fiscalDocument.importeTotal')}</p>
                    <p className="font-medium">${document.importeTotal.toFixed(2)}</p>
                </div>
            </div>

            {document.status === 'REJECTED' && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-200">
                    {rejectionReason || t('fiscalDocument.rejectionReasonUnknown')}
                </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
                <Link
                    to={`/fiscal-documents/${document.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                    {t('nova.fiscalDocumentCard.viewInApp')}
                </Link>

                {document.saleId && (
                    <Link
                        to={`/sales/${document.saleId}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                        {t('fiscalDocument.viewSale')}
                    </Link>
                )}

                {document.pdfUrl && (
                    <a
                        href={document.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                        {t('fiscalDocument.downloadPdf')}
                    </a>
                )}
            </div>
        </div>
    )
}
