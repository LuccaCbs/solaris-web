import axiosClient from './axiosClient'
import type { OrganizationRole } from '../types/auth'

export type OrganizationMember = {
    id: number
    email: string
    firstname?: string
    lastname?: string
    role: OrganizationRole
    status: 'ACTIVE' | 'INVITED' | 'SUSPENDED'
    storeId: number | null
    storeName: string | null
    createdAt?: string
    expiresAt?: string
    pendingInvite: boolean
}

export type OrganizationStore = {
    id: number
    name: string
    active: boolean
}

export type OrganizationInviteRequest = {
    email: string
    role: OrganizationRole
    storeId?: number | null
}

export type OrganizationInvitePreview = {
    organizationName: string
    email: string
    role: OrganizationRole
    existingUser: boolean
    expired: boolean
}

export type AcceptOrganizationInviteRequest = {
    token: string
    password?: string
    firstname?: string
    lastname?: string
}

type AuthResponse = {
    token: string
}

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    if (!token) {
        return {}
    }

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getOrganizationMembers(
    orgId: number
): Promise<OrganizationMember[]> {
    const response = await axiosClient.get<OrganizationMember[]>(
        `/organizations/${orgId}/members`,
        { headers: getAuthHeaders() }
    )

    return response.data
}

export async function getOrganizationStores(
    orgId: number
): Promise<OrganizationStore[]> {
    const response = await axiosClient.get<OrganizationStore[]>(
        `/organizations/${orgId}/stores`,
        { headers: getAuthHeaders() }
    )

    return response.data
}

export async function createOrganizationInvite(
    orgId: number,
    data: OrganizationInviteRequest
) {
    const response = await axiosClient.post(
        `/organizations/${orgId}/invites`,
        data,
        { headers: getAuthHeaders() }
    )

    return response.data
}

export async function revokeOrganizationInvite(
    orgId: number,
    inviteId: number
): Promise<void> {
    await axiosClient.delete(`/organizations/${orgId}/invites/${inviteId}`, {
        headers: getAuthHeaders(),
    })
}

export async function previewOrganizationInvite(
    token: string
): Promise<OrganizationInvitePreview> {
    const response = await axiosClient.get<OrganizationInvitePreview>(
        '/organizations/invites/preview',
        { params: { token } }
    )

    return response.data
}

export async function acceptOrganizationInvite(
    data: AcceptOrganizationInviteRequest
): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>(
        '/organizations/invites/accept',
        data
    )

    return response.data
}
