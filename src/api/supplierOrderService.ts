import axiosClient from './axiosClient'
import type { SupplierOrder, SupplierOrderRequest } from '../types/supplierOrder'

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getSupplierOrders(): Promise<SupplierOrder[]> {
    const response = await axiosClient.get<SupplierOrder[]>('/supplier-orders', {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function getSupplierOrderById(id: number): Promise<SupplierOrder> {
    const response = await axiosClient.get<SupplierOrder>(`/supplier-orders/${id}`, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function createSupplierOrder(
    data: SupplierOrderRequest
): Promise<SupplierOrder> {
    const response = await axiosClient.post<SupplierOrder>('/supplier-orders', data, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function updateSupplierOrder(
    id: number,
    request: SupplierOrderRequest
): Promise<SupplierOrder> {
    const response = await axiosClient.put<SupplierOrder>(
        `/supplier-orders/${id}`,
        request,
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function markSupplierOrderAsSent(id: number): Promise<SupplierOrder> {
    const response = await axiosClient.patch<SupplierOrder>(
        `/supplier-orders/${id}/sent`,
        {},
        { headers: getAuthHeaders() }
    )

    return response.data
}

export async function markSupplierOrderAsCompleted(id: number): Promise<SupplierOrder> {
    const response = await axiosClient.patch<SupplierOrder>(
        `/supplier-orders/${id}/completed`,
        {},
        { headers: getAuthHeaders() }
    )

    return response.data
}

export async function cancelSupplierOrder(id: number): Promise<SupplierOrder> {
    const response = await axiosClient.patch<SupplierOrder>(
        `/supplier-orders/${id}/cancel`,
        {},
        { headers: getAuthHeaders() }
    )

    return response.data
}

export async function deleteSupplierOrder(id: number): Promise<void> {
    await axiosClient.delete(`/supplier-orders/${id}`, {
        headers: getAuthHeaders(),
    })
}