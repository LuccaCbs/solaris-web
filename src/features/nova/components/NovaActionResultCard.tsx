interface NovaActionResultCardProps {
    title: string
    description: string
    status?: 'success' | 'error'
}

export function NovaActionResultCard({
                                         title,
                                         description,
                                         status = 'success',
                                     }: NovaActionResultCardProps) {
    const statusClasses =
        status === 'success'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            : 'border-red-500/30 bg-red-500/10 text-red-400'

    return (
        <div className={`rounded-2xl border p-3 ${statusClasses}`}>
            <p className="text-xs font-semibold uppercase tracking-wide">
                {title}
            </p>
            <p className="mt-2 text-sm text-slate-900 dark:text-slate-100">
                {description}
            </p>
        </div>
    )
}