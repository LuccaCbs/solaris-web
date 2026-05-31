import axiosClient from './axiosClient'
import type { Dashboard } from '../types/dashboard'

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getDashboard(): Promise<Dashboard> {
    const response = await axiosClient.get<Dashboard>('/dashboard', {
        headers: getAuthHeaders(),
    })

    return response.data
}