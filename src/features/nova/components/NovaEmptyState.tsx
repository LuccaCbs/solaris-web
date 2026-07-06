import { useTranslation } from 'react-i18next'
import { useEntitlements } from '../../../context/EntitlementsContext'
import { useNovaOnboardingState } from '../hooks/useNovaOnboardingState'
import { useNovaQuickActions } from '../hooks/useNovaQuickActions'
import { buildNovaWelcomeMessage } from '../utils/novaWelcomeMessage'
import type { NovaQuickActionDefinition } from '../types/nova.types'
import { NovaOnboardingChecklist } from './NovaOnboardingChecklist'

interface NovaEmptyStateProps {
    onSelectQuickAction: (action: NovaQuickActionDefinition) => void
}

export function NovaEmptyState({ onSelectQuickAction }: NovaEmptyStateProps) {
    const { t } = useTranslation()
    const { activeModules } = useEntitlements()
    const onboardingState = useNovaOnboardingState()
    const { onboardingActions } = useNovaQuickActions()

    const welcomeMessage = buildNovaWelcomeMessage(activeModules, t)

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-900 dark:text-slate-100">
                {welcomeMessage}
            </p>

            <p className="text-xs solaris-muted">{t('nova.emptyStateHint')}</p>

            <NovaOnboardingChecklist
                state={onboardingState}
                onSelectAction={onSelectQuickAction}
            />

            {!onboardingState.isNewUser && onboardingActions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {t('nova.quickActions.groups.gettingStarted')}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {onboardingActions.map((action) => (
                            <button
                                key={action.id}
                                type="button"
                                onClick={() => onSelectQuickAction(action)}
                                className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-500/20 dark:text-blue-300"
                            >
                                {t(action.labelKey)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
