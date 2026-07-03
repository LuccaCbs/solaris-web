import type { Product } from '../../../types/product'
import type { OrderItemForm } from '../types/supplierOrderForm.types'

export function addScannedProductToOrderItems(
    items: OrderItemForm[],
    product: Product,
): OrderItemForm[] {
    const productLabel = `${product.name} · ${product.barcode}`
    const existingIndex = items.findIndex(
        (item) => item.productId === String(product.id),
    )

    if (existingIndex >= 0) {
        return items.map((item, index) =>
            index === existingIndex
                ? {
                    ...item,
                    quantity: String(Number(item.quantity) + 1),
                }
                : item,
        )
    }

    const emptyIndex = items.findIndex((item) => !item.productId)

    if (emptyIndex >= 0) {
        return items.map((item, index) =>
            index === emptyIndex
                ? {
                    ...item,
                    productId: String(product.id),
                    productSearch: productLabel,
                    quantity: '1',
                }
                : item,
        )
    }

    return [
        ...items,
        {
            productId: String(product.id),
            productSearch: productLabel,
            quantity: '1',
        },
    ]
}
