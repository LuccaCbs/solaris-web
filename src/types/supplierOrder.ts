export type SupplierOrderStatus = 'DRAFT' | 'SENT' | 'COMPLETED' | 'CANCELLED'

export type SupplierOrderItem = {
    id: number
    productId: number
    productName: string
    productSku: string
    quantity: number
}

export type SupplierOrder = {
    id: number
    supplierId: number
    supplierName: string
    supplierPhone: string | null
    status: SupplierOrderStatus
    messagePreview: string
    items: SupplierOrderItem[]
    createdAt: string
    updatedAt: string
}

export type SupplierOrderItemRequest = {
    productId: number
    quantity: number
}

export type SupplierOrderRequest = {
    supplierId: number
    items: SupplierOrderItemRequest[]
}