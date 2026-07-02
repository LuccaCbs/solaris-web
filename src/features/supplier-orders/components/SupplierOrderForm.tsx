import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { Supplier } from '../../../types/supplier'
import type { Product } from '../../../types/product'
import type { OrderItemForm } from '../types/supplierOrderForm.types'

type SupplierOrderFormProps = {
    title: string
    description: string
    submitLabel: string
    saving: boolean

    suppliers: Supplier[]
    products: Product[]

    supplierId: string
    supplierSearch: string
    items: OrderItemForm[]
    messagePreview: string

    onSupplierSearchChange: (value: string) => void
    onSelectSupplier: (supplier: Supplier) => void
    onClearSupplier: () => void

    onUpdateItem: (
        index: number,
        field: keyof OrderItemForm,
        value: string,
    ) => void
    onSelectProduct: (index: number, product: Product) => void
    onClearProduct: (index: number) => void
    onAddItem: () => void
    onRemoveItem: (index: number) => void

    onSubmit: (event: React.FormEvent) => void
    onCancel: () => void
}

export function SupplierOrderForm({
                                      title,
                                      description,
                                      submitLabel,
                                      saving,
                                      suppliers,
                                      products,
                                      supplierId,
                                      supplierSearch,
                                      items,
                                      messagePreview,
                                      onSupplierSearchChange,
                                      onSelectSupplier,
                                      onClearSupplier,
                                      onUpdateItem,
                                      onSelectProduct,
                                      onClearProduct,
                                      onAddItem,
                                      onRemoveItem,
                                      onSubmit,
                                      onCancel,
                                  }: SupplierOrderFormProps) {
    const { t } = useTranslation()

    const filteredSuppliers = useMemo(() => {
        if (supplierId || !supplierSearch.trim()) return []

        const normalizedSearch = supplierSearch.toLowerCase().trim()

        return suppliers
            .filter((supplier) => {
                return (
                    supplier.name.toLowerCase().includes(normalizedSearch) ||
                    supplier.contactName
                        ?.toLowerCase()
                        .includes(normalizedSearch) ||
                    supplier.phone?.toLowerCase().includes(normalizedSearch)
                )
            })
            .slice(0, 6)
    }, [suppliers, supplierId, supplierSearch])

    function getFilteredProducts(productSearch: string, productId: string) {
        if (productId || !productSearch.trim()) return []

        const normalizedSearch = productSearch.toLowerCase().trim()

        return products
            .filter((product) => {
                return (
                    product.name.toLowerCase().includes(normalizedSearch) ||
                    product.sku.toLowerCase().includes(normalizedSearch)
                )
            })
            .slice(0, 6)
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">{title}</h1>

            <p className="mt-2 solaris-muted">{description}</p>

            <form
                onSubmit={onSubmit}
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
                                    onSupplierSearchChange(event.target.value)
                                }}
                                placeholder={t(
                                    'supplierOrderForm.searchSupplierPlaceholder',
                                )}
                                className="solaris-input w-full"
                            />

                            {supplierId && (
                                <button
                                    type="button"
                                    onClick={onClearSupplier}
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
                                            onClick={() =>
                                                onSelectSupplier(supplier)
                                            }
                                            className="block w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            <p className="font-medium text-slate-950 dark:text-white">
                                                {supplier.name}
                                            </p>

                                            <p className="text-sm solaris-muted">
                                                {supplier.contactName ||
                                                    t(
                                                        'suppliers.noContactName',
                                                    )}
                                                {supplier.phone
                                                    ? ` · ${supplier.phone}`
                                                    : ''}
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
                                onClick={onAddItem}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                {t('supplierOrderForm.addProduct')}
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            {items.map((item, index) => {
                                const filteredProducts = getFilteredProducts(
                                    item.productSearch,
                                    item.productId,
                                )

                                return (
                                    <div
                                        key={index}
                                        className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[1fr_140px_auto]"
                                    >
                                        <div>
                                            <label className="text-sm solaris-muted">
                                                {t(
                                                    'supplierOrderForm.product',
                                                )}
                                            </label>

                                            <div className="relative mt-2">
                                                <input
                                                    required
                                                    value={item.productSearch}
                                                    onChange={(event) => {
                                                        onUpdateItem(
                                                            index,
                                                            'productSearch',
                                                            event.target.value,
                                                        )
                                                        onUpdateItem(
                                                            index,
                                                            'productId',
                                                            '',
                                                        )
                                                    }}
                                                    placeholder={t(
                                                        'supplierOrderForm.searchProductPlaceholder',
                                                    )}
                                                    className="solaris-input w-full"
                                                />

                                                {item.productId && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onClearProduct(
                                                                index,
                                                            )
                                                        }
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                                    >
                                                        {t('common.clear')}
                                                    </button>
                                                )}

                                                {filteredProducts.length >
                                                    0 && (
                                                        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                                                            {filteredProducts.map(
                                                                (product) => (
                                                                    <button
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            onSelectProduct(
                                                                                index,
                                                                                product,
                                                                            )
                                                                        }
                                                                        className="block w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                    >
                                                                        <p className="font-medium text-slate-950 dark:text-white">
                                                                            {
                                                                                product.name
                                                                            }
                                                                        </p>

                                                                        <p className="text-sm solaris-muted">
                                                                            {t(
                                                                                'supplierOrderForm.productMeta',
                                                                                {
                                                                                    sku: product.sku,
                                                                                    stock: product.stockQuantity,
                                                                                },
                                                                            )}
                                                                        </p>
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm solaris-muted">
                                                {t(
                                                    'supplierOrderForm.quantity',
                                                )}
                                            </label>

                                            <input
                                                required
                                                min={1}
                                                type="number"
                                                value={item.quantity}
                                                onChange={(event) =>
                                                    onUpdateItem(
                                                        index,
                                                        'quantity',
                                                        event.target.value,
                                                    )
                                                }
                                                className="solaris-input mt-2 w-full"
                                            />
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                disabled={items.length === 1}
                                                onClick={() =>
                                                    onRemoveItem(index)
                                                }
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
                            {saving ? t('common.saving') : submitLabel}
                        </button>

                        <button
                            type="button"
                            onClick={onCancel}
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