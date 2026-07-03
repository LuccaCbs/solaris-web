import type { NovaMessage } from '../types/nova.types'
import { NovaConfirmationCard } from './NovaConfirmationCard'
import { NovaProductsResult } from './NovaProductsResult'
import { NovaDashboardCard } from './NovaDashboardCard'
import { NovaCategoryCard } from './NovaCategoryCard'
import { NovaActionResultCard } from './NovaActionResultCard'
import { NovaSupplierCard } from './NovaSupplierCard'
import {
    NovaSupplierOrderCard,
    type SupplierOrder,
} from './NovaSupplierOrderCard'
import { NovaSalesListCard } from './NovaSalesListCard'
import { NovaSaleDetailCard } from './NovaSaleDetailCard'
import { NovaDailySalesSummaryCard } from './NovaDailySalesSummaryCard'
import type { DailySalesSummary, Sale } from '../../../types/sales'

interface NovaResponseRendererProps {
    message: NovaMessage
    onSendMessage?: (message: string, options?: { silent?: boolean }) => void
}

function isSupplierOrder(value: unknown): value is SupplierOrder {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'supplierName' in value &&
        'status' in value &&
        'items' in value
    )
}

function isSale(value: unknown): value is Sale {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'paymentMethod' in value &&
        'totalAmount' in value &&
        'items' in value &&
        Array.isArray((value as Sale).items)
    )
}

function isDailySalesSummary(value: unknown): value is DailySalesSummary {
    return (
        typeof value === 'object' &&
        value !== null &&
        'date' in value &&
        'salesCount' in value &&
        'totalSales' in value
    )
}

export function NovaResponseRenderer({
                                         message,
                                         onSendMessage,
                                     }: NovaResponseRendererProps) {
    if (message.role === 'user') {
        return <p className="whitespace-pre-line">{message.content}</p>
    }

    if (message.type === 'confirmation') {
        return (
            <NovaConfirmationCard
                content={message.content}
                onConfirm={() => onSendMessage?.('confirmo', { silent: true })}
                onCancel={() => onSendMessage?.('cancelar', { silent: true })}
            />
        )
    }

    if (message.type === 'error') {
        return (
            <p className="whitespace-pre-line text-red-400">
                {message.content}
            </p>
        )
    }

    if (
        message.type === 'tool_result' &&
        (message.intent === 'search_product' || message.intent === 'list_low_stock') &&
        Array.isArray(message.data)
    ) {
        return (
            <div className="space-y-3">
                <p className="whitespace-pre-line">{message.content}</p>
                <NovaProductsResult products={message.data} />
            </div>
        )
    }

    if (
        message.type === 'tool_result' &&
        message.intent === 'get_dashboard_summary' &&
        message.data
    ) {
        return (
            <div className="space-y-3">
                <p>{message.content}</p>

                <NovaDashboardCard
                    data={message.data as never}
                />
            </div>
        )
    }

    if (
        message.type === 'tool_result' &&
        message.intent === 'create_category' &&
        message.data &&
        typeof message.data === 'object' &&
        !Array.isArray(message.data)
    ) {
        return (
            <div className="space-y-3">
                <p className="whitespace-pre-line">{message.content}</p>

                <NovaCategoryCard
                    category={
                        message.data as {
                            id: number
                            name: string
                            description?: string
                            systemCategory?: boolean
                        }
                    }
                />
            </div>
        )
    }

    if (
        message.type === 'tool_result' &&
        message.intent === 'show_supplier_order' &&
        isSupplierOrder(message.data)
    ) {
        return <NovaSupplierOrderCard order={message.data} />
    }

    if (
        message.type === 'tool_result' &&
        message.intent === 'list_sales' &&
        Array.isArray(message.data)
    ) {
        return (
            <div className="space-y-3">
                <p className="whitespace-pre-line">{message.content}</p>
                <NovaSalesListCard sales={message.data as Sale[]} />
            </div>
        )
    }

    if (
        message.type === 'tool_result' &&
        message.intent === 'show_sale' &&
        isSale(message.data)
    ) {
        return (
            <div className="space-y-3">
                <p className="whitespace-pre-line">{message.content}</p>
                <NovaSaleDetailCard sale={message.data} />
            </div>
        )
    }

    if (
        message.type === 'tool_result' &&
        message.intent === 'get_daily_sales_summary' &&
        isDailySalesSummary(message.data)
    ) {
        return (
            <div className="space-y-3">
                <p className="whitespace-pre-line">{message.content}</p>
                <NovaDailySalesSummaryCard summary={message.data} />
            </div>
        )
    }

    if (
        message.type === 'tool_result' &&
        (message.intent === 'create_product' ||
            message.intent === 'update_product' ||
            message.intent === 'update_stock' ||
            message.intent === 'deactivate_product' ||
            message.intent === 'activate_product' ||
            message.intent === 'create_supplier_order' ||
            message.intent === 'mark_supplier_order_sent' ||
            message.intent === 'complete_supplier_order' ||
            message.intent === 'cancel_supplier_order' ||
            message.intent === 'delete_supplier_order' ||
            message.intent === 'update_supplier_order')
    ) {
        return (
            <NovaActionResultCard
                title="Acción completada"
                description={message.content}
            />
        )
    }

    if (
        (message.intent === 'create_supplier' ||
            message.intent === 'search_supplier' ||
            message.intent === 'update_supplier') &&
        message.data
    ) {
        if (Array.isArray(message.data)) {
            return (
                <div className="space-y-3">
                    <p>{message.content}</p>

                    {message.data.map((supplier) => (
                        <NovaSupplierCard
                            key={supplier.id}
                            data={supplier}
                        />
                    ))}
                </div>
            )
        }

        return <NovaSupplierCard data={message.data} />
    }

    return <p className="whitespace-pre-line">{message.content}</p>
}