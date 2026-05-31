import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProducts } from '../api/productService'
import { createSale } from '../api/salesService'
import type { Product } from '../types/product'
import type { PaymentMethod } from '../types/sales'
import { getCurrentCashRegister } from '../api/cashRegisterService'

type SaleFormItem = {
    productId: string
    productSearch: string
    quantity: string
}

function NewSalePage() {
    const navigate = useNavigate()

    const [products, setProducts] = useState<Product[]>([])
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
    const [items, setItems] = useState<SaleFormItem[]>([
        { productId: '', productSearch: '', quantity: '1' },
    ])
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                await getCurrentCashRegister()

                const data = await getProducts()
                setProducts(data)
            } catch {
                toast.error('Open cash register before creating sales')
                navigate('/sales')
            }
        }

        loadData()
    }, [navigate])

    const totalAmount = useMemo(() => {
        return items.reduce((total, item) => {
            const product = products.find((current) => current.id === Number(item.productId))
            const quantity = Number(item.quantity)

            if (!product || !quantity) return total

            return total + product.price * quantity
        }, 0)
    }, [items, products])

    const selectedProductIds = items
        .map((item) => item.productId)
        .filter(Boolean)

    const hasDuplicateProducts =
        new Set(selectedProductIds).size !== selectedProductIds.length

    const hasStockErrors = items.some((item) => {
        const product = products.find((current) => current.id === Number(item.productId))

        if (!product) return false

        return Number(item.quantity) > product.stockQuantity
    })

    const hasInvalidItems = items.some((item) => {
        return !item.productId || Number(item.quantity) <= 0
    })

    const hasFormErrors = hasDuplicateProducts || hasStockErrors || hasInvalidItems

    function updateItem(index: number, field: keyof SaleFormItem, value: string) {
        setItems((current) =>
            current.map((item, currentIndex) =>
                currentIndex === index ? { ...item, [field]: value } : item
            )
        )
    }

    function addItem() {
        setItems((current) => [
            ...current,
            { productId: '', productSearch: '', quantity: '1' },
        ])
    }

    function removeItem(index: number) {
        setItems((current) => current.filter((_, currentIndex) => currentIndex !== index))
    }

    function selectProduct(index: number, product: Product) {
        setItems((current) =>
            current.map((item, currentIndex) =>
                currentIndex === index
                    ? {
                        ...item,
                        productId: String(product.id),
                        productSearch: product.name,
                    }
                    : item
            )
        )
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        const validItems = items
            .filter((item) => item.productId && Number(item.quantity) > 0)
            .map((item) => ({
                productId: Number(item.productId),
                quantity: Number(item.quantity),
            }))

        if (validItems.length === 0) {
            toast.error('Add at least one product')
            return
        }

        if (hasDuplicateProducts) {
            toast.error('A product cannot be added more than once')
            return
        }

        if (hasStockErrors) {
            toast.error('One or more products exceed available stock')
            return
        }

        if (hasInvalidItems) {
            toast.error('Complete all product lines before creating the sale')
            return
        }

        setCreating(true)

        try {
            await createSale({
                paymentMethod,
                items: validItems,
            })

            toast.success('Sale created successfully')
            navigate('/sales')
        } catch (error: unknown) {
            const axiosError = error as {
                response?: {
                    data?: {
                        message?: string
                        error?: string
                    }
                }
            }

            const message =
                axiosError.response?.data?.message ||
                axiosError.response?.data?.error ||
                ''

            if (message.includes('There is no open cash register session')) {
                toast.error('There is no open cash register session')
                navigate('/sales')
                return
            }

            if (message.toLowerCase().includes('stock')) {
                toast.error('One or more products exceed available stock')
                return
            }

            toast.error('Could not create sale')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">New Sale</h1>

            <p className="mt-2 solaris-muted">
                Register a new sale and automatically update inventory stock.
            </p>

            <form
                onSubmit={handleSubmit}
                className="mt-8 max-w-5xl space-y-6"
            >
                <div className="solaris-panel">
                    <h2 className="text-xl font-semibold">Sale Details</h2>

                    <div className="mt-6 max-w-sm">
                        <label className="text-sm solaris-muted">Payment Method</label>

                        <select
                            value={paymentMethod}
                            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                            className="solaris-input mt-2 w-full"
                        >
                            <option value="CASH">Cash</option>
                            <option value="DEBIT_CARD">Debit Card</option>
                            <option value="CREDIT_CARD">Credit Card</option>
                            <option value="TRANSFER">Transfer</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </div>

                <div className="solaris-panel">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Products</h2>

                        <button
                            type="button"
                            onClick={addItem}
                            className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-500/20 dark:text-blue-300"
                        >
                            Add Product
                        </button>
                    </div>

                    <div className="mt-6 space-y-4">
                        {items.map((item, index) => {
                            const selectedProduct = products.find(
                                (product) => product.id === Number(item.productId)
                            )

                            const subtotal = selectedProduct
                                ? selectedProduct.price * Number(item.quantity || 0)
                                : 0

                            const exceedsStock = selectedProduct
                                ? Number(item.quantity) > selectedProduct.stockQuantity
                                : false

                            const isDuplicated =
                                item.productId &&
                                items.filter((current) => current.productId === item.productId).length > 1

                            return (
                                <div
                                    key={index}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <div className="relative md:col-span-2">
                                            <label className="text-sm solaris-muted">Product</label>

                                            <input
                                                required
                                                value={item.productSearch}
                                                onChange={(event) => {
                                                    updateItem(index, 'productSearch', event.target.value)
                                                    updateItem(index, 'productId', '')
                                                }}
                                                placeholder="Search product by name, SKU or category..."
                                                className="solaris-input mt-2 w-full"
                                            />

                                            {item.productSearch && !item.productId && (
                                                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                                                    {products
                                                        .filter((product) => {
                                                            const search = item.productSearch.toLowerCase()

                                                            return [
                                                                product.name,
                                                                product.sku,
                                                                product.categoryName,
                                                            ]
                                                                .join(' ')
                                                                .toLowerCase()
                                                                .includes(search)
                                                        })
                                                        .slice(0, 8)
                                                        .map((product) => (
                                                            <button
                                                                key={product.id}
                                                                type="button"
                                                                onClick={() => selectProduct(index, product)}
                                                                className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-slate-950 dark:text-white">
                                                                        {product.name}
                                                                    </p>

                                                                    <p className="text-sm solaris-muted">
                                                                        {product.sku} · {product.categoryName}
                                                                    </p>
                                                                </div>

                                                                <div className="text-right">
                                                                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                                                        ${product.price}
                                                                    </p>

                                                                    <p className="text-xs solaris-subtle">
                                                                        Stock: {product.stockQuantity}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        ))}

                                                    {products.filter((product) => {
                                                        const search = item.productSearch.toLowerCase()

                                                        return [
                                                            product.name,
                                                            product.sku,
                                                            product.categoryName,
                                                        ]
                                                            .join(' ')
                                                            .toLowerCase()
                                                            .includes(search)
                                                    }).length === 0 && (
                                                        <div className="px-4 py-3 text-sm solaris-muted">
                                                            No products found.
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {item.productId && selectedProduct && (
                                                <p className="mt-2 text-sm text-green-500 dark:text-green-300">
                                                    Selected: {selectedProduct.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-sm solaris-muted">Quantity</label>

                                            <input
                                                required
                                                min={1}
                                                type="number"
                                                value={item.quantity}
                                                onChange={(event) =>
                                                    updateItem(index, 'quantity', event.target.value)
                                                }
                                                className="solaris-input mt-2 w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm solaris-muted">Subtotal</label>

                                            <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold dark:border-slate-700 dark:bg-slate-900">
                                                ${subtotal.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm solaris-muted">
                                                {selectedProduct
                                                    ? `Unit price: $${selectedProduct.price} · Available stock: ${selectedProduct.stockQuantity}`
                                                    : 'Select a product to calculate subtotal.'}
                                            </p>

                                            {exceedsStock && (
                                                <p className="mt-1 text-sm text-red-400">
                                                    Quantity exceeds available stock.
                                                </p>
                                            )}

                                            {isDuplicated && (
                                                <p className="mt-1 text-sm text-red-400">
                                                    This product is already added in another line.
                                                </p>
                                            )}
                                        </div>

                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="solaris-panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm solaris-muted">Total Amount</p>
                        <p className="mt-2 text-4xl font-bold">
                            ${totalAmount.toFixed(2)}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => navigate('/sales')}
                            className="w-full rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={creating || hasFormErrors}
                            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                            {creating ? 'Creating...' : 'Create Sale'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default NewSalePage