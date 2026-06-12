import axiosClient from './axiosClient'
import type { AuditLog } from '../types/auditLog'

export async function getAuditLogs() {
    const response = await axiosClient.get<AuditLog[]>('/audit-logs')

    return response.data
}