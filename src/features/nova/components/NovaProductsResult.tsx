interface NovaProduct {
    id: number
    name: string
    sku?: string
    price?: number
    stockQuantity?: number
    categoryName?: string
    lowStock?: boolean
}

interface NovaProductsResultProps {
    products: NovaProduct[]
}

export function NovaProductsResult({ products }: NovaProductsResultProps) {
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

                            {product.sku && (
                                <p className="text-xs solaris-muted">
                                    SKU: {product.sku}
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
                        <span>Precio: ${product.price ?? '-'}</span>
                        <span>Stock: {product.stockQuantity ?? '-'}</span>
                        <span>Categoría: {product.categoryName ?? '-'}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}