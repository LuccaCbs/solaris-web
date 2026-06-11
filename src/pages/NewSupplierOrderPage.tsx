import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { createSupplierOrder } from '../api/supplierOrderService'
import { getSuppliers } from '../api/supplierService'
import { getProducts } from '../api/productService'
import type { Supplier } from '../types/supplier'
import type { Product } from '../types/product'
import LoadingScreen from '../components/LoadingScreen'

type OrderItemForm = {
    productId: string
    productSearch: string
    quantity: string
}

function NewSupplierOrderPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [supplierId, setSupplierId] = useState('')
    const [supplierSearch, setSupplierSearch] = useState('')
    const [items, setItems] = useState<OrderItemForm[]>([
        { productId: '', productSearch: '', quantity: '1' },
    ])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                const [suppliersData, productsData] = await Promise.all([
                    getSuppliers(),
                    getProducts(),
                ])

                setSuppliers(suppliersData.filter((supplier) => supplier.active))
                setProducts(productsData)
            } catch {
                toast.error(t('supplierOrderForm.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [t])

    const selectedSupplier = useMemo(() => {
        return suppliers.find((supplier) => supplier.id === Number(supplierId))
    }, [suppliers, supplierId])

    const filteredSuppliers = useMemo(() => {
        const normalizedSearch = supplierSearch.toLowerCase().trim()

        if (!normalizedSearch || selectedSupplier) return []

        return suppliers
            .filter((supplier) => {
                return (
                    supplier.name.toLowerCase().includes(normalizedSearch) ||
                    supplier.contactName?.toLowerCase().includes(normalizedSearch) ||
                    supplier.phone?.toLowerCase().includes(normalizedSearch)
                )
            })
            .slice(0, 8)
    }, [suppliers, supplierSearch, selectedSupplier])

    const messagePreview = useMemo(() => {
        if (!selectedSupplier) {
            return ''
        }

        const supplierName = selectedSupplier.contactName || selectedSupplier.name

        const selectedItems = items
            .map((item) => {
                const product = products.find(
                    (currentProduct) => currentProduct.id === Number(item.productId)
                )

                if (!product || !item.quantity) return null

                return {
                    productName: product.name,
                    quantity: item.quantity,
                }
            })
            .filter(Boolean) as { productName: string; quantity: string }[]

        if (selectedItems.length === 0) {
            return t('supplierOrderForm.messagePreview.greeting', { supplierName })
        }

        return [
            t('supplierOrderForm.messagePreview.greeting', { supplierName }),
            ...selectedItems.map((item) =>
                t('supplierOrderForm.messagePreview.itemLine', {
                    productName: item.productName,
                    quantity: item.quantity,
                })
            ),
        ].join('\n')
    }, [selectedSupplier, items, products, t])

    function selectSupplier(supplier: Supplier) {
        setSupplierId(String(supplier.id))
        setSupplierSearch(
            supplier.contactName
                ? `${supplier.name} · ${supplier.contactName}`
                : supplier.name
        )
    }

    function clearSupplier() {
        setSupplierId('')
        setSupplierSearch('')
    }

    function getFilteredProducts(productSearch: string, productId: string) {
        const normalizedSearch = productSearch.toLowerCase().trim()

        if (!normalizedSearch || productId) return []

        return products
            .filter((product) => {
                return (
                    product.name.toLowerCase().includes(normalizedSearch) ||
                    product.sku.toLowerCase().includes(normalizedSearch)
                )
            })
            .slice(0, 8)
    }

    function updateItem(index: number, field: keyof OrderItemForm, value: string) {
        setItems((currentItems) =>
            currentItems.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item
            )
        )
    }

    function selectProduct(index: number, product: Product) {
        setItems((currentItems) =>
            currentItems.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        productId: String(product.id),
                        productSearch: `${product.name} · ${product.sku}`,
                    }
                    : item
            )
        )
    }

    function clearProduct(index: number) {
        setItems((currentItems) =>
            currentItems.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        productId: '',
                        productSearch: '',
                    }
                    : item
            )
        )
    }

    function addItem() {
        setItems((currentItems) => [
            ...currentItems,
            { productId: '', productSearch: '', quantity: '1' },
        ])
    }

    function removeItem(index: number) {
        setItems((currentItems) =>
            currentItems.filter((_, itemIndex) => itemIndex !== index)
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

        if (!supplierId) {
            toast.error(t('supplierOrderForm.errors.selectSupplier'))
            return
        }

        if (validItems.length === 0) {
            toast.error(t('supplierOrderForm.errors.addAtLeastOneProduct'))
            return
        }

        setSaving(true)

        try {
            await createSupplierOrder({
                supplierId: Number(supplierId),
                items: validItems,
            })

            toast.success(t('supplierOrderForm.createSuccess'))
            navigate('/supplier-orders')
        } catch {
            toast.error(t('supplierOrderForm.createError'))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">
                {t('supplierOrderForm.title')}
            </h1>

            <p className="mt-2 solaris-muted">
                {t('supplierOrderForm.description')}
            </p>

            <form
                onSubmit={handleSubmit}
                className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]"
            >
                <div className="solaris-panel">
                    <h2 className="text-xl font-semibold">
                        {t('supplierOrderForm.orderDetails')}
                    </h2>

                    <div className="mt-6">
                        <label className="text-sm solaris-muted">
                            {t('supplierOrderForm.supplier')}
                        </label>

                        <div className="relative mt-2">
                            <input
                                required
                                value={supplierSearch}
                                onChange={(event) => {
                                    setSupplierSearch(event.target.value)
                                    setSupplierId('')
                                }}
                                placeholder={t('supplierOrderForm.searchSupplierPlaceholder')}
                                className="solaris-input w-full"
                            />

                            {supplierId && (
                                <button
                                    type="button"
                                    onClick={clearSupplier}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    {t('common.clear')}
                                </button>
                            )}

                            {filteredSuppliers.length > 0 && (
                                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                                    {filteredSuppliers.map((supplier) => (
                                        <button
                                            key={supplier.id}
                                            type="button"
                                            onClick={() => selectSupplier(supplier)}
                                            className="block w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            <p className="font-medium text-slate-950 dark:text-white">
                                                {supplier.name}
                                            </p>

                                            <p className="text-sm solaris-muted">
                                                {supplier.contactName || t('suppliers.noContactName')}
                                                {supplier.phone ? ` · ${supplier.phone}` : ''}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="font-semibold">
                                {t('supplierOrderForm.products')}
                            </h3>

                            <button
                                type="button"
                                onClick={addItem}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                {t('supplierOrderForm.addProduct')}
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            {items.map((item, index) => {
                                const filteredProducts = getFilteredProducts(
                                    item.productSearch,
                                    item.productId
                                )

                                return (
                                    <div
                                        key={index}
                                        className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[1fr_140px_auto]"
                                    >
                                        <div>
                                            <label className="text-sm solaris-muted">
                                                {t('supplierOrderForm.product')}
                                            </label>

                                            <div className="relative mt-2">
                                                <input
                                                    required
                                                    value={item.productSearch}
                                                    onChange={(event) => {
                                                        updateItem(index, 'productSearch', event.target.value)
                                                        updateItem(index, 'productId', '')
                                                    }}
                                                    placeholder={t('supplierOrderForm.searchProductPlaceholder')}
                                                    className="solaris-input w-full"
                                                />

                                                {item.productId && (
                                                    <button
                                                        type="button"
                                                        onClick={() => clearProduct(index)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                                    >
                                                        {t('common.clear')}
                                                    </button>
                                                )}

                                                {filteredProducts.length > 0 && (
                                                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                                                        {filteredProducts.map((product) => (
                                                            <button
                                                                key={product.id}
                                                                type="button"
                                                                onClick={() => selectProduct(index, product)}
                                                                className="block w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            >
                                                                <p className="font-medium text-slate-950 dark:text-white">
                                                                    {product.name}
                                                                </p>

                                                                <p className="text-sm solaris-muted">
                                                                    {t('supplierOrderForm.productMeta', {
                                                                        sku: product.sku,
                                                                        stock: product.stockQuantity,
                                                                    })}
                                                                </p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm solaris-muted">
                                                {t('supplierOrderForm.quantity')}
                                            </label>

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

                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                disabled={items.length === 1}
                                                onClick={() => removeItem(index)}
                                                className="w-full rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {t('common.delete')}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                            disabled={saving}
                            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                        >
                            {saving
                                ? t('common.saving')
                                : t('supplierOrderForm.createOrder')}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/supplier-orders')}
                            className="rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>

                <aside className="solaris-panel h-fit">
                    <h2 className="text-xl font-semibold">
                        {t('supplierOrderForm.messagePreview.title')}
                    </h2>

                    <p className="mt-2 solaris-muted">
                        {t('supplierOrderForm.messagePreview.description')}
                    </p>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        {messagePreview ? (
                            <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
                                {messagePreview}
                            </p>
                        ) : (
                            <p className="text-sm solaris-muted">
                                {t('supplierOrderForm.messagePreview.empty')}
                            </p>
                        )}
                    </div>
                </aside>
            </form>
        </div>
    )
}

export default NewSupplierOrderPage