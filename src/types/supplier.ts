export type Supplier = {
    id: number
    name: string
    contactName: string | null
    email: string | null
    phone: string | null
    address: string | null
    notes: string | null
    active: boolean
    createdAt: string
    updatedAt: string
}

export type SupplierRequest = {
    name: string
    contactName?: string
    email?: string
    phone?: string
    address?: string
    notes?: string
    active?: boolean
}