import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { FiscalDocument } from '../../../types/fiscal'

type NovaFiscalDocumentsListCardProps = {
    documents: FiscalDocument[]
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

export function NovaFiscalDocumentsListCard({
    documents,
}: NovaFiscalDocumentsListCardProps) {
    const { t } = useTranslation()

    if (documents.length === 0) {
        return null
    }

    return (
        <div className="space-y-2">
            {documents.map((document) => (
                <Link
                    key={document.id}
                    to={`/fiscal-documents/${document.id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-3 text-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {t(`fiscal.tipoComprobante.${document.tipoComprobante === 'FACTURA_B' ? 'facturaB' : 'facturaC'}`)}
                                {' · '}
                                {t('nova.fiscalDocumentsListCard.number', {
                                    puntoVenta: String(document.puntoVenta).padStart(5, '0'),
                                    numero: String(document.numeroComprobante).padStart(8, '0'),
                                })}
                            </p>

                            <p className="mt-1 text-xs solaris-muted">
                                {document.customerRazonSocial}
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClassName(document.status)}`}
                        >
                            {t(`fiscalDocument.status.${document.status}`)}
                        </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs solaris-muted">
                        <span>{new Date(document.createdAt).toLocaleString()}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            ${document.importeTotal.toFixed(2)}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    )
}
