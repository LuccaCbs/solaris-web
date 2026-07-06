import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { getProductByBarcode, getProductById, getProducts } from '../api/productService'
import { createBulkStockMovements } from '../api/stockMovementService'
import { useBarcodeScanner } from '../hooks/useBarcodeScanner'
import { BarcodeScanInput } from '../components/barcode/BarcodeScanInput'
import type { Product } from '../types/product'
import {
    addProductToRestockList,
    type RestockLineItem,
} from '../features/stock/utils/addProductToRestockList'

function QuickRestockPage() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const preloadedRef = useRef(false)

    const [products, setProducts] = useState<Product[]>([])
    const [productSearch, setProductSearch] = useState('')
    const [items, setItems] = useState<RestockLineItem[]>([])
    const [reason, setReason] = useState('')
    const [saving, setSaving] = useState(false)

    const addProduct = useCallback((product: RestockLineItem['product']) => {
        setItems((current) => addProductToRestockList(current, product))
    }, [])

    const handleBarcodeScan = useCallback(
        async (code: string) => {
            try {
                const product = await getProductByBarcode(code)

                if (product.active === false) {
                    toast.error(t('barcode.scan.inactiveProduct'))
                    return
                }

                addProduct(product)
                toast.success(t('barcode.scan.addedToRestock', { name: product.name }))
            } catch {
                toast.error(t('barcode.scan.notFound'))
            }
        },
        [addProduct, t],
    )

    useBarcodeScanner({ onScan: handleBarcodeScan })

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await getProducts()
                setProducts(data.filter((product) => product.active !== false))
            } catch {
                toast.error(t('supplierOrderForm.loadError'))
            }
        }

        void loadProducts()
    }, [t])

    useEffect(() => {
        const productId = searchParams.get('productId')

        if (!productId || preloadedRef.current) {
            return
        }

        preloadedRef.current = true

        async function preloadProduct() {
            try {
                const product = await getProductById(Number(productId))

                if (product.active === false) {
                    toast.error(t('barcode.scan.inactiveProduct'))
                    return
                }

                addProduct(product)
                toast.success(t('quickRestock.preloaded', { name: product.name }))
            } catch {
                toast.error(t('restockProduct.loadError'))
            } finally {
                setSearchParams({}, { replace: true })
            }
        }

        void preloadProduct()
    }, [addProduct, searchParams, setSearchParams, t])

    const filteredProducts = products.filter((product) => {
        const search = productSearch.toLowerCase()

        return [product.name, product.barcode, product.categoryName]
            .join(' ')
            .toLowerCase()
            .includes(search)
    })

    function selectProduct(product: Product) {
        if (product.active === false) {
            toast.error(t('barcode.scan.inactiveProduct'))
            return
        }

        addProduct(product)
        setProductSearch('')
        toast.success(t('barcode.scan.addedToRestock', { name: product.name }))
    }

    function updateItemQuantity(productId: number, quantity: string) {
        setItems((current) =>
            current.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item,
            ),
        )
    }

    function removeItem(productId: number) {
        setItems((current) =>
            current.filter((item) => item.product.id !== productId),
        )
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        if (items.length === 0) {
            toast.error(t('quickRestock.emptyList'))
            return
        }

        const invalidItem = items.find((item) => Number(item.quantity) <= 0)

        if (invalidItem) {
            toast.error(t('restockProduct.invalidQuantity'))
            return
        }

        setSaving(true)

        const movementReason = reason.trim() || t('restockProduct.defaultReason')

        try {
            const movements = await createBulkStockMovements({
                reason: movementReason,
                items: items.map((item) => ({
                    productId: item.product.id,
                    quantity: Number(item.quantity),
                })),
            })

            toast.success(
                t('quickRestock.successBatch', { count: movements.length }),
            )
            setItems([])
            setReason('')
        } catch {
            toast.error(t('restockProduct.error'))
        } finally {
            setSaving(false)
        }
    }

    const totalUnits = items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
    )

    return (
        <div>
            <h1 className="text-4xl font-bold">{t('quickRestock.title')}</h1>

            <p className="mt-2 solaris-muted">{t('quickRestock.description')}</p>

            <div className="mt-4 rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 px-4 py-3 text-sm text-blue-700 dark:text-blue-200">
                {t('barcode.scan.readyRestock')}
            </div>

            <div className="mt-4 grid max-w-3xl gap-4 md:grid-cols-2">
                <BarcodeScanInput onScan={handleBarcodeScan} />

                <div className="relative">
                    <label className="text-sm solaris-muted">
                        {t('saleForm.product')}
                    </label>

                    <input
                        value={productSearch}
                        onChange={(event) => setProductSearch(event.target.value)}
                        placeholder={t('saleForm.searchProductPlaceholder')}
                        className="solaris-input mt-2 w-full"
                    />

                    {productSearch && (
                        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                            {filteredProducts.slice(0, 8).map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => selectProduct(product)}
                                    className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                                >
                                    <div>
                                        <p className="font-medium text-slate-950 dark:text-white">
                                            {product.name}
                                        </p>

                                        <p className="text-sm solaris-muted">
                                            {product.barcode} · {product.categoryName}
                                        </p>
                                    </div>

                                    <p className="text-xs solaris-subtle">
                                        {t('saleForm.stock')}: {product.stockQuantity}
                                    </p>
                                </button>
                            ))}

                            {filteredProducts.length === 0 && (
                                <div className="px-4 py-3 text-sm solaris-muted">
                                    {t('saleForm.noProductsFound')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="solaris-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-[760px] w-full">
                            <thead className="bg-slate-100 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm text-slate-700 dark:text-slate-300">
                                        {t('quickRestock.table.product')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm text-slate-700 dark:text-slate-300">
                                        {t('productForm.barcode')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm text-slate-700 dark:text-slate-300">
                                        {t('quickRestock.table.currentStock')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm text-slate-700 dark:text-slate-300">
                                        {t('quickRestock.table.quantity')}
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm text-slate-700 dark:text-slate-300">
                                        {t('common.actions')}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map(({ product, quantity }) => (
                                    <tr
                                        key={product.id}
                                        className="border-t border-slate-200 dark:border-slate-800"
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                                            {product.name}
                                        </td>

                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                            {product.barcode}
                                        </td>

                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                            {product.stockQuantity}
                                        </td>

                                        <td className="px-6 py-4">
                                            <input
                                                required
                                                min={1}
                                                type="number"
                                                value={quantity}
                                                onChange={(event) =>
                                                    updateItemQuantity(
                                                        product.id,
                                                        event.target.value,
                                                    )
                                                }
                                                className="solaris-input w-24"
                                            />
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(product.id)}
                                                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10"
                                            >
                                                <Trash2 size={16} />
                                                {t('quickRestock.remove')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {items.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-10 text-center solaris-muted"
                                        >
                                            {t('quickRestock.emptyList')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {items.length > 0 && (
                    <p className="text-sm solaris-muted">
                        {t('quickRestock.summary', {
                            products: items.length,
                            units: totalUnits,
                        })}
                    </p>
                )}

                <div className="solaris-panel max-w-2xl">
                    <label className="text-sm solaris-muted">
                        {t('restockProduct.reason')}
                    </label>

                    <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder={t('restockProduct.reasonPlaceholder')}
                        className="solaris-input mt-2 min-h-28 w-full resize-none"
                    />

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="submit"
                            disabled={saving || items.length === 0}
                            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                        >
                            {saving
                                ? t('common.saving')
                                : t('quickRestock.confirmAll')}
                        </button>

                        <button
                            type="button"
                            disabled={saving || items.length === 0}
                            onClick={() => {
                                setItems([])
                                setReason('')
                            }}
                            className="rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {t('quickRestock.clearAll')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default QuickRestockPage
