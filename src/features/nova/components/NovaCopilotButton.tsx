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
            className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-xl hover:bg-blue-500"
        >
            {isOpen ? t('nova.close') : t('nova.open')}
        </button>
    )
}