import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

import {
    getSupplierOrderById,
    updateSupplierOrder,
} from '../api/supplierOrderService'
import { getSuppliers } from '../api/supplierService'
import { getProducts } from '../api/productService'
import type { Supplier } from '../types/supplier'
import type { Product } from '../types/product'
import LoadingScreen from '../components/LoadingScreen'
import { SupplierOrderForm } from '../features/supplier-orders/components/SupplierOrderForm'
import type { OrderItemForm } from '../features/supplier-orders/types/supplierOrderForm.types'

function EditSupplierOrderPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
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
                const [suppliersData, productsData, order] =
                    await Promise.all([
                        getSuppliers(),
                        getProducts(),
                        getSupplierOrderById(Number(id)),
                    ])

                if (order.status !== 'DRAFT') {
                    toast.error(t('supplierOrders.editUnavailable'))
                    navigate('/supplier-orders')
                    return
                }

                setSuppliers(suppliersData.filter((supplier) => supplier.active))
                setProducts(productsData)
                setSupplierId(String(order.supplierId))

                const supplier = suppliersData.find(
                    (currentSupplier) => currentSupplier.id === order.supplierId,
                )

                if (supplier) {
                    setSupplierSearch(supplier.name)
                }

                setItems(
                    order.items.map((item) => ({
                        productId: String(item.productId),
                        productSearch: `${item.productName} · ${item.productSku}`,
                        quantity: String(item.quantity),
                    })),
                )
            } catch {
                toast.error(t('supplierOrderForm.loadError'))
                navigate('/supplier-orders')
            } finally {
                setLoading(false)
            }
        }

        void loadData()
    }, [id, navigate, t])

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
        setSupplierSearch(
            supplier.contactName
                ? `${supplier.name} · ${supplier.contactName}`
                : supplier.name,
        )
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
                        productSearch: `${product.name} · ${product.sku}`,
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
            await updateSupplierOrder(Number(id), {
                supplierId: Number(supplierId),
                items: validItems,
            })

            toast.success(t('supplierOrders.updateSuccess'))
            navigate('/supplier-orders')
        } catch {
            toast.error(t('supplierOrders.updateError'))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <SupplierOrderForm
            title={t('supplierOrders.editTitle')}
            description={t('supplierOrderForm.description')}
            submitLabel={t('supplierOrders.actions.edit')}
            saving={saving}
            suppliers={suppliers}
            products={products}
            supplierId={supplierId}
            supplierSearch={supplierSearch}
            items={items}
            messagePreview={messagePreview}
            onSupplierSearchChange={(value) => {
                setSupplierSearch(value)
                setSupplierId('')
            }}
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

export default EditSupplierOrderPage