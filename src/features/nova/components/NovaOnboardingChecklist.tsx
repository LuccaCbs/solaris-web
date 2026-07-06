import { CheckCircle2, Circle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NOVA_QUICK_ACTIONS_CATALOG } from '../config/novaQuickActionsCatalog'
import type { NovaOnboardingState, NovaOnboardingStepId } from '../hooks/useNovaOnboardingState'
import type { NovaQuickActionDefinition } from '../types/nova.types'

const STEP_ACTION_IDS: Record<NovaOnboardingStepId, string> = {
    create_product: 'onboarding_create_product',
    first_sale: 'onboarding_first_sale',
    view_dashboard: 'onboarding_dashboard',
    restock_low_stock: 'restock',
}

interface NovaOnboardingChecklistProps {
    state: NovaOnboardingState
    onSelectAction: (action: NovaQuickActionDefinition) => void
}

function resolveStepAction(stepId: NovaOnboardingStepId) {
    const actionId = STEP_ACTION_IDS[stepId]
    return NOVA_QUICK_ACTIONS_CATALOG.find((action) => action.id === actionId)
}

export function NovaOnboardingChecklist({
    state,
    onSelectAction,
}: NovaOnboardingChecklistProps) {
    const { t } = useTranslation()

    if (state.loading || !state.isNewUser) {
        return null
    }

    const pendingSteps = state.steps.filter((step) => !step.completed)

    if (pendingSteps.length === 0) {
        return null
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t('nova.onboarding.checklistTitle')}
            </p>

            <ul className="mt-3 space-y-2">
                {state.steps.map((step) => {
                    const action = resolveStepAction(step.id)

                    return (
                        <li
                            key={step.id}
                            className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div className="flex min-w-0 items-start gap-2">
                                {step.completed ? (
                                    <CheckCircle2
                                        size={16}
                                        className="mt-0.5 shrink-0 text-emerald-500"
                                    />
                                ) : (
                                    <Circle
                                        size={16}
                                        className="mt-0.5 shrink-0 text-slate-400"
                                    />
                                )}

                                <div className="min-w-0">
                                    <p
                                        className={
                                            step.completed
                                                ? 'text-sm text-slate-500 line-through dark:text-slate-400'
                                                : 'text-sm font-medium text-slate-900 dark:text-slate-100'
                                        }
                                    >
                                        {t(`nova.onboarding.steps.${step.id}.title`)}
                                    </p>

                                    {!step.completed && (
                                        <p className="mt-0.5 text-xs solaris-muted">
                                            {t(`nova.onboarding.steps.${step.id}.description`)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {!step.completed && action && (
                                <button
                                    type="button"
                                    onClick={() => onSelectAction(action)}
                                    className="shrink-0 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                                >
                                    {t('nova.onboarding.start')}
                                </button>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
