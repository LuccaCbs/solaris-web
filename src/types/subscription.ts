export type SubscriptionPlanCode = 'POS' | 'BUSINESS' | 'SCALE' | 'INTERNAL' | 'STARTER'

export type CountryCode = 'AR' | 'ES'

export type BillingJurisdiction = 'AR' | 'EU'

export type FiscalJurisdiction = 'AR_AFIP' | 'ES_VERIFACTU'

export type PaymentMethodType = 'CARD' | 'GOOGLE_PAY' | 'APPLE_PAY'

export type ModuleCode =
    | 'CORE'
    | 'INVENTORY'
    | 'CUSTOMERS'
    | 'FISCAL'
    | 'TEAM'
    | 'MULTI_STORE'
    | 'AUDIT'
    | 'ANALYTICS'

export type SubscriptionStatus = 'PENDING_PLAN' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'

export type BillingProvider = 'NONE' | 'MERCADOPAGO' | 'STRIPE'

export type OrganizationSubscription = {
    planCode: SubscriptionPlanCode
    planDisplayName?: string
    status: SubscriptionStatus
    maxStores: number
    extraStoresPurchased: number
    allowedStores: number
    activeStoreCount: number
    canAddStore: boolean
    billingProvider: BillingProvider
    preferredBillingProvider?: BillingProvider
    paymentProviderDisplayName?: string
    countryCode?: CountryCode
    billingJurisdiction?: BillingJurisdiction
    fiscalJurisdiction?: FiscalJurisdiction
    defaultCurrency?: string
    trialEndsAt?: string | null
    currentPeriodStart?: string | null
    currentPeriodEnd?: string | null
    activeModules: ModuleCode[]
    planModules: ModuleCode[]
    addonModules: ModuleCode[]
    promoModules: ModuleCode[]
}

export type StoreAddonCheckout = {
    status: string
    message: string
    checkoutUrl?: string | null
    provider: BillingProvider
    providerDisplayName?: string
    supportedPaymentMethods?: PaymentMethodType[]
    quantity: number
    currency?: string
    unitPrice?: number | null
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

export type PromoRedemptionStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED'

export type PromoCodeRedemption = {
    id: number
    promoCodeId: number
    promoCode?: string | null
    organizationId: number
    organizationName?: string | null
    redeemedByUserId: number
    status: PromoRedemptionStatus
    grantedPlanCode?: SubscriptionPlanCode | null
    grantedModuleCode?: ModuleCode | null
    accessValidFrom: string
    accessValidUntil?: string | null
    createdAt: string
    revokedAt?: string | null
}

export type OrganizationEntitlements = {
    activeModules: ModuleCode[]
    planModules: ModuleCode[]
    addonModules: ModuleCode[]
    promoModules: ModuleCode[]
}

export type OrganizationModuleOption = {
    code: ModuleCode
    displayName: string
    includedInPlan: boolean
    requiresOptIn: boolean
    enabled: boolean
}

export type OrganizationModulePreferences = {
    modules: OrganizationModuleOption[]
}

export type UpdateOrganizationModulePreferencesPayload = {
    enabledModules: ModuleCode[]
}

export type RedeemPromoCodeResponse = {
    message: string
    redemption: PromoCodeRedemption
    entitlements: OrganizationEntitlements
}
