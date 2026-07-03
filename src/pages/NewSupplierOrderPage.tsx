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
import { SupplierOrderForm } from '../features/supplier-orders/components/SupplierOrderForm'
import type { OrderItemForm } from '../features/supplier-orders/types/supplierOrderForm.types'

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

        void loadData()
    }, [t])

    const selectedSupplier = useMemo(() => {
        return suppliers.find((supplier) => supplier.id === Number(supplierId))
    }, [suppliers, supplierId])

    const messagePreview = useMemo(() => {
        if (!selectedSupplier) return ''

        const supplierName = selectedSupplier.contactName || selectedSupplier.name

        const selectedItems = items
            .map((item) => {
                const product = products.find(
                    (currentProduct) =>
                        currentProduct.id === Number(item.productId),
                )

                if (!product || !item.quantity) return null

                return {
                    productName: product.name,
                    quantity: item.quantity,
                }
            })
            .filter(Boolean) as { productName: string; quantity: string }[]

        if (selectedItems.length === 0) {
            return t('supplierOrderForm.messagePreview.greeting', {
                supplierName,
            })
        }

        return [
            t('supplierOrderForm.messagePreview.greeting', { supplierName }),
            ...selectedItems.map((item) =>
                t('supplierOrderForm.messagePreview.itemLine', {
                    productName: item.productName,
                    quantity: item.quantity,
                }),
            ),
        ].join('\n')
    }, [selectedSupplier, items, products, t])

    function selectSupplier(supplier: Supplier) {
        setSupplierId(String(supplier.id))
        setSupplierSearch(supplier.name)
    }

    function clearSupplier() {
        setSupplierId('')
        setSupplierSearch('')
    }

    function updateItem(
        index: number,
        field: keyof OrderItemForm,
        value: string,
    ) {
        setItems((currentItems) =>
            currentItems.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item,
            ),
        )
    }

    function selectProduct(index: number, product: Product) {
        setItems((currentItems) =>
            currentItems.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        productId: String(product.id),
                        productSearch: `${product.name} · ${product.barcode}`,
                    }
                    : item,
            ),
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
                    : item,
            ),
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
            currentItems.filter((_, itemIndex) => itemIndex !== index),
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
        <SupplierOrderForm
            title={t('supplierOrderForm.title')}
            description={t('supplierOrderForm.description')}
            submitLabel={t('supplierOrderForm.createOrder')}
            saving={saving}
            suppliers={suppliers}
            products={products}
            supplierId={supplierId}
            supplierSearch={supplierSearch}
            items={items}
            messagePreview={messagePreview}
            onSupplierSearchChange={setSupplierSearch}
            onSelectSupplier={selectSupplier}
            onClearSupplier={clearSupplier}
            onUpdateItem={updateItem}
            onSelectProduct={selectProduct}
            onClearProduct={clearProduct}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/supplier-orders')}
        />
    )
}

export default NewSupplierOrderPage