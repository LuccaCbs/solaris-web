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
