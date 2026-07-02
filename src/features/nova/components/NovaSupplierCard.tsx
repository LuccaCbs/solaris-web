interface NovaSupplierCardProps {
    data: {
        id?: number
        name?: string
        contactName?: string
        email?: string
        phone?: string
        address?: string
        active?: boolean
    }
}

export function NovaSupplierCard({ data }: NovaSupplierCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">{data.name}</h3>

                {data.active !== undefined && (
                    <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                            data.active
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        }`}
                    >
            {data.active ? 'Active' : 'Inactive'}
          </span>
                )}
            </div>

            <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {data.contactName && (
                    <p>
                        <strong>Contact:</strong> {data.contactName}
                    </p>
                )}

                {data.email && (
                    <p>
                        <strong>Email:</strong> {data.email}
                    </p>
                )}

                {data.phone && (
                    <p>
                        <strong>Phone:</strong> {data.phone}
                    </p>
                )}

                {data.address && (
                    <p>
                        <strong>Address:</strong> {data.address}
                    </p>
                )}
            </div>
        </div>
    )
}