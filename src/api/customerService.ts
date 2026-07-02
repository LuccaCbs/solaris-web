import axiosClient from './axiosClient'
import type { Customer, CustomerRequest } from '../types/customer'

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    if (!token) {
        return {}
    }

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getCustomers(): Promise<Customer[]> {
    const response = await axiosClient.get<Customer[]>('/customers', {
        headers: getAuthHeaders(),
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
    const response = await axiosClient.post<Customer>('/customers', data, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function updateCustomer(
    id: number,
    data: CustomerRequest
): Promise<Customer> {
    const response = await axiosClient.put<Customer>(`/customers/${id}`, data, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function deleteCustomer(id: number): Promise<void> {
    await axiosClient.delete(`/customers/${id}`, {
        headers: getAuthHeaders(),
    })
}
