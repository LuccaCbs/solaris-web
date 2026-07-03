import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getProductByBarcode } from '../api/productService'
import { createStockMovement } from '../api/stockMovementService'
import { useBarcodeScanner } from '../hooks/useBarcodeScanner'
import { BarcodeScanInput } from '../components/barcode/BarcodeScanInput'
import type { Product } from '../types/product'

function QuickRestockPage() {
    const { t } = useTranslation()
    const quantityRef = useRef<HTMLInputElement>(null)

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [quantity, setQuantity] = useState('1')
    const [reason, setReason] = useState('')
    const [saving, setSaving] = useState(false)

    const handleBarcodeScan = useCallback(
        async (code: string) => {
            try {
                const product = await getProductByBarcode(code)

                if (product.active === false) {
                    toast.error(t('barcode.scan.inactiveProduct'))
                    return
                }

                setSelectedProduct(product)
                toast.success(t('barcode.scan.found', { name: product.name }))

                window.requestAnimationFrame(() => {
                    quantityRef.current?.focus()
                    quantityRef.current?.select()
                })
            } catch {
                toast.error(t('barcode.scan.notFound'))
            }
        },
        [t],
    )

    useBarcodeScanner({ onScan: handleBarcodeScan })

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        if (!selectedProduct) {
            toast.error(t('quickRestock.noProductSelected'))
            return
        }

        const parsedQuantity = Number(quantity)

        if (parsedQuantity <= 0) {
            toast.error(t('restockProduct.invalidQuantity'))
            return
        }

        setSaving(true)

        try {
            const movement = await createStockMovement({
                productId: selectedProduct.id,
                type: 'IN',
                quantity: parsedQuantity,
                reason: reason.trim() || t('restockProduct.defaultReason'),
            })

            toast.success(
                t('quickRestock.success', {
                    name: selectedProduct.name,
                    quantity: parsedQuantity,
                }),
            )

            setSelectedProduct(null)
            setQuantity('1')
        } catch {
            toast.error(t('restockProduct.error'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">{t('quickRestock.title')}</h1>

            <p className="mt-2 solaris-muted">{t('quickRestock.description')}</p>

            <div className="mt-4 rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 px-4 py-3 text-sm text-blue-700 dark:text-blue-200">
                {t('barcode.scan.readyRestock')}
            </div>

            <div className="mt-4 max-w-md">
                <BarcodeScanInput onScan={handleBarcodeScan} />
            </div>

            <form onSubmit={handleSubmit} className="solaris-panel mt-8 max-w-2xl">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                    {selectedProduct ? (
                        <>
                            <p className="text-sm solaris-muted">{t('common.product')}</p>

                            <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                                {selectedProduct.name}
                            </p>

                            <p className="mt-2 text-sm solaris-muted">
                                {t('productForm.barcode')}: {selectedProduct.barcode}
                            </p>

                            <p className="mt-1 text-sm solaris-muted">
                                {t('common.stock')}: {selectedProduct.stockQuantity}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm solaris-muted">{t('quickRestock.emptySelection')}</p>
                    )}
                </div>

                <div className="mt-6">
                    <label className="text-sm solaris-muted">
                        {t('restockProduct.quantity')}
                    </label>

                    <input
                        ref={quantityRef}
                        required
                        min={1}
                        type="number"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        className="solaris-input mt-2 w-full"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm solaris-muted">{t('restockProduct.reason')}</label>

                    <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder={t('restockProduct.reasonPlaceholder')}
                        className="solaris-input mt-2 min-h-28 w-full resize-none"
                    />
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={saving || !selectedProduct}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                        {saving ? t('common.saving') : t('restockProduct.confirm')}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default QuickRestockPage
