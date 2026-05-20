import axiosClient from './axiosClient'
import type { DashboardSummary } from '../types/dashboard'

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const token = localStorage.getItem('solaris_token')

    const response = await axiosClient.get<DashboardSummary>('/dashboard/summary', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    return response.data
}