import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getProducts, getProductByBarcode } from '../api/productService'
import { createSale } from '../api/salesService'
import type { Product } from '../types/product'
import type { PaymentMethod, SaleItemType } from '../types/sales'
import { getCurrentCashRegister } from '../api/cashRegisterService'
import { useBarcodeScanner } from '../hooks/useBarcodeScanner'

type SaleFormItem = {
    type: SaleItemType
    productId: string
    productSearch: string
    customName: string
    quantity: string
    unitLabel: string
    unitPrice: string
}

const emptyProductItem: SaleFormItem = {
    type: 'PRODUCT',
    productId: '',
    productSearch: '',
    customName: '',
    quantity: '1',
    unitLabel: '',
    unitPrice: '',
}

const emptyCustomItem: SaleFormItem = {
    type: 'CUSTOM',
    productId: '',
    productSearch: '',
    customName: '',
    quantity: '1',
    unitLabel: 'unit',
    unitPrice: '',
}

function NewSalePage() {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [products, setProducts] = useState<Product[]>([])
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
    const [items, setItems] = useState<SaleFormItem[]>([emptyProductItem])
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                await getCurrentCashRegister()

                const data = await getProducts()
                setProducts(data)
            } catch {
                toast.error(t('saleForm.openRegisterBeforeSale'))
                navigate('/sales')
            }
        }

        loadData()
    }, [navigate, t])

    const totalAmount = useMemo(() => {
        return items.reduce((total, item) => {
            const quantity = Number(item.quantity)

            if (!quantity) return total

            if (item.type === 'PRODUCT') {
                const product = products.find((current) => current.id === Number(item.productId))

                if (!product) return total

                return total + product.price * quantity
            }

            return total + Number(item.unitPrice || 0) * quantity
        }, 0)
    }, [items, products])

    const selectedProductIds = items
        .filter((item) => item.type === 'PRODUCT')
        .map((item) => item.productId)
        .filter(Boolean)

    const hasDuplicateProducts =
        new Set(selectedProductIds).size !== selectedProductIds.length

    const hasStockErrors = items.some((item) => {
        if (item.type !== 'PRODUCT') return false

        const product = products.find((current) => current.id === Number(item.productId))

        if (!product) return false

        return Number(item.quantity) > product.stockQuantity
    })

    const hasInvalidItems = items.some((item) => {
        if (Number(item.quantity) <= 0) return true

        if (item.type === 'PRODUCT') {
            return !item.productId
        }

        return !item.customName.trim() || Number(item.unitPrice) < 0 || item.unitPrice === ''
    })

    const hasFormErrors = hasDuplicateProducts || hasStockErrors || hasInvalidItems

    function updateItem(index: number, field: keyof SaleFormItem, value: string) {
        setItems((current) =>
            current.map((item, currentIndex) =>
                currentIndex === index ? { ...item, [field]: value } : item
            )
        )
    }

    function changeItemType(index: number, type: SaleItemType) {
        setItems((current) =>
            current.map((item, currentIndex) => {
                if (currentIndex !== index) return item

                return type === 'PRODUCT'
                    ? { ...emptyProductItem, quantity: item.quantity || '1' }
                    : { ...emptyCustomItem, quantity: item.quantity || '1' }
            })
        )
    }

    function addProductItem() {
        setItems((current) => [...current, { ...emptyProductItem }])
    }

    function addCustomItem() {
        setItems((current) => [...current, { ...emptyCustomItem }])
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

    function addScannedProduct(product: Product) {
        setItems((current) => {
            const existingIndex = current.findIndex(
                (item) =>
                    item.type === 'PRODUCT' &&
                    item.productId === String(product.id),
            )

            if (existingIndex >= 0) {
                return current.map((item, index) =>
                    index === existingIndex
                        ? {
                            ...item,
                            quantity: String(Number(item.quantity) + 1),
                        }
                        : item,
                )
            }

            const emptyIndex = current.findIndex(
                (item) => item.type === 'PRODUCT' && !item.productId,
            )

            if (emptyIndex >= 0) {
                return current.map((item, index) =>
                    index === emptyIndex
                        ? {
                            ...item,
                            productId: String(product.id),
                            productSearch: product.name,
                            quantity: '1',
                        }
                        : item,
                )
            }

            return [
                ...current,
                {
                    ...emptyProductItem,
                    productId: String(product.id),
                    productSearch: product.name,
                },
            ]
        })
    }

    async function handleBarcodeScan(code: string) {
        try {
            const product =
                products.find((item) => item.barcode === code) ??
                (await getProductByBarcode(code))

            if (product.active === false) {
                toast.error(t('barcode.scan.inactiveProduct'))
                return
            }

            addScannedProduct(product)
            toast.success(t('barcode.scan.addedToSale', { name: product.name }))
        } catch {
            toast.error(t('barcode.scan.notFound'))
        }
    }

    useBarcodeScanner({ onScan: handleBarcodeScan })

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        if (hasDuplicateProducts) {
            toast.error(t('saleForm.errors.duplicateProduct'))
            return
        }

        if (hasStockErrors) {
            toast.error(t('saleForm.errors.stockExceeded'))
            return
        }

        if (hasInvalidItems) {
            toast.error(t('saleForm.errors.completeAllLines'))
            return
        }

        const validItems = items.map((item) => {
            if (item.type === 'PRODUCT') {
                return {
                    type: 'PRODUCT' as const,
                    productId: Number(item.productId),
                    quantity: Number(item.quantity),
                }
            }

            return {
                type: 'CUSTOM' as const,
                customName: item.customName.trim(),
                quantity: Number(item.quantity),
                unitLabel: item.unitLabel.trim() || 'unit',
                unitPrice: Number(item.unitPrice),
            }
        })

        if (validItems.length === 0) {
            toast.error(t('saleForm.errors.addAtLeastOneProduct'))
            return
        }

        setCreating(true)

        try {
            await createSale({
                paymentMethod,
                items: validItems,
            })

            toast.success(t('saleForm.createSuccess'))
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
                toast.error(t('saleForm.errors.noOpenCashRegister'))
                navigate('/sales')
                return
            }

            if (message.toLowerCase().includes('stock')) {
                toast.error(t('saleForm.errors.stockExceeded'))
                return
            }

            toast.error(t('saleForm.createError'))
        } finally {
            setCreating(false)
        }
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">
                {t('saleForm.title')}
            </h1>

            <p className="mt-2 solaris-muted">
                {t('saleForm.description')}
            </p>

            <div className="mt-4 rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 px-4 py-3 text-sm text-blue-700 dark:text-blue-200">
                {t('barcode.scan.readySale')}
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-8 max-w-5xl space-y-6"
            >
                <div className="solaris-panel">
                    <h2 className="text-xl font-semibold">
                        {t('saleForm.saleDetails')}
                    </h2>

                    <div className="mt-6 max-w-sm">
                        <label className="text-sm solaris-muted">
                            {t('saleForm.paymentMethod')}
                        </label>

                        <select
                            value={paymentMethod}
                            onChange={(event) =>
                                setPaymentMethod(event.target.value as PaymentMethod)
                            }
                            className="solaris-input mt-2 w-full"
                        >
                            <option value="CASH">{t('sales.payment.cash')}</option>
                            <option value="DEBIT_CARD">{t('sales.payment.debitCard')}</option>
                            <option value="CREDIT_CARD">{t('sales.payment.creditCard')}</option>
                            <option value="TRANSFER">{t('sales.payment.transfer')}</option>
                            <option value="OTHER">{t('sales.payment.other')}</option>
                        </select>
                    </div>
                </div>

                <div className="solaris-panel">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold">
                            {t('saleForm.products')}
                        </h2>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={addProductItem}
                                className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-500/20 dark:text-blue-300"
                            >
                                {t('saleForm.addProduct')}
                            </button>

                            <button
                                type="button"
                                onClick={addCustomItem}
                                className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/20 dark:text-emerald-300"
                            >
                                {t('saleForm.addCustomItem')}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        {items.map((item, index) => {
                            const selectedProduct = products.find(
                                (product) => product.id === Number(item.productId)
                            )

                            const subtotal = item.type === 'PRODUCT'
                                ? selectedProduct
                                    ? selectedProduct.price * Number(item.quantity || 0)
                                    : 0
                                : Number(item.unitPrice || 0) * Number(item.quantity || 0)

                            const exceedsStock = item.type === 'PRODUCT' && selectedProduct
                                ? Number(item.quantity) > selectedProduct.stockQuantity
                                : false

                            const isDuplicated =
                                item.type === 'PRODUCT' &&
                                item.productId &&
                                items.filter((current) => current.productId === item.productId).length > 1

                            const filteredProducts = products.filter((product) => {
                                const search = item.productSearch.toLowerCase()

                                return [
                                    product.name,
                                    product.barcode,
                                    product.categoryName,
                                ]
                                    .join(' ')
                                    .toLowerCase()
                                    .includes(search)
                            })

                            return (
                                <div
                                    key={index}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <div className="mb-4 max-w-xs">
                                        <label className="text-sm solaris-muted">
                                            {t('saleForm.itemType')}
                                        </label>

                                        <select
                                            value={item.type}
                                            onChange={(event) =>
                                                changeItemType(index, event.target.value as SaleItemType)
                                            }
                                            className="solaris-input mt-2 w-full"
                                        >
                                            <option value="PRODUCT">
                                                {t('saleForm.itemTypes.product')}
                                            </option>
                                            <option value="CUSTOM">
                                                {t('saleForm.itemTypes.custom')}
                                            </option>
                                        </select>
                                    </div>

                                    {item.type === 'PRODUCT' ? (
                                        <div className="grid gap-4 md:grid-cols-4">
                                            <div className="relative md:col-span-2">
                                                <label className="text-sm solaris-muted">
                                                    {t('saleForm.product')}
                                                </label>

                                                <input
                                                    required
                                                    value={item.productSearch}
                                                    onChange={(event) => {
                                                        updateItem(index, 'productSearch', event.target.value)
                                                        updateItem(index, 'productId', '')
                                                    }}
                                                    placeholder={t('saleForm.searchProductPlaceholder')}
                                                    className="solaris-input mt-2 w-full"
                                                />

                                                {item.productSearch && !item.productId && (
                                                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                                                        {filteredProducts.slice(0, 8).map((product) => (
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
                                                                        {product.barcode} · {product.categoryName}
                                                                    </p>
                                                                </div>

                                                                <div className="text-right">
                                                                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                                                        ${product.price}
                                                                    </p>

                                                                    <p className="text-xs solaris-subtle">
                                                                        {t('saleForm.stock')}: {product.stockQuantity}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        ))}

                                                        {filteredProducts.length === 0 && (
                                                            <div className="px-4 py-3 text-sm solaris-muted">
                                                                {t('saleForm.noProductsFound')}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {item.productId && selectedProduct && (
                                                    <p className="mt-2 text-sm text-green-500 dark:text-green-300">
                                                        {t('saleForm.selectedProduct', {
                                                            name: selectedProduct.name,
                                                        })}
                                                    </p>
                                                )}
                                            </div>

                                            <QuantityInput
                                                value={item.quantity}
                                                onChange={(value) => updateItem(index, 'quantity', value)}
                                            />

                                            <SubtotalBox subtotal={subtotal} />
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 md:grid-cols-5">
                                            <div className="md:col-span-2">
                                                <label className="text-sm solaris-muted">
                                                    {t('saleForm.customName')}
                                                </label>

                                                <input
                                                    required
                                                    value={item.customName}
                                                    onChange={(event) =>
                                                        updateItem(index, 'customName', event.target.value)
                                                    }
                                                    placeholder={t('saleForm.customNamePlaceholder')}
                                                    className="solaris-input mt-2 w-full"
                                                />
                                            </div>

                                            <QuantityInput
                                                value={item.quantity}
                                                onChange={(value) => updateItem(index, 'quantity', value)}
                                            />

                                            <div>
                                                <label className="text-sm solaris-muted">
                                                    {t('saleForm.unitLabel')}
                                                </label>

                                                <input
                                                    value={item.unitLabel}
                                                    onChange={(event) =>
                                                        updateItem(index, 'unitLabel', event.target.value)
                                                    }
                                                    placeholder="unit"
                                                    className="solaris-input mt-2 w-full"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm solaris-muted">
                                                    {t('saleForm.unitPrice')}
                                                </label>

                                                <input
                                                    required
                                                    min={0}
                                                    step="0.01"
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={(event) =>
                                                        updateItem(index, 'unitPrice', event.target.value)
                                                    }
                                                    className="solaris-input mt-2 w-full"
                                                />
                                            </div>

                                            <div className="md:col-span-5">
                                                <SubtotalBox subtotal={subtotal} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm solaris-muted">
                                                {item.type === 'PRODUCT'
                                                    ? selectedProduct
                                                        ? t('saleForm.unitPriceAndStock', {
                                                            price: selectedProduct.price,
                                                            stock: selectedProduct.stockQuantity,
                                                        })
                                                        : t('saleForm.selectProductHelp')
                                                    : t('saleForm.customItemHelp')}
                                            </p>

                                            {exceedsStock && (
                                                <p className="mt-1 text-sm text-red-400">
                                                    {t('saleForm.errors.quantityExceedsStock')}
                                                </p>
                                            )}

                                            {isDuplicated && (
                                                <p className="mt-1 text-sm text-red-400">
                                                    {t('saleForm.errors.productAlreadyAdded')}
                                                </p>
                                            )}
                                        </div>

                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                                            >
                                                {t('saleForm.remove')}
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
                        <p className="text-sm solaris-muted">
                            {t('saleForm.totalAmount')}
                        </p>

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
                            {t('common.cancel')}
                        </button>

                        <button
                            disabled={creating || hasFormErrors}
                            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                            {creating
                                ? t('saleForm.creating')
                                : t('saleForm.createSale')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

type QuantityInputProps = {
    value: string
    onChange: (value: string) => void
}

function QuantityInput({ value, onChange }: QuantityInputProps) {
    const { t } = useTranslation()

    return (
        <div>
            <label className="text-sm solaris-muted">
                {t('saleForm.quantity')}
            </label>

            <input
                required
                min={1}
                type="number"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="solaris-input mt-2 w-full"
            />
        </div>
    )
}

function SubtotalBox({ subtotal }: { subtotal: number }) {
    const { t } = useTranslation()

    return (
        <div>
            <label className="text-sm solaris-muted">
                {t('saleForm.subtotal')}
            </label>

            <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold dark:border-slate-700 dark:bg-slate-900">
                ${subtotal.toFixed(2)}
            </div>
        </div>
    )
}

export default NewSalePage