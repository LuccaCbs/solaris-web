import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import { selectOrganization as selectOrganizationRequest } from '../api/authService'
import type { AuthSession, OrganizationRole } from '../types/auth'
import {
    buildAuthSession,
    clearAuthSession,
    getStoredToken,
    persistAuthSession,
    setOrganizationName,
} from '../utils/jwtUtils'
import { canAccessRoute, getDefaultRouteForRole, hasMinimumRole } from '../utils/roleAccess'

type AuthContextValue = {
    isAuthenticated: boolean
    isLoading: boolean
    session: AuthSession | null
    user: AuthSession['user'] | null
    orgId: number | null
    role: OrganizationRole | null
    storeId: number | null
    orgName: string | null
    login: (token: string, orgName?: string | null) => void
    logout: () => void
    selectOrganization: (organizationId: number, storeId?: number, orgName?: string | null) => Promise<void>
    hasMinimumRole: (minimumRole: OrganizationRole) => boolean
    canAccessRoute: (pathname: string) => boolean
    getDefaultPath: () => string
    setOrgName: (orgName: string | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readInitialSession(): AuthSession | null {
    const token = getStoredToken()

    if (!token) {
        return null
    }

    return buildAuthSession(token)
}

type AuthProviderProps = {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<AuthSession | null>(() => readInitialSession())
    const [isLoading] = useState(false)

    const login = useCallback((token: string, orgName?: string | null) => {
        const nextSession = buildAuthSession(token, orgName)

        if (!nextSession) {
            clearAuthSession()
            setSession(null)
            return
        }

        persistAuthSession(nextSession)
        setSession(nextSession)
    }, [])

    const logout = useCallback(() => {
        clearAuthSession()
        sessionStorage.removeItem('solaris_cash_register_opened')
        setSession(null)
    }, [])

    const selectOrganization = useCallback(
        async (organizationId: number, storeId?: number, orgName?: string | null) => {
            const response = await selectOrganizationRequest({ organizationId, storeId })
            const nextSession = buildAuthSession(response.token, orgName ?? null)

            if (!nextSession) {
                throw new Error('Invalid organization token')
            }

            persistAuthSession(nextSession)
            setSession(nextSession)
        },
        []
    )

    const setOrgName = useCallback((orgName: string | null) => {
        setOrganizationName(orgName)
        setSession((current) => {
            if (!current) {
                return current
            }

            const nextSession = { ...current, orgName }
            return nextSession
        })
    }, [])

    const value = useMemo<AuthContextValue>(() => {
        const checkMinimumRole = (minimumRole: OrganizationRole) =>
            hasMinimumRole(session?.role ?? null, minimumRole)

        const checkRouteAccess = (pathname: string) =>
            canAccessRoute(pathname, session?.role ?? null)

        const getDefaultPath = () => getDefaultRouteForRole(session?.role ?? null)

        return {
            isAuthenticated: Boolean(session?.token),
            isLoading,
            session,
            user: session?.user ?? null,
            orgId: session?.orgId ?? null,
            role: session?.role ?? null,
            storeId: session?.storeId ?? null,
            orgName: session?.orgName ?? null,
            login,
            logout,
            selectOrganization,
            hasMinimumRole: checkMinimumRole,
            canAccessRoute: checkRouteAccess,
            getDefaultPath,
            setOrgName,
        }
    }, [isLoading, login, logout, selectOrganization, session, setOrgName])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}
