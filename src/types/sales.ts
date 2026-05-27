export type PaymentMethod =
    | 'CASH'
    | 'DEBIT_CARD'
    | 'CREDIT_CARD'
    | 'TRANSFER'
    | 'OTHER'

export type SaleItem = {
    id: number
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
}

export type Sale = {
    id: number
    cashRegisterSessionId: number
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

export type CreateSaleRequest = {
    paymentMethod: PaymentMethod
    items: {
        productId: number
        quantity: number
    }[]
}