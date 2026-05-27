import axiosClient from './axiosClient'
import type {
    SystemSettings,
    UpdateSystemSettingsRequest,
    ValidateAdminPasswordRequest,
    ValidateAdminPasswordResponse,
} from '../types/systemSettings'

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

export async function validateAdminPassword(
    data: ValidateAdminPasswordRequest
): Promise<ValidateAdminPasswordResponse> {
    const response = await axiosClient.post<ValidateAdminPasswordResponse>(
        '/admin/settings/validate-password',
        data,
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}