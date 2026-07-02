export type Product = {
    id: number
    name: string
    description: string
    sku: string
    price: number
    stockQuantity: number
    lowStockThreshold: number | null
    effectiveLowStockThreshold: number
    lowStock: boolean
    categoryId: number
    categoryName: string
    active?: boolean
}