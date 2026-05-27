import axiosClient from './axiosClient'
import type { CreateSaleRequest, DailySalesSummary, Sale } from '../types/sales'

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getSales(): Promise<Sale[]> {
    const response = await axiosClient.get<Sale[]>('/sales', {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function getDailySalesSummary(date?: string): Promise<DailySalesSummary> {
    const response = await axiosClient.get<DailySalesSummary>('/sales/daily-summary', {
        headers: getAuthHeaders(),
        params: date ? { date } : undefined,
    })

    return response.data
}

export async function createSale(data: CreateSaleRequest): Promise<Sale> {
    const response = await axiosClient.post<Sale>('/sales', data, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function getSaleById(id: number): Promise<Sale> {
    const response = await axiosClient.get<Sale>(`/sales/${id}`, {
        headers: getAuthHeaders(),
    })

    return response.data
}