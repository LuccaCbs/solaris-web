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
}

export function NovaProductsResult({ products }: NovaProductsResultProps) {
    const { t } = useTranslation()

    if (products.length === 0) {
        return null
    }

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
                                Bajo stock
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
                </div>
            ))}
        </div>
    )
}
