import type { OrganizationRole } from '../types/auth'

const ROLE_LEVEL: Record<OrganizationRole, number> = {
    CASHIER: 1,
    REPOSITOR: 2,
    MANAGER: 3,
    ADMIN: 4,
    OWNER: 5,
}

const REPOSITOR_ALLOWED_ROUTE_PATTERNS = [
    /^\/$/,
    /^\/stock(\/|$)/,
    /^\/supplier-orders(\/|$)/,
    /^\/categories(\/|$)/,
    /^\/products(\/|$)/,
    /^\/suppliers(\/|$)/,
    /^\/profile(\/|$)/,
]

export function hasMinimumRole(
    userRole: OrganizationRole | null,
    minimumRole: OrganizationRole
): boolean {
    if (!userRole) {
        return false
    }

    return ROLE_LEVEL[userRole] >= ROLE_LEVEL[minimumRole]
}

export function canDeleteSuppliers(userRole: OrganizationRole | null): boolean {
    return hasMinimumRole(userRole, 'MANAGER')
}

export function canDeleteCustomers(userRole: OrganizationRole | null): boolean {
    return hasMinimumRole(userRole, 'MANAGER')
}

type RouteAccessRule = {
    pattern: RegExp
    minimumRole: OrganizationRole
}

const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
    { pattern: /^\/$/, minimumRole: 'CASHIER' },
    { pattern: /^\/sales(\/|$)/, minimumRole: 'CASHIER' },
    { pattern: /^\/fiscal-documents(\/|$)/, minimumRole: 'CASHIER' },
    { pattern: /^\/profile(\/|$)/, minimumRole: 'CASHIER' },
    { pattern: /^\/products(\/|$)/, minimumRole: 'REPOSITOR' },
    { pattern: /^\/categories(\/|$)/, minimumRole: 'REPOSITOR' },
    { pattern: /^\/suppliers(\/|$)/, minimumRole: 'REPOSITOR' },
    { pattern: /^\/customers(\/|$)/, minimumRole: 'MANAGER' },
    { pattern: /^\/supplier-orders(\/|$)/, minimumRole: 'REPOSITOR' },
    { pattern: /^\/stock-movements(\/|$)/, minimumRole: 'REPOSITOR' },
    { pattern: /^\/stock(\/|$)/, minimumRole: 'REPOSITOR' },
    { pattern: /^\/audit-logs(\/|$)/, minimumRole: 'ADMIN' },
    { pattern: /^\/admin(\/|$)/, minimumRole: 'ADMIN' },
    { pattern: /^\/team(\/|$)/, minimumRole: 'ADMIN' },
]

export function getRouteMinimumRole(pathname: string): OrganizationRole | null {
    const rule = ROUTE_ACCESS_RULES.find(({ pattern }) => pattern.test(pathname))
    return rule?.minimumRole ?? null
}

export function canAccessRoute(
    pathname: string,
    userRole: OrganizationRole | null
): boolean {
    if (userRole === 'REPOSITOR') {
        return REPOSITOR_ALLOWED_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))
    }

    const minimumRole = getRouteMinimumRole(pathname)

    if (!minimumRole) {
        return true
    }

    return hasMinimumRole(userRole, minimumRole)
}

export function getDefaultRouteForRole(userRole: OrganizationRole | null): string {
    if (userRole === 'CASHIER') {
        return '/'
    }

    if (userRole === 'REPOSITOR') {
        return '/products'
    }

    return '/'
}
