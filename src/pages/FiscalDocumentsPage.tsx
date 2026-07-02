import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getFiscalDocuments } from '../api/fiscalService'
import type { FiscalDocument, TipoComprobante } from '../types/fiscal'
import LoadingScreen from '../components/LoadingScreen'

function formatTipoComprobante(tipo: TipoComprobante, t: (key: string) => string) {
    const labels: Record<TipoComprobante, string> = {
        FACTURA_B: t('fiscal.tipoComprobante.facturaB'),
        FACTURA_C: t('fiscal.tipoComprobante.facturaC'),
    }

    return labels[tipo]
}

function FiscalDocumentsPage() {
    const { t } = useTranslation()
    const [documents, setDocuments] = useState<FiscalDocument[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadDocuments() {
            try {
                const data = await getFiscalDocuments()
                setDocuments(data)
            } catch {
                toast.error(t('fiscal.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadDocuments()
    }, [t])

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">{t('fiscal.listTitle')}</h1>
            <p className="mt-2 solaris-muted">{t('fiscal.listDescription')}</p>

            <div className="solaris-card mt-8 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm">{t('fiscal.table.date')}</th>
                        <th className="px-6 py-4 text-left text-sm">{t('fiscal.table.type')}</th>
                        <th className="px-6 py-4 text-left text-sm">{t('fiscal.puntoVenta')}</th>
                        <th className="px-6 py-4 text-left text-sm">{t('fiscal.cae')}</th>
                        <th className="px-6 py-4 text-left text-sm">{t('fiscal.importeTotal')}</th>
                        <th className="px-6 py-4 text-left text-sm">{t('fiscal.status')}</th>
                    </tr>
                    </thead>

                    <tbody>
                    {documents.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center solaris-muted">
                                {t('fiscal.empty')}
                            </td>
                        </tr>
                    ) : (
                        documents.map((document) => (
                            <tr
                                key={document.id}
                                className="border-t border-slate-200 dark:border-slate-800"
                            >
                                <td className="px-6 py-4">
                                    {new Date(document.createdAt).toLocaleString()}
                                </td>

                                <td className="px-6 py-4">
                                    <Link
                                        to={`/fiscal-documents/${document.id}`}
                                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        {formatTipoComprobante(document.tipoComprobante, t)}
                                    </Link>
                                </td>

                                <td className="px-6 py-4">
                                    {String(document.puntoVenta).padStart(5, '0')}-
                                    {String(document.numeroComprobante).padStart(8, '0')}
                                </td>

                                <td className="px-6 py-4">{document.cae || '—'}</td>

                                <td className="px-6 py-4">${document.importeTotal.toFixed(2)}</td>

                                <td className="px-6 py-4">
                                    {t(`fiscalDocument.status.${document.status}`)}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default FiscalDocumentsPage
