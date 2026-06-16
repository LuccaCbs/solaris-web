import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import LoadingScreen from '../components/LoadingScreen'
import { getProductById } from '../api/productService'
import { createStockMovement } from '../api/stockMovementService'
import type { Product } from '../types/product'

function RestockProductPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [product, setProduct] = useState<Product | null>(null)
    const [quantity, setQuantity] = useState('1')
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function loadProduct() {
            if (!id) return

            try {
                const data = await getProductById(Number(id))
                setProduct(data)
            } catch {
                toast.error(t('restockProduct.loadError'))
                navigate('/products')
            } finally {
                setLoading(false)
            }
        }

        loadProduct()
    }, [id, navigate, t])

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        if (!id) return

        const parsedQuantity = Number(quantity)

        if (parsedQuantity <= 0) {
            toast.error(t('restockProduct.invalidQuantity'))
            return
        }

        setSaving(true)

        try {
            await createStockMovement({
                productId: Number(id),
                type: 'IN',
                quantity: parsedQuantity,
                reason: reason.trim() || t('restockProduct.defaultReason'),
            })

            toast.success(t('restockProduct.success'))
            navigate('/products')
        } catch {
            toast.error(t('restockProduct.error'))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <LoadingScreen />
    }

    if (!product) {
        return null
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">
                {t('restockProduct.title')}
            </h1>

            <p className="mt-2 solaris-muted">
                {t('restockProduct.description')}
            </p>

            <form
                onSubmit={handleSubmit}
                className="solaris-panel mt-8 max-w-2xl"
            >
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                    <p className="text-sm solaris-muted">
                        {t('common.product')}
                    </p>

                    <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                        {product.name}
                    </p>

                    <p className="mt-2 text-sm solaris-muted">
                        {t('common.stock')}: {product.stockQuantity}
                    </p>
                </div>

                <div className="mt-6">
                    <label className="text-sm solaris-muted">
                        {t('restockProduct.quantity')}
                    </label>

                    <input
                        required
                        min={1}
                        type="number"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        className="solaris-input mt-2 w-full"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm solaris-muted">
                        {t('restockProduct.reason')}
                    </label>

                    <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder={t('restockProduct.reasonPlaceholder')}
                        className="solaris-input mt-2 min-h-28 w-full resize-none"
                    />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        disabled={saving}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                        {saving
                            ? t('common.saving')
                            : t('restockProduct.confirm')}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default RestockProductPage