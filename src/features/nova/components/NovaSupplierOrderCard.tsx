import { useTranslation } from 'react-i18next'

type SupplierOrderItem = {
    id: number
    productId: number
    productName: string
    productSku: string
    quantity: number
}

export type SupplierOrder = {
    id: number
    supplierId: number
    supplierName: string
    supplierPhone?: string
    status: 'DRAFT' | 'SENT' | 'COMPLETED' | 'CANCELLED'
    messagePreview: string
    items: SupplierOrderItem[]
    createdAt: string
    updatedAt: string
}

type NovaSupplierOrderCardProps = {
    order: SupplierOrder
}

export function NovaSupplierOrderCard({ order }: NovaSupplierOrderCardProps) {
    const { t } = useTranslation()

    return (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-slate-950 dark:text-white">
                        {t('nova.supplierOrderCard.title', { id: order.id })}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {order.supplierName}
                    </p>
                </div>

                <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500 dark:text-blue-300">
                    {order.status}
                </span>
            </div>

            <div className="mt-4 space-y-2">
                {order.items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"
                    >
                        <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                                {item.productName}
                            </p>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.productSku}
                            </p>
                        </div>

                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            x {item.quantity}
                        </span>
                    </div>
                ))}
            </div>

            {order.messagePreview && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {t('nova.supplierOrderCard.messagePreview')}
                    </p>

                    <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
                        {order.messagePreview}
                    </p>
                </div>
            )}
        </div>
    )
}