import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { NovaMessage, NovaQuickActionDefinition } from '../types/nova.types'
import { NovaResponseRenderer } from './NovaResponseRenderer'
import { useNovaQuickActions } from '../hooks/useNovaQuickActions'

interface NovaMessageListProps {
    messages: NovaMessage[]
    isLoading: boolean
    onSendMessage: (message: string) => void
    onClosePanel?: () => void
    onSelectQuickAction: (action: NovaQuickActionDefinition) => void
}

export function NovaMessageList({
    messages,
    isLoading,
    onSendMessage,
    onClosePanel,
    onSelectQuickAction,
}: NovaMessageListProps) {
    const { t } = useTranslation()
    const { onboardingActions } = useNovaQuickActions()
    const bottomRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: 'smooth',
        })
    }, [messages, isLoading])

    return (
        <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {messages.length === 0 && (
                <div className="space-y-4">
                    <p className="text-sm solaris-muted">
                        {t('nova.emptyState')}
                    </p>

                    <p className="text-xs solaris-muted">
                        {t('nova.emptyStateHint')}
                    </p>

                    {onboardingActions.length > 0 && (
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
            )}

            {messages.map((message) => (
                <div
                    key={message.id}
                    className={
                        message.role === 'user'
                            ? 'ml-auto max-w-[85%] rounded-2xl bg-blue-600 px-3 py-2 text-sm text-white'
                            : 'mr-auto max-w-[85%] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
                    }
                >
                    <NovaResponseRenderer
                        message={message}
                        onSendMessage={onSendMessage}
                        onClosePanel={onClosePanel}
                    />
                </div>
            ))}

            {isLoading && (
                <div className="mr-auto max-w-[85%] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm solaris-muted dark:border-slate-800 dark:bg-slate-900">
                    {t('nova.loading')}
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    )
}
