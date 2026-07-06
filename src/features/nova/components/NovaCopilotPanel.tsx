import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { NovaInput } from './NovaInput'
import { NovaMessageList } from './NovaMessageList'
import { useNovaChat } from '../hooks/useNovaChat'
import { NovaToolbar } from './NovaToolbar'
import { buildNovaUiActionsForQuickAction } from '../utils/buildNovaUiActions'
import type { NovaQuickActionDefinition } from '../types/nova.types'

interface NovaCopilotPanelProps {
    isOpen: boolean
    onClose: () => void
}

export function NovaCopilotPanel({ isOpen, onClose }: NovaCopilotPanelProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const {
        messages,
        actionEvents,
        isLoading,
        sendMessage,
        addAssistantMessage,
        resetChat,
    } = useNovaChat()

    function handleNewChat() {
        void resetChat()
    }

    function handleQuickAction(action: NovaQuickActionDefinition) {
        if (action.mode === 'navigate' && action.navigateTo) {
            onClose()
            navigate(action.navigateTo)
            return
        }

        if (action.mode === 'execute' && action.executeMessageKey) {
            void sendMessage(t(action.executeMessageKey))
            return
        }

        const helpText = action.helpKey ? t(action.helpKey) : t(action.labelKey)
        const uiActions =
            action.mode === 'hybrid' || action.mode === 'guide'
                ? buildNovaUiActionsForQuickAction(action, t)
                : undefined

        addAssistantMessage(helpText, uiActions)
    }

    if (!isOpen) return null

    return (
        <div className="fixed bottom-20 right-6 z-50 flex h-[600px] w-[430px] overflow-visible rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <NovaToolbar
                actionEvents={actionEvents}
                onNewChat={handleNewChat}
                onSelectQuickAction={handleQuickAction}
            />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                    <div>
                        <h2 className="text-sm font-semibold">
                            {t('nova.title')}
                        </h2>
                        <p className="text-xs solaris-muted">
                            {t('nova.subtitle')}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-sm solaris-muted hover:bg-slate-100 dark:hover:bg-slate-900"
                    >
                        ×
                    </button>
                </div>

                <NovaMessageList
                    messages={messages}
                    isLoading={isLoading}
                    onSendMessage={sendMessage}
                    onShowGuide={(content) => addAssistantMessage(content)}
                    onClosePanel={onClose}
                    onSelectQuickAction={handleQuickAction}
                />

                <NovaInput isLoading={isLoading} onSendMessage={sendMessage} />
            </div>
        </div>
    )
}
