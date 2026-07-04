import axiosClient from './axiosClient'
import type {
    CreateStorePayload,
    OrganizationEntitlements,
    OrganizationSubscription,
    RedeemPromoCodeResponse,
    StoreAddonCheckout,
} from '../types/subscription'
import type { OrganizationStore } from './organizationService'

export type { OrganizationEntitlements } from '../types/subscription'

export type BillingSessionToken = {
    billingToken: string
    expiresAt: string
}

export async function getOrganizationEntitlements(
    orgId: number
): Promise<OrganizationEntitlements> {
    const response = await axiosClient.get<OrganizationEntitlements>(
        `/organizations/${orgId}/entitlements`
    )

    return response.data
}

export async function getOrganizationSubscription(
    orgId: number
): Promise<OrganizationSubscription> {
    const response = await axiosClient.get<OrganizationSubscription>(
        `/organizations/${orgId}/subscription`
    )

    return response.data
}

export async function getBillingSessionToken(orgId: number): Promise<BillingSessionToken> {
    const response = await axiosClient.get<BillingSessionToken>(
        `/organizations/${orgId}/billing/session-token`
    )

    return response.data
}

export async function initiateStoreAddonCheckout(
    billingToken: string,
    quantity = 1
): Promise<StoreAddonCheckout> {
    const response = await axiosClient.post<StoreAddonCheckout>(
        '/billing/store-addon/checkout',
        { billingToken, quantity }
    )

    return response.data
}

export async function purchaseStoreAddonMock(
    orgId: number,
    quantity = 1
): Promise<OrganizationSubscription> {
    const response = await axiosClient.post<OrganizationSubscription>(
        `/organizations/${orgId}/subscription/store-addon/mock-purchase`,
        { quantity }
    )

    return response.data
}

export async function redeemOrganizationPromoCode(
    billingToken: string,
    code: string
): Promise<RedeemPromoCodeResponse> {
    const response = await axiosClient.post<RedeemPromoCodeResponse>(
        '/billing/promo-codes/redeem',
        { billingToken, code: code.trim() }
    )

    return response.data
}

export async function createOrganizationStore(
    orgId: number,
    data: CreateStorePayload
): Promise<OrganizationStore> {
    const response = await axiosClient.post<OrganizationStore>(
        `/organizations/${orgId}/stores`,
        data
    )

    return response.data
}
