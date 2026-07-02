import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { NovaActionEvent } from '../types/nova.types'
import type { ReactNode } from 'react'

interface NovaActionTimelineProps {
    events: NovaActionEvent[]
    triggerIcon?: ReactNode
}

export function NovaActionTimeline({ events, triggerIcon, }: NovaActionTimelineProps) {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                title={t('nova.timeline.title')}
                aria-label={t('nova.timeline.title')}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
            >
                {triggerIcon}

                {events.length > 0 && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-400" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-full top-0 mr-3 flex h-full w-72 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-wide solaris-muted">
                            {t('nova.timeline.title')}
                        </p>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg px-2 py-1 text-xs solaris-muted hover:bg-slate-100 dark:hover:bg-slate-900"
                        >
                            ×
                        </button>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {events.length === 0 && (
                            <p className="text-sm solaris-muted">
                                {t('nova.timeline.empty')}
                            </p>
                        )}

                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2"
                            >
                                <p className="text-xs font-semibold text-emerald-400">
                                    {t(`nova.timeline.events.${event.type}`)}
                                </p>

                                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                                    {event.description}
                                </p>

                                <p className="mt-2 text-[10px] solaris-muted">
                                    {event.createdAt.toLocaleTimeString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}