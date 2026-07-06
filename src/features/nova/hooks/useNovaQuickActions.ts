import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../context/AuthContext'
import { useEntitlements } from '../../../context/EntitlementsContext'
import {
    isNovaQuickActionAvailable,
    NOVA_QUICK_ACTION_GROUP_ORDER,
    NOVA_QUICK_ACTIONS_CATALOG,
    type NovaQuickActionGroupKey,
} from '../config/novaQuickActionsCatalog'
import type { NovaQuickActionDefinition } from '../types/nova.types'

export type NovaQuickActionGroup = {
    key: NovaQuickActionGroupKey
    title: string
    actions: NovaQuickActionDefinition[]
}

export function useNovaQuickActions() {
    const { t } = useTranslation()
    const { hasMinimumRole } = useAuth()
    const { hasModule } = useEntitlements()

    const availableActions = useMemo(
        () =>
            NOVA_QUICK_ACTIONS_CATALOG.filter((action) =>
                isNovaQuickActionAvailable(action, hasModule, hasMinimumRole),
            ),
        [hasModule, hasMinimumRole],
    )

    const groups = useMemo(() => {
        return NOVA_QUICK_ACTION_GROUP_ORDER.map((groupKey) => ({
            key: groupKey,
            title: t(`nova.quickActions.groups.${groupKey}`),
            actions: availableActions.filter((action) => action.groupKey === groupKey),
        })).filter((group) => group.actions.length > 0)
    }, [availableActions, t])

    const onboardingActions = useMemo(
        () => availableActions.filter((action) => action.onboarding),
        [availableActions],
    )

    return {
        groups,
        onboardingActions,
        availableActions,
    }
}
