import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getProductPreview } from '../api/productService'
import type { ProductPreview } from '../api/productService'
import LoadingScreen from '../components/LoadingScreen'

function ProductViewPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [preview, setPreview] = useState<ProductPreview | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadPreview() {
            if (!id) return

            try {
                setLoading(true)
                const data = await getProductPreview(Number(id))
                setPreview(data)
            } catch {
                toast.error(t('productView.loadError'))
            } finally {
                setLoading(false)
            }
        }

        void loadPreview()
    }, [id, t])

    if (loading) {
        return <LoadingScreen />
    }

    if (!preview) {
        return (
            <div className="solaris-panel text-center solaris-muted">
                {t('productView.notFound')}
            </div>
        )
    }

    const { product } = preview

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="mb-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                        {t('productView.backToProducts')}
                    </button>

                    <h1 className="text-4xl font-bold">{product.name}</h1>

                    <p className="mt-2 solaris-muted">
                        {t('productView.description')}
                    </p>
                </div>

                <Link
                    to={`/products/${product.id}/edit`}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                >
                    {t('productView.editProduct')}
                </Link>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="solaris-panel space-y-4">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                        {t('productView.detailsTitle')}
                    </h2>

                    <dl className="grid gap-3 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('products.table.price')}</dt>
                            <dd className="font-semibold text-slate-950 dark:text-white">
                                ${product.price.toFixed(2)}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('products.table.stock')}</dt>
                            <dd className="font-semibold text-slate-950 dark:text-white">
                                {product.stockQuantity}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('products.table.barcode')}</dt>
                            <dd className="text-slate-950 dark:text-white">
                                {product.barcode || '—'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('productView.iva')}</dt>
                            <dd className="text-slate-950 dark:text-white">
                                {product.ivaRate ?? '—'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('products.table.category')}</dt>
                            <dd className="text-slate-950 dark:text-white">
                                {product.categoryName || '—'}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="solaris-panel space-y-4">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                        {t('productView.statsTitle')}
                    </h2>

                    <dl className="grid gap-3 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('productView.salesThisMonth')}</dt>
                            <dd className="font-semibold text-slate-950 dark:text-white">
                                {preview.salesQuantityThisMonth} ({t('productView.revenue', { amount: preview.salesRevenueThisMonth.toFixed(2) })})
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('productView.supplierOrders')}</dt>
                            <dd className="font-semibold text-slate-950 dark:text-white">
                                {preview.supplierOrderAppearances}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="solaris-muted">{t('productView.restockCount')}</dt>
                            <dd className="font-semibold text-slate-950 dark:text-white">
                                {preview.restockCount}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="solaris-card mt-8 overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                        {t('productView.recentMovements')}
                    </h2>
                </div>

                {preview.recentStockMovements.length === 0 ? (
                    <p className="px-6 py-8 text-center text-sm solaris-muted">
                        {t('productView.noMovements')}
                    </p>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-100 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm text-slate-600 dark:text-slate-300">
                                    {t('productView.movementDate')}
                                </th>
                                <th className="px-6 py-3 text-left text-sm text-slate-600 dark:text-slate-300">
                                    {t('productView.movementType')}
                                </th>
                                <th className="px-6 py-3 text-right text-sm text-slate-600 dark:text-slate-300">
                                    {t('productView.movementQuantity')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {preview.recentStockMovements.map((movement) => (
                                <tr
                                    key={movement.id}
                                    className="border-t border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                                        {new Date(movement.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">
                                        {t(`stockMovements.types.${movement.type.toLowerCase()}`)}
                                    </td>
                                    <td className="px-6 py-3 text-right text-sm font-medium text-slate-950 dark:text-white">
                                        {movement.quantity}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default ProductViewPage
