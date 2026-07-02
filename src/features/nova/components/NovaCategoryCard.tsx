interface NovaCategory {
    id: number
    name: string
    description?: string
    systemCategory?: boolean
}

interface NovaCategoryCardProps {
    category: NovaCategory
}

export function NovaCategoryCard({ category }: NovaCategoryCardProps) {
    return (
        <div className="solaris-card space-y-2 p-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {category.name}
                    </p>

                    {category.description && (
                        <p className="text-xs solaris-muted">
                            {category.description}
                        </p>
                    )}
                </div>

                {category.systemCategory && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-400">
                        Sistema
                    </span>
                )}
            </div>
        </div>
    )
}