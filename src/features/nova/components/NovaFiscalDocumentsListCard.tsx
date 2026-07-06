import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { FiscalDocument } from '../../../types/fiscal'

type NovaFiscalDocumentsListCardProps = {
    documents: FiscalDocument[]
    totalCount?: number
}

const COMPACT_THRESHOLD = 5

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

export function NovaFiscalDocumentsListCard({
    documents,
    totalCount,
}: NovaFiscalDocumentsListCardProps) {
    const { t } = useTranslation()
    const isCompact = documents.length > COMPACT_THRESHOLD
    const listTotal = totalCount ?? documents.length

    if (documents.length === 0) {
        return null
    }

    const renderDocument = (document: FiscalDocument, compact = false) => (
        <Link
            key={document.id}
            to={`/fiscal-documents/${document.id}`}
            className={
                compact
                    ? 'flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900'
                    : 'block rounded-xl border border-slate-200 bg-white p-3 text-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900'
            }
        >
            <div className="min-w-0">
                <p
                    className={
                        compact
                            ? 'truncate font-medium text-slate-900 dark:text-slate-100'
                            : 'font-semibold text-slate-900 dark:text-slate-100'
                    }
                >
                    {t(`fiscal.tipoComprobante.${document.tipoComprobante === 'FACTURA_B' ? 'facturaB' : 'facturaC'}`)}
                    {' · '}
                    {t('nova.fiscalDocumentsListCard.number', {
                        puntoVenta: String(document.puntoVenta).padStart(5, '0'),
                        numero: String(document.numeroComprobante).padStart(8, '0'),
                    })}
                </p>

                <p className={`${compact ? 'truncate' : 'mt-1'} text-xs solaris-muted`}>
                    {document.customerRazonSocial}
                </p>
            </div>

            <div className={compact ? 'shrink-0 text-right' : 'mt-3 flex items-center justify-between text-xs solaris-muted'}>
                {!compact && <span>{new Date(document.createdAt).toLocaleString()}</span>}

                <div className={compact ? 'text-right' : ''}>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                        ${document.importeTotal.toFixed(2)}
                    </p>

                    <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClassName(document.status)}`}
                    >
                        {t(`fiscalDocument.status.${document.status}`)}
                    </span>
                </div>
            </div>
        </Link>
    )

    if (isCompact) {
        return (
            <div className="space-y-2">
                <div className="max-h-52 space-y-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent dark:scrollbar-thumb-slate-700">
                    {documents.map((document) => renderDocument(document, true))}
                </div>

                <Link
                    to="/fiscal-documents"
                    className="block text-center text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                    {t('nova.fiscalDocumentsListCard.viewAll', { count: listTotal })}
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {documents.map((document) => renderDocument(document))}
        </div>
    )
}
