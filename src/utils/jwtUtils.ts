import { jwtDecode } from 'jwt-decode'
import type { AuthSession, AuthUser, OrganizationRole, SolarisJwtPayload } from '../types/auth'
import { ORGANIZATION_ROLES } from '../types/auth'

const TOKEN_STORAGE_KEY = 'solaris_token'
const ORG_NAME_STORAGE_KEY = 'solaris_org_name'

function isOrganizationRole(value: unknown): value is OrganizationRole {
    return typeof value === 'string' && ORGANIZATION_ROLES.includes(value as OrganizationRole)
}

export function parseJwtPayload(token: string): SolarisJwtPayload | null {
    try {
        return jwtDecode<SolarisJwtPayload>(token)
    } catch {
        return null
    }
}

export function buildAuthSession(token: string, orgNameOverride?: string | null): AuthSession | null {
    const payload = parseJwtPayload(token)

    if (!payload?.sub) {
        return null
    }

    const user: AuthUser = {
        email: payload.sub,
    }

    const storedOrgName = localStorage.getItem(ORG_NAME_STORAGE_KEY)
    const orgName = orgNameOverride ?? storedOrgName

    return {
        token,
        user,
        orgId: payload.orgId ?? null,
        role: isOrganizationRole(payload.role) ? payload.role : null,
        storeId: payload.storeId ?? null,
        orgName,
    }
}

export function getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function persistAuthSession(session: AuthSession): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, session.token)

    if (session.orgName) {
        localStorage.setItem(ORG_NAME_STORAGE_KEY, session.orgName)
    } else {
        localStorage.removeItem(ORG_NAME_STORAGE_KEY)
    }
}

export function clearAuthSession(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(ORG_NAME_STORAGE_KEY)
}

export function setOrganizationName(orgName: string | null): void {
    if (orgName) {
        localStorage.setItem(ORG_NAME_STORAGE_KEY, orgName)
    } else {
        localStorage.removeItem(ORG_NAME_STORAGE_KEY)
    }
}
