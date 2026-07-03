import axiosClient from './axiosClient'
import type { StockMovement } from '../types/stockMovement'

export type CreateStockMovementRequest = {
    productId: number
    type: 'IN' | 'OUT' | 'ADJUSTMENT'
    quantity: number
    reason: string
}

export type BulkStockMovementRequest = {
    reason: string
    items: {
        productId: number
        quantity: number
    }[]
}

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getStockMovements(): Promise<StockMovement[]> {
    const response = await axiosClient.get<StockMovement[]>('/stock-movements', {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function createStockMovement(
    data: CreateStockMovementRequest
): Promise<StockMovement> {
    const response = await axiosClient.post<StockMovement>('/stock-movements', data, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function createBulkStockMovements(
    data: BulkStockMovementRequest,
): Promise<StockMovement[]> {
    const response = await axiosClient.post<StockMovement[]>(
        '/stock-movements/batch',
        data,
        {
            headers: getAuthHeaders(),
        },
    )

    return response.data
}