import axiosClient from './axiosClient'
import type { SystemSettings } from '../types/systemSettings'

type UpdateSystemSettingsRequest = {
    globalLowStockThreshold: number
}

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getSystemSettings(): Promise<SystemSettings> {
    const response = await axiosClient.get<SystemSettings>('/admin/settings', {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function updateSystemSettings(
    data: UpdateSystemSettingsRequest
): Promise<SystemSettings> {
    const response = await axiosClient.put<SystemSettings>('/admin/settings', data, {
        headers: getAuthHeaders(),
    })

    return response.data
}