import axiosClient from './axiosClient'
import type { CountryCode, SubscriptionStatus } from '../types/subscription'

export type OnboardingStatus = {
    emailVerified: boolean
    needsOrganizationSetup: boolean
    needsPlanSelection: boolean
    organizationId?: number | null
    organizationName?: string | null
    countryCode?: CountryCode | null
    subscriptionStatus?: SubscriptionStatus | null
}

export type SetupOrganizationPayload = {
    countryCode: CountryCode
    organizationName: string
    storeName?: string
}

export type SetupOrganizationResponse = {
    token: string
}

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
    const response = await axiosClient.get<OnboardingStatus>('/me/onboarding-status')
    return response.data
}

export async function setupOrganization(
    payload: SetupOrganizationPayload
): Promise<SetupOrganizationResponse> {
    const response = await axiosClient.post<SetupOrganizationResponse>(
        '/me/setup-organization',
        payload
    )
    return response.data
}
