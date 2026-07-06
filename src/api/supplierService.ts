import axiosClient from './axiosClient'
import type { Supplier, SupplierRequest } from '../types/supplier'

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getSuppliers(active?: boolean): Promise<Supplier[]> {
    const params = active !== undefined ? { active } : undefined

    const response = await axiosClient.get<Supplier[]>('/suppliers', {
        headers: getAuthHeaders(),
        params,
    })

    return response.data
}

export async function getSupplierById(id: number): Promise<Supplier> {
    const response = await axiosClient.get<Supplier>(`/suppliers/${id}`, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export type SupplierPreview = {
    supplier: Supplier
    totalOrders: number
    recentOrders: Array<{
        id: number
        supplierId: number
        supplierName: string
        supplierPhone?: string | null
        status: 'DRAFT' | 'SENT' | 'COMPLETED' | 'CANCELLED'
        messagePreview: string
        items: Array<{
            id: number
            productId: number
            productName: string
            productBarcode: string
            quantity: number
        }>
        createdAt: string
        updatedAt: string
    }>
}

export async function getSupplierPreview(id: number): Promise<SupplierPreview> {
    const response = await axiosClient.get<SupplierPreview>(`/suppliers/${id}/preview`, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function createSupplier(data: SupplierRequest): Promise<Supplier> {
    const response = await axiosClient.post<Supplier>('/suppliers', data, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function updateSupplier(
    id: number,
    data: SupplierRequest
): Promise<Supplier> {
    const response = await axiosClient.put<Supplier>(`/suppliers/${id}`, data, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function deactivateSupplier(id: number): Promise<Supplier> {
    const response = await axiosClient.patch<Supplier>(
        `/suppliers/${id}/deactivate`,
        {},
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function activateSupplier(id: number): Promise<Supplier> {
    const response = await axiosClient.patch<Supplier>(
        `/suppliers/${id}/activate`,
        {},
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function deleteSupplier(id: number): Promise<void> {
    await axiosClient.delete(`/suppliers/${id}`, {
        headers: getAuthHeaders(),
    })
}
