export const BILLING_PORTAL_URL =
    import.meta.env.VITE_BILLING_PORTAL_URL || 'https://solaris-billing-api.onrender.com'

export function buildBillingPortalUrl(billingToken?: string) {
    if (!billingToken) {
        return BILLING_PORTAL_URL
    }

    const url = new URL(BILLING_PORTAL_URL)
    url.searchParams.set('billingToken', billingToken)
    return url.toString()
}
