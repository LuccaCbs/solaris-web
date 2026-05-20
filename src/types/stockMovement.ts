export type StockMovement = {
    id: number
    productId: number
    productName: string
    type: 'IN' | 'OUT' | 'ADJUSTMENT'
    quantity: number
    previousStock: number
    currentStock: number
    reason: string
    createdAt: string
}