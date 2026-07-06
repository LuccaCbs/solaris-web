import { useNavigate } from 'react-router-dom'
import type { NovaUiAction } from '../types/nova.types'

interface NovaActionButtonsProps {
    actions: NovaUiAction[]
    onSendMessage?: (message: string) => void
    onClosePanel?: () => void
}

export function NovaActionButtons({
    actions,
    onSendMessage,
    onClosePanel,
}: NovaActionButtonsProps) {
    const navigate = useNavigate()

    if (actions.length === 0) {
        return null
    }

    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((action) => (
                <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                        if (action.type === 'navigate' && action.to) {
                            onClosePanel?.()
                            navigate(action.to)
                            return
                        }

                        if (action.type === 'send_message' && action.message) {
                            onSendMessage?.(action.message)
                        }
                    }}
                    className={
                        action.type === 'navigate'
                            ? 'rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500'
                            : 'rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                    }
                >
                    {action.label}
                </button>
            ))}
        </div>
    )
}
