import type { Product } from '../../../types/product'

export type RestockLineItem = {
    product: Product
    quantity: string
}

export function addProductToRestockList(
    items: RestockLineItem[],
    product: Product,
): RestockLineItem[] {
    const existingIndex = items.findIndex(
        (item) => item.product.id === product.id,
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

    return [...items, { product, quantity: '1' }]
}
