import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface NovaInputProps {
    isLoading: boolean
    onSendMessage: (message: string) => void
}

export function NovaInput({ isLoading, onSendMessage }: NovaInputProps) {
    const { t } = useTranslation()
    const [value, setValue] = useState('')

    function handleSubmit(event: FormEvent) {
        event.preventDefault()

        if (!value.trim() || isLoading) return

        onSendMessage(value)
        setValue('')
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
            <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={t('nova.input.placeholder')}
                className="solaris-input flex-1"
                disabled={isLoading}
            />

            <button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
                {t('nova.input.send')}
            </button>
        </form>
    )
}