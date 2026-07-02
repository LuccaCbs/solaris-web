import { useTranslation } from 'react-i18next'

interface NovaConfirmationCardProps {
    content: string
    onConfirm?: () => void
    onCancel?: () => void
}

export function NovaConfirmationCard({
                                         content,
                                         onConfirm,
                                         onCancel,
                                     }: NovaConfirmationCardProps) {
    const { t } = useTranslation()

    return (
        <div className="space-y-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">
                {t('nova.confirmation.title')}
            </p>

            <p className="whitespace-pre-line text-sm text-slate-900 dark:text-slate-100">
                {content}
            </p>

            {(onConfirm || onCancel) && (
                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                        {t('nova.confirmation.confirm')}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        {t('nova.confirmation.cancel')}
                    </button>
                </div>
            )}
        </div>
    )
}