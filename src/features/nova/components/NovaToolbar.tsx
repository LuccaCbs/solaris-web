import { Plus, History, Zap } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NovaActionTimeline } from './NovaActionTimeline'
import { NovaQuickActionsPanel } from './NovaQuickActionsPanel'
import type { NovaActionEvent, NovaQuickActionDefinition } from '../types/nova.types'

interface NovaToolbarProps {
    actionEvents: NovaActionEvent[]
    onNewChat: () => void
    onSelectQuickAction: (action: NovaQuickActionDefinition) => void
}

export function NovaToolbar({
                                actionEvents,
                                onNewChat,
                                onSelectQuickAction,
                            }: NovaToolbarProps) {
    const { t } = useTranslation()
    const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false)

    return (
        <div className="relative flex w-12 flex-col items-center gap-2 border-r border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950">
            <button
                type="button"
                onClick={onNewChat}
                title={t('nova.newChat')}
                aria-label={t('nova.newChat')}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
            >
                <Plus size={18} />
            </button>

            <NovaActionTimeline
                events={actionEvents}
                triggerIcon={<History size={18} />}
            />

            <button
                type="button"
                onClick={() => setIsQuickActionsOpen((current) => !current)}
                title={t('nova.quickActions.title')}
                aria-label={t('nova.quickActions.title')}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
            >
                <Zap size={18} />
            </button>

            {isQuickActionsOpen && (
                <NovaQuickActionsPanel
                    onSelectAction={onSelectQuickAction}
                    onClose={() => setIsQuickActionsOpen(false)}
                />
            )}
        </div>
    )
}