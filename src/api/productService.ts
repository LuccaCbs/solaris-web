import axiosClient from './axiosClient'
import type { Product } from '../types/product'

export type CreateProductRequest = {
    name: string
    description: string
    sku: string
    price: number
    stockQuantity: number
    categoryId: number
    lowStockThreshold: number | null
}

export type UpdateProductRequest = {
    name: string
    description: string
    sku: string
    price: number
    categoryId: number
    lowStockThreshold: number | null
}

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getProducts(): Promise<Product[]> {
    const response = await axiosClient.get<Product[]>('/products', {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await axiosClient.post<Product>('/products', data, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function deleteProduct(id: number): Promise<void> {
    await axiosClient.delete(`/products/${id}`, {
        headers: getAuthHeaders(),
    })
}

export async function getProductById(id: number): Promise<Product> {
    const response = await axiosClient.get<Product>(`/products/${id}`, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function updateProduct(
    id: number,
    data: UpdateProductRequest
): Promise<Product> {
    const response = await axiosClient.put<Product>(`/products/${id}`, data, {
        headers: getAuthHeaders(),
    })

    return response.data
}