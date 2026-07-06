import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { NovaMessage, NovaQuickActionDefinition } from '../types/nova.types'
import { NovaResponseRenderer } from './NovaResponseRenderer'
import { NovaEmptyState } from './NovaEmptyState'

interface NovaMessageListProps {
    messages: NovaMessage[]
    isLoading: boolean
    onSendMessage: (message: string) => void
    onShowGuide: (message: string) => void
    onClosePanel?: () => void
    onSelectQuickAction: (action: NovaQuickActionDefinition) => void
}

export function NovaMessageList({
    messages,
    isLoading,
    onSendMessage,
    onShowGuide,
    onClosePanel,
    onSelectQuickAction,
}: NovaMessageListProps) {
    const { t } = useTranslation()
    const bottomRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: 'smooth',
        })
    }, [messages, isLoading])

    return (
        <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {messages.length === 0 && (
                <NovaEmptyState onSelectQuickAction={onSelectQuickAction} />
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
                        onShowGuide={onShowGuide}
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
