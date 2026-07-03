import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import { getOrganizationEntitlements } from '../api/subscriptionService'
import { useAuth } from './AuthContext'
import type { ModuleCode } from '../types/subscription'
import { hasModuleAccess } from '../utils/moduleAccess'

type OrganizationEntitlements = {
    activeModules: ModuleCode[]
    planModules: ModuleCode[]
    addonModules: ModuleCode[]
    promoModules: ModuleCode[]
}

type EntitlementsContextValue = {
    activeModules: ModuleCode[]
    planModules: ModuleCode[]
    addonModules: ModuleCode[]
    promoModules: ModuleCode[]
    isLoading: boolean
    hasModule: (moduleCode: ModuleCode) => boolean
    refreshEntitlements: () => Promise<void>
}

const DEFAULT_MODULES: ModuleCode[] = ['CORE']

const EntitlementsContext = createContext<EntitlementsContextValue | null>(null)

type EntitlementsProviderProps = {
    children: ReactNode
}

export function EntitlementsProvider({ children }: EntitlementsProviderProps) {
    const { orgId, isAuthenticated } = useAuth()
    const [entitlements, setEntitlements] = useState<OrganizationEntitlements>({
        activeModules: DEFAULT_MODULES,
        planModules: DEFAULT_MODULES,
        addonModules: [],
        promoModules: [],
    })
    const [isLoading, setIsLoading] = useState(true)

    const refreshEntitlements = useCallback(async () => {
        if (!orgId) {
            setEntitlements({
                activeModules: DEFAULT_MODULES,
                planModules: DEFAULT_MODULES,
                addonModules: [],
                promoModules: [],
            })
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        try {
            const response = await getOrganizationEntitlements(orgId)
            setEntitlements({
                activeModules: response.activeModules?.length
                    ? response.activeModules
                    : DEFAULT_MODULES,
                planModules: response.planModules ?? [],
                addonModules: response.addonModules ?? [],
                promoModules: response.promoModules ?? [],
            })
        } catch {
            setEntitlements({
                activeModules: DEFAULT_MODULES,
                planModules: DEFAULT_MODULES,
                addonModules: [],
                promoModules: [],
            })
        } finally {
            setIsLoading(false)
        }
    }, [orgId])

    useEffect(() => {
        if (!isAuthenticated) {
            setEntitlements({
                activeModules: DEFAULT_MODULES,
                planModules: DEFAULT_MODULES,
                addonModules: [],
                promoModules: [],
            })
            setIsLoading(false)
            return
        }

        void refreshEntitlements()
    }, [isAuthenticated, refreshEntitlements])

    const hasModule = useCallback(
        (moduleCode: ModuleCode) => hasModuleAccess(entitlements.activeModules, moduleCode),
        [entitlements.activeModules]
    )

    const value = useMemo<EntitlementsContextValue>(
        () => ({
            activeModules: entitlements.activeModules,
            planModules: entitlements.planModules,
            addonModules: entitlements.addonModules,
            promoModules: entitlements.promoModules,
            isLoading,
            hasModule,
            refreshEntitlements,
        }),
        [entitlements, hasModule, isLoading, refreshEntitlements]
    )

    return (
        <EntitlementsContext.Provider value={value}>{children}</EntitlementsContext.Provider>
    )
}

export function useEntitlements(): EntitlementsContextValue {
    const context = useContext(EntitlementsContext)

    if (!context) {
        throw new Error('useEntitlements must be used within an EntitlementsProvider')
    }

    return context
}
