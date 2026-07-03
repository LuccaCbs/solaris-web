export type SubscriptionPlanCode = 'STARTER'

export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'

export type BillingProvider = 'NONE' | 'MERCADOPAGO' | 'STRIPE'

export type OrganizationSubscription = {
    planCode: SubscriptionPlanCode
    status: SubscriptionStatus
    maxStores: number
    extraStoresPurchased: number
    allowedStores: number
    activeStoreCount: number
    canAddStore: boolean
    billingProvider: BillingProvider
    trialEndsAt?: string | null
    currentPeriodStart?: string | null
    currentPeriodEnd?: string | null
}

export type StoreAddonCheckout = {
    status: string
    message: string
    checkoutUrl?: string | null
    provider: BillingProvider
    quantity: number
    unitPriceArs?: number | null
    mockPurchaseAvailable?: boolean
    checkoutId?: number | null
    preferenceId?: string | null
}

export type CreateStorePayload = {
    name: string
    address?: string
    afipPuntoVenta?: number
}
