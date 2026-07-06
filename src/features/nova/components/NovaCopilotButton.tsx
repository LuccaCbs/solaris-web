import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface NovaCopilotButtonProps {
    isOpen: boolean
    onClick: () => void
}

export function NovaCopilotButton({ isOpen, onClick }: NovaCopilotButtonProps) {
    const { t } = useTranslation()

    return (
        <button
            type="button"
            onClick={onClick}
            aria-expanded={isOpen}
            className="fixed bottom-6 right-6 z-50 solaris-panel flex items-center gap-3 px-5 py-3 text-left shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
        >
            <Sparkles className="text-blue-500" size={22} />
            <span className="font-semibold text-slate-950 dark:text-white">
                {isOpen ? t('nova.close') : t('dashboard.quickActions.nova')}
            </span>
        </button>
    )
}
