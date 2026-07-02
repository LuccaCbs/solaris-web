import axiosClient from './axiosClient'
import type { OrganizationRole } from '../types/auth'

export type OrganizationMemberStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED'

export type OrganizationMember = {
    id: number
    type?: 'MEMBER' | 'INVITE'
    email: string
    firstname?: string | null
    lastname?: string | null
    role: OrganizationRole
    storeId?: number | null
    storeName?: string | null
    status: OrganizationMemberStatus
    createdAt?: string | null
    expiresAt?: string | null
    pendingInvite: boolean
}

export type OrganizationStore = {
    id: number
    name: string
}

export type OrganizationInviteRequest = {
    email: string
    role: OrganizationRole
    storeId?: number | null
}

export type OrganizationInvitePreview = {
    email: string
    organizationName: string
    role: OrganizationRole
    existingUser: boolean
    expired: boolean
}

export type AcceptInviteRequest = {
    token: string
    password?: string
    firstname?: string
    lastname?: string
}

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getOrganizationMembers(orgId: number): Promise<OrganizationMember[]> {
    const response = await axiosClient.get<OrganizationMember[]>(
        `/organizations/${orgId}/members`,
        { headers: getAuthHeaders() }
    )

    return response.data.map((member) => ({
        ...member,
        pendingInvite: member.pendingInvite ?? member.type === 'INVITE',
    }))
}

export async function getOrganizationStores(orgId: number): Promise<OrganizationStore[]> {
    const response = await axiosClient.get<OrganizationStore[]>(
        `/organizations/${orgId}/stores`,
        { headers: getAuthHeaders() }
    )

    return response.data
}

export async function createOrganizationInvite(
    orgId: number,
    data: OrganizationInviteRequest
): Promise<void> {
    await axiosClient.post(`/organizations/${orgId}/invites`, data, {
        headers: getAuthHeaders(),
    })
}

export async function revokeOrganizationInvite(orgId: number, inviteId: number): Promise<void> {
    await axiosClient.delete(`/organizations/${orgId}/invites/${inviteId}`, {
        headers: getAuthHeaders(),
    })
}

export async function previewOrganizationInvite(token: string): Promise<OrganizationInvitePreview> {
    const response = await axiosClient.get<OrganizationInvitePreview>(
        '/organizations/invites/preview',
        { params: { token } }
    )

    return response.data
}

export async function acceptOrganizationInvite(
    data: AcceptInviteRequest
): Promise<{ token: string }> {
    const response = await axiosClient.post<{ token: string }>(
        '/organizations/invites/accept',
        data
    )

    return response.data
}
