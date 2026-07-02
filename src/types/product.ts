export type ProductIvaRate = 'EXENTO' | 'REDUCIDO_10_5' | 'GENERAL_21'

export const PRODUCT_IVA_RATES: ProductIvaRate[] = [
    'EXENTO',
    'REDUCIDO_10_5',
    'GENERAL_21',
]

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
    ivaRate: ProductIvaRate
}