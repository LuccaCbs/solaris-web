import { MessageSquare, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNovaQuickActions } from '../hooks/useNovaQuickActions'
import type { NovaQuickActionDefinition } from '../types/nova.types'

interface NovaQuickActionsPanelProps {
    onSelectAction: (action: NovaQuickActionDefinition) => void
    onClose: () => void
}

function QuickActionModeHint({ showsNovaBadge }: { showsNovaBadge?: boolean }) {
    const { t } = useTranslation()

    if (!showsNovaBadge) {
        return null
    }

    return (
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-emerald-500">
            <MessageSquare size={12} />
            {t('nova.quickActions.modeExecute')}
        </span>
    )
}

export function NovaQuickActionsPanel({
    onSelectAction,
    onClose,
}: NovaQuickActionsPanelProps) {
    const { t } = useTranslation()
    const { groups } = useNovaQuickActions()

    return (
        <div className="absolute right-full top-0 mr-3 flex h-full w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wide solaris-muted">
                    {t('nova.quickActions.title')}
                </p>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1 solaris-muted hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                    <X size={14} />
                </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {groups.map((group) => (
                    <section key={group.key}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {group.title}
                        </p>

                        <div className="space-y-2">
                            {group.actions.map((action) => (
                                <button
                                    key={action.id}
                                    type="button"
                                    onClick={() => {
                                        onSelectAction(action)
                                        onClose()
                                    }}
                                    className="flex w-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    <span>{t(action.labelKey)}</span>
                                    <QuickActionModeHint showsNovaBadge={action.showsNovaBadge} />
                                </button>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}
