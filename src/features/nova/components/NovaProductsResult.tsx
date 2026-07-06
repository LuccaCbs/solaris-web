import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface NovaProduct {
    id: number
    name: string
    barcode?: string
    price?: number
    stockQuantity?: number
    categoryName?: string
    lowStock?: boolean
}

interface NovaProductsResultProps {
    products: NovaProduct[]
    intent?: 'search_product' | 'list_low_stock'
}

export function NovaProductsResult({ products, intent }: NovaProductsResultProps) {
    const { t } = useTranslation()

    if (products.length === 0) {
        return null
    }

    const showRestock = intent === 'list_low_stock' || products.some((product) => product.lowStock)
    const restockLink =
        products.length === 1
            ? `/stock/restock?productId=${products[0].id}`
            : '/products?stock=low'

    return (
        <div className="space-y-2">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {product.name}
                            </p>

                            {product.barcode && (
                                <p className="text-xs solaris-muted">
                                    {t('products.table.barcode')}: {product.barcode}
                                </p>
                            )}
                        </div>

                        {product.lowStock && (
                            <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400">
                                {t('nova.productsResult.lowStockBadge')}
                            </span>
                        )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs solaris-muted">
                        <span>
                            {product.categoryName ?? '—'}
                        </span>
                        <span className="text-right font-semibold text-slate-700 dark:text-slate-200">
                            ${product.price?.toFixed(2) ?? '0.00'}
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-3">
                        <Link
                            to={`/products/${product.id}/view`}
                            className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                        >
                            {t('nova.productsResult.viewProduct')}
                        </Link>

                        <Link
                            to={`/products/${product.id}/edit`}
                            className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                        >
                            {t('nova.productsResult.editProduct')}
                        </Link>
                    </div>
                </div>
            ))}

            {showRestock && (
                <Link
                    to={restockLink}
                    className="inline-flex rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
                >
                    {t('nova.productsResult.restock')}
                </Link>
            )}
        </div>
    )
}
