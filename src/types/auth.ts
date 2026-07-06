export const ORGANIZATION_ROLES = ['OWNER', 'ADMIN', 'MANAGER', 'REPOSITOR', 'CASHIER'] as const

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number]

export type SolarisJwtPayload = {
    sub: string
    orgId?: number
    role?: OrganizationRole
    storeId?: number
    exp?: number
    iat?: number
}

export type AuthUser = {
    email: string
}

export type AuthSession = {
    token: string
    user: AuthUser
    orgId: number | null
    role: OrganizationRole | null
    storeId: number | null
    orgName: string | null
}

export type SelectOrganizationRequest = {
    organizationId: number
    storeId?: number
}
