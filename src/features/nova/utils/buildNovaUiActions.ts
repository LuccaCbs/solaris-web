import type { TFunction } from 'i18next'
import type { NovaQuickActionDefinition, NovaUiAction } from '../types/nova.types'

export function buildNovaUiActionsForQuickAction(
    action: NovaQuickActionDefinition,
    t: TFunction,
): NovaUiAction[] {
    const actions: NovaUiAction[] = []

    if (action.navigateTo) {
        actions.push({
            id: `${action.id}-navigate`,
            label: t('nova.actions.goToPage'),
            type: 'navigate',
            to: action.navigateTo,
        })
    }

    if (action.executeMessageKey) {
        actions.push({
            id: `${action.id}-execute`,
            label: t(action.executeActionLabelKey ?? 'nova.actions.askNova'),
            type: 'send_message',
            message: t(action.executeMessageKey),
        })
    } else if (action.guideKey) {
        actions.push({
            id: `${action.id}-guide`,
            label: t('nova.actions.askNova'),
            type: 'show_guide',
            message: t(action.guideKey),
        })
    }

    return actions
}
