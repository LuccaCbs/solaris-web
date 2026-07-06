import type { TFunction } from 'i18next'
import type { ModuleCode } from '../../../types/subscription'

const MODULE_LABEL_KEYS: Partial<Record<ModuleCode, string>> = {
    CORE: 'nova.onboarding.modules.core',
    INVENTORY: 'nova.onboarding.modules.inventory',
    CUSTOMERS: 'nova.onboarding.modules.customers',
    FISCAL: 'nova.onboarding.modules.fiscal',
    TEAM: 'nova.onboarding.modules.team',
    AUDIT: 'nova.onboarding.modules.audit',
}

export function buildNovaWelcomeMessage(
    activeModules: ModuleCode[],
    t: TFunction,
): string {
    const moduleLabels = activeModules
        .filter((module) => module !== 'CORE' && MODULE_LABEL_KEYS[module])
        .map((module) => t(MODULE_LABEL_KEYS[module]!))

    if (moduleLabels.length === 0) {
        return t('nova.onboarding.welcomeCoreOnly')
    }

    return t('nova.onboarding.welcomeWithModules', {
        modules: moduleLabels.join(', '),
    })
}
