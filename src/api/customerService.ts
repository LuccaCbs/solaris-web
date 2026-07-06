import axiosClient from './axiosClient'
import type { Customer, CustomerRequest } from '../types/customer'
import { buildCustomerPayload } from '../utils/fiscalUtils'

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    if (!token) {
        return {}
    }

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getCustomers(active?: boolean): Promise<Customer[]> {
    const params = active !== undefined ? { active } : undefined

    const response = await axiosClient.get<Customer[]>('/customers', {
        headers: getAuthHeaders(),
        params,
    })

    return response.data
}

export async function searchCustomers(query: string): Promise<Customer[]> {
    const response = await axiosClient.get<Customer[]>('/customers/search', {
        headers: getAuthHeaders(),
        params: { q: query },
    })

    return response.data
}

export async function getCustomerById(id: number): Promise<Customer> {
    const response = await axiosClient.get<Customer>(`/customers/${id}`, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function createCustomer(data: CustomerRequest): Promise<Customer> {
    const response = await axiosClient.post<Customer>(
        '/customers',
        buildCustomerPayload(data),
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function updateCustomer(
    id: number,
    data: CustomerRequest
): Promise<Customer> {
    const response = await axiosClient.put<Customer>(
        `/customers/${id}`,
        buildCustomerPayload(data),
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function deactivateCustomer(id: number): Promise<Customer> {
    const response = await axiosClient.patch<Customer>(
        `/customers/${id}/deactivate`,
        {},
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function activateCustomer(id: number): Promise<Customer> {
    const response = await axiosClient.patch<Customer>(
        `/customers/${id}/activate`,
        {},
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function deleteCustomer(id: number): Promise<void> {
    await axiosClient.delete(`/customers/${id}`, {
        headers: getAuthHeaders(),
    })
}
