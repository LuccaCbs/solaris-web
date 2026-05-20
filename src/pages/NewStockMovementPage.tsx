import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createStockMovement } from '../api/stockMovementService'
import { getProducts } from '../api/productService'
import type { Product } from '../types/product'
import type { StockMovement } from '../types/stockMovement'

type StockMovementType = StockMovement['type']

type FormState = {
    productId: string
    type: StockMovementType
    quantity: string
    reason: string
}

const initialFormState: FormState = {
    productId: '',
    type: 'IN',
    quantity: '',
    reason: '',
}

function NewStockMovementPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const isProductLocked = Boolean(searchParams.get('productId'))

    const [products, setProducts] = useState<Product[]>([])
    const [form, setForm] = useState<FormState>(() => {
        const productId = searchParams.get('productId')
        const type = searchParams.get('type')

        return {
            ...initialFormState,
            productId: productId ?? '',
            type:
                type === 'IN' || type === 'OUT' || type === 'ADJUSTMENT'
                    ? type
                    : 'IN',
        }
    })
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadProducts() {
            const data = await getProducts()
            setProducts(data)
        }

        loadProducts()
    }, [])



    function updateForm<K extends keyof FormState>(field: K, value: FormState[K]) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }))
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        setCreating(true)
        setError('')

        try {
            await createStockMovement({
                productId: Number(form.productId),
                type: form.type,
                quantity: Number(form.quantity),
                reason: form.reason,
            })

            navigate('/stock-movements')
        } catch {
            setError('Could not create stock movement. Check stock availability and form data.')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">New Stock Movement</h1>

            <p className="mt-2 text-slate-400">
                Register inventory entries, exits or manual adjustments.
            </p>

            <form
                onSubmit={handleSubmit}
                className="mt-8 max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-sm text-slate-400">Product</label>

                        <select
                            required
                            disabled={isProductLocked}
                            value={form.productId}
                            onChange={(event) => updateForm('productId', event.target.value)}
                            className={`mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500 ${
                                isProductLocked
                                    ? 'cursor-not-allowed opacity-60'
                                    : ''
                            }`}
                        >
                            <option value="">Select product</option>

                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} — Stock: {product.stockQuantity}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-slate-400">Movement Type</label>

                        <select
                            value={form.type}
                            onChange={(event) =>
                                updateForm('type', event.target.value as StockMovementType)
                            }
                            className={`mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500 ${
                                isProductLocked
                                    ? 'cursor-not-allowed opacity-60'
                                    : ''
                            }`}
                        >
                            <option value="IN">IN — Add stock</option>
                            <option value="OUT">OUT — Remove stock</option>
                            <option value="ADJUSTMENT">ADJUSTMENT — Set stock value</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-slate-400">Quantity</label>

                        <input
                            required
                            min={1}
                            type="number"
                            value={form.quantity}
                            onChange={(event) => updateForm('quantity', event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-400">Reason</label>

                        <input
                            required
                            value={form.reason}
                            onChange={(event) => updateForm('reason', event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                <div className="mt-6 flex gap-3">
                    <button
                        disabled={creating}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
                    >
                        {creating ? 'Creating...' : 'Create Movement'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default NewStockMovementPage