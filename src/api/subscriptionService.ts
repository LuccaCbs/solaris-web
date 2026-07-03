import axiosClient from './axiosClient'
import type {
    CreateStorePayload,
    OrganizationSubscription,
    StoreAddonCheckout,
} from '../types/subscription'
import type { OrganizationStore } from './organizationService'

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getOrganizationSubscription(
    orgId: number
): Promise<OrganizationSubscription> {
    const response = await axiosClient.get<OrganizationSubscription>(
        `/organizations/${orgId}/subscription`,
        { headers: getAuthHeaders() }
    )

    return response.data
}

export async function initiateStoreAddonCheckout(
    orgId: number,
    quantity = 1
): Promise<StoreAddonCheckout> {
    const response = await axiosClient.post<StoreAddonCheckout>(
        `/organizations/${orgId}/subscription/store-addon/checkout`,
        { quantity },
        { headers: getAuthHeaders() }
    )

    return response.data
}

export async function purchaseStoreAddonMock(
    orgId: number,
    quantity = 1
): Promise<OrganizationSubscription> {
    const response = await axiosClient.post<OrganizationSubscription>(
        `/organizations/${orgId}/subscription/store-addon/mock-purchase`,
        { quantity },
        { headers: getAuthHeaders() }
    )

    return response.data
}

export async function createOrganizationStore(
    orgId: number,
    data: CreateStorePayload
): Promise<OrganizationStore> {
    const response = await axiosClient.post<OrganizationStore>(
        `/organizations/${orgId}/stores`,
        data,
        { headers: getAuthHeaders() }
    )

    return response.data
}
