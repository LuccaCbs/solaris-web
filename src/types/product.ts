export type ProductIvaRate = 'EXENTO' | 'REDUCIDO_10_5' | 'GENERAL_21'

export type BarcodeFormat = 'EAN_13' | 'UPC_A' | 'CODE_128' | 'CODE_39'

export type Product = {
    id: number
    name: string
    description: string
    barcode: string
    barcodeFormat: BarcodeFormat
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

export const PRODUCT_IVA_RATES: ProductIvaRate[] = [
    'EXENTO',
    'REDUCIDO_10_5',
    'GENERAL_21',
]

export const BARCODE_FORMATS: BarcodeFormat[] = [
    'EAN_13',
    'UPC_A',
    'CODE_128',
    'CODE_39',
]
