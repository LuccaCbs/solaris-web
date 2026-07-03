import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getFiscalDocumentById } from '../api/fiscalService'
import type { FiscalDocument, TipoComprobante } from '../types/fiscal'
import LoadingScreen from '../components/LoadingScreen'

function formatTipoComprobante(tipo: TipoComprobante, t: (key: string) => string) {
    const labels: Record<TipoComprobante, string> = {
        FACTURA_B: t('fiscal.tipoComprobante.facturaB'),
        FACTURA_C: t('fiscal.tipoComprobante.facturaC'),
    }

    return labels[tipo]
}

function FiscalDocumentDetailPage() {
    const { id } = useParams()
    const { t } = useTranslation()
    const [document, setDocument] = useState<FiscalDocument | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadDocument() {
            if (!id) return

            try {
                setLoading(true)
                const data = await getFiscalDocumentById(Number(id))
                setDocument(data)
            } catch {
                toast.error(t('fiscalDocument.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadDocument()
    }, [id, t])

    if (loading) {
        return <LoadingScreen />
    }

    if (!document) {
        return (
            <div className="solaris-panel text-center solaris-muted">
                {t('fiscalDocument.notFound')}
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        {formatTipoComprobante(document.tipoComprobante, t)}
                    </h1>

                    <p className="mt-2 solaris-muted">
                        {t('fiscalDocument.comprobanteNumber', {
                            puntoVenta: String(document.puntoVenta).padStart(5, '0'),
                            numero: String(document.numeroComprobante).padStart(8, '0'),
                        })}
                    </p>
                </div>

                <div className="flex gap-3">
                    {document.saleId && (
                        <Link
                            to={`/sales/${document.saleId}`}
                            className="rounded-xl border border-slate-300 px-5 py-3 dark:border-slate-700"
                        >
                            {t('fiscalDocument.viewSale')}
                        </Link>
                    )}

                    <Link
                        to="/fiscal-documents"
                        className="rounded-xl border border-slate-300 px-5 py-3 dark:border-slate-700"
                    >
                        {t('fiscalDocument.backToList')}
                    </Link>
                </div>
            </div>

            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">{t('fiscal.cae')}</p>
                    <p className="mt-3 text-xl font-bold">{document.cae || '—'}</p>
                </div>

                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">{t('fiscal.caeVencimiento')}</p>
                    <p className="mt-3 text-xl font-bold">
                        {document.caeVencimiento
                            ? new Date(document.caeVencimiento).toLocaleDateString()
                            : '—'}
                    </p>
                </div>

                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">{t('fiscal.puntoVenta')}</p>
                    <p className="mt-3 text-xl font-bold">
                        {String(document.puntoVenta).padStart(5, '0')}
                    </p>
                </div>

                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">{t('fiscal.status')}</p>
                    <p className="mt-3 text-xl font-bold">
                        {t(`fiscalDocument.status.${document.status}`)}
                    </p>
                </div>
            </section>

            {document.status === 'REJECTED' && (
                <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
                    <p className="text-sm font-medium text-red-600 dark:text-red-300">
                        {t('fiscalDocument.rejectionReason')}
                    </p>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-200">
                        {document.rejectionReason || t('fiscalDocument.rejectionReasonUnknown')}
                    </p>
                </div>
            )}

            <section className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">{t('fiscal.importeNeto')}</p>
                    <p className="mt-3 text-2xl font-bold">${document.importeNeto.toFixed(2)}</p>
                </div>

                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">{t('fiscal.importeIva')}</p>
                    <p className="mt-3 text-2xl font-bold">${document.importeIva.toFixed(2)}</p>
                </div>

                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">{t('fiscalDocument.importeTotal')}</p>
                    <p className="mt-3 text-2xl font-bold">${document.importeTotal.toFixed(2)}</p>
                </div>
            </section>

            <div className="solaris-panel mt-8">
                <p className="text-sm solaris-muted">{t('fiscalDocument.customer')}</p>
                <p className="mt-2 text-lg font-medium">{document.customerRazonSocial}</p>
            </div>

            <div className="solaris-panel mt-8">
                <h2 className="text-lg font-semibold">{t('fiscalDocument.pdf')}</h2>

                {document.pdfUrl ? (
                    <a
                        href={document.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
                    >
                        {t('fiscalDocument.downloadPdf')}
                    </a>
                ) : (
                    <p className="mt-3 text-sm solaris-muted">{t('fiscalDocument.pdfPlaceholder')}</p>
                )}
            </div>
        </div>
    )
}

export default FiscalDocumentDetailPage
