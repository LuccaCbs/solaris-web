export type SaleItemType = 'PRODUCT' | 'CUSTOM'

export type PaymentMethod =
    | 'CASH'
    | 'DEBIT_CARD'
    | 'CREDIT_CARD'
    | 'TRANSFER'
    | 'OTHER'

export type SaleItem = {
    id: number
    type: SaleItemType

    productId: number | null
    productName: string | null

    customName: string | null
    unitLabel: string | null

    quantity: number
    unitPrice: number
    subtotal: number
}

export type Sale = {
    id: number
    cashRegisterSessionId: number | null
    paymentMethod: PaymentMethod
    totalAmount: number
    createdAt: string
    items: SaleItem[]
}

export type DailySalesSummary = {
    date: string
    salesCount: number
    totalSales: number
    cashTotal: number
    debitCardTotal: number
    creditCardTotal: number
    transferTotal: number
    otherTotal: number
}

export type CreateSaleItemRequest =
    | {
    type: 'PRODUCT'
    productId: number
    quantity: number
}
    | {
    type: 'CUSTOM'
    customName: string
    quantity: number
    unitLabel: string
    unitPrice: number
}

export type CreateSaleRequest = {
    paymentMethod: PaymentMethod
    items: CreateSaleItemRequest[]
}