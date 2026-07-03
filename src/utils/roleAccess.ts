import type { OrganizationRole } from '../types/auth'

const ROLE_LEVEL: Record<OrganizationRole, number> = {
    CASHIER: 1,
    MANAGER: 2,
    ADMIN: 3,
    OWNER: 4,
}

export function hasMinimumRole(
    userRole: OrganizationRole | null,
    minimumRole: OrganizationRole
): boolean {
    if (!userRole) {
        return true
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
    { pattern: /^\/products(\/|$)/, minimumRole: 'MANAGER' },
    { pattern: /^\/categories(\/|$)/, minimumRole: 'MANAGER' },
    { pattern: /^\/suppliers(\/|$)/, minimumRole: 'MANAGER' },
    { pattern: /^\/customers(\/|$)/, minimumRole: 'MANAGER' },
    { pattern: /^\/supplier-orders(\/|$)/, minimumRole: 'MANAGER' },
    { pattern: /^\/stock-movements(\/|$)/, minimumRole: 'MANAGER' },
    { pattern: /^\/stock(\/|$)/, minimumRole: 'MANAGER' },
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

    return '/'
}
