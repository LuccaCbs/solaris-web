import { useEffect, useMemo, useState } from 'react'
import { getDashboard } from '../../../api/dashboardService'
import { getProducts } from '../../../api/productService'
import { useAuth } from '../../../context/AuthContext'
import { useEntitlements } from '../../../context/EntitlementsContext'
import type { ModuleCode } from '../../../types/subscription'

export type NovaOnboardingStepId =
    | 'create_product'
    | 'first_sale'
    | 'view_dashboard'
    | 'restock_low_stock'

export type NovaOnboardingStep = {
    id: NovaOnboardingStepId
    completed: boolean
    requiredModule?: ModuleCode
}

export type NovaOnboardingState = {
    loading: boolean
    activeProductCount: number
    hasSales: boolean
    lowStockCount: number
    steps: NovaOnboardingStep[]
    isNewUser: boolean
    activeModuleLabels: ModuleCode[]
}

export function useNovaOnboardingState(): NovaOnboardingState {
    const { orgId } = useAuth()
    const { activeModules, hasModule } = useEntitlements()
    const [state, setState] = useState<Omit<NovaOnboardingState, 'steps' | 'isNewUser' | 'activeModuleLabels'>>({
        loading: true,
        activeProductCount: 0,
        hasSales: false,
        lowStockCount: 0,
    })

    useEffect(() => {
        if (!orgId) {
            setState({
                loading: false,
                activeProductCount: 0,
                hasSales: false,
                lowStockCount: 0,
            })
            return
        }

        let cancelled = false

        async function loadOnboardingState() {
            setState((current) => ({ ...current, loading: true }))

            try {
                const [products, dashboard] = await Promise.all([
                    getProducts(true),
                    getDashboard(),
                ])

                if (cancelled) {
                    return
                }

                const hasSales =
                    dashboard.todaySalesCount > 0 ||
                    dashboard.comparison.currentMonthSalesCount > 0 ||
                    dashboard.recentSales.length > 0

                setState({
                    loading: false,
                    activeProductCount: products.length,
                    hasSales,
                    lowStockCount: dashboard.lowStockProductsCount,
                })
            } catch {
                if (!cancelled) {
                    setState((current) => ({ ...current, loading: false }))
                }
            }
        }

        void loadOnboardingState()

        return () => {
            cancelled = true
        }
    }, [orgId])

    return useMemo(() => {
        const steps: NovaOnboardingStep[] = [
            {
                id: 'create_product',
                completed: state.activeProductCount > 0,
                requiredModule: 'INVENTORY',
            },
            {
                id: 'first_sale',
                completed: state.hasSales,
            },
            {
                id: 'view_dashboard',
                completed: state.hasSales || state.activeProductCount > 0,
            },
        ]

        if (hasModule('INVENTORY') && state.lowStockCount > 0) {
            steps.push({
                id: 'restock_low_stock',
                completed: false,
                requiredModule: 'INVENTORY',
            })
        }

        const visibleSteps = steps.filter(
            (step) => !step.requiredModule || hasModule(step.requiredModule),
        )

        const isNewUser =
            !state.loading &&
            (state.activeProductCount === 0 || !state.hasSales)

        return {
            ...state,
            steps: visibleSteps,
            isNewUser,
            activeModuleLabels: activeModules,
        }
    }, [activeModules, hasModule, state])
}
