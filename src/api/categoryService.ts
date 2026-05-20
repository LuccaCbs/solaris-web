import axiosClient from './axiosClient'
import type { Category } from '../types/category'

export type CategoryRequest = {
    name: string
    description: string
}

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getCategories(): Promise<Category[]> {
    const response = await axiosClient.get<Category[]>('/categories', {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function getCategoryById(id: number): Promise<Category> {
    const response = await axiosClient.get<Category>(`/categories/${id}`, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function createCategory(data: CategoryRequest): Promise<Category> {
    const response = await axiosClient.post<Category>('/categories', data, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function updateCategory(
    id: number,
    data: CategoryRequest
): Promise<Category> {
    const response = await axiosClient.put<Category>(`/categories/${id}`, data, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function deleteCategory(id: number): Promise<void> {
    await axiosClient.delete(`/categories/${id}`, {
        headers: getAuthHeaders(),
    })
}