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
import { NovaExportReportCard } from './NovaExportReportCard'
import { NovaSaleDetailCard } from './NovaSaleDetailCard'
import { NovaDailySalesSummaryCard } from './NovaDailySalesSummaryCard'
import { NovaCustomerCard } from './NovaCustomerCard'
import { NovaFiscalDocumentsListCard } from './NovaFiscalDocumentsListCard'
import { NovaFiscalDocumentDetailCard } from './NovaFiscalDocumentDetailCard'
import { NovaActionButtons } from './NovaActionButtons'
import type { DailySalesSummary, Sale } from '../../../types/sales'
import type { Customer } from '../../../types/customer'
import type { FiscalDocument } from '../../../types/fiscal'

interface NovaResponseRendererProps {
    message: NovaMessage
    onSendMessage?: (message: string, options?: { silent?: boolean }) => void
    onShowGuide?: (message: string) => void
    onClosePanel?: () => void
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

function isSalesListResult(
    value: unknown,
): value is { items: Sale[]; totalCount: number; volumeThreshold: number } {
    return (
        typeof value === 'object' &&
        value !== null &&
        'items' in value &&
        Array.isArray((value as { items: unknown }).items)
    )
}

function isSalesExportReport(
    value: unknown,
): value is {
    module: 'sales'
    from: string
    to: string
    sales: Sale[]
    totalCount: number
} {
    return (
        typeof value === 'object' &&
        value !== null &&
        (value as { module?: string }).module === 'sales' &&
        'from' in value &&
        'to' in value &&
        'sales' in value &&
        Array.isArray((value as { sales: unknown }).sales)
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

function isCustomer(value: unknown): value is Customer {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'razonSocial' in value &&
        'documentNumber' in value &&
        'condicionIva' in value
    )
}

function isFiscalDocument(value: unknown): value is FiscalDocument {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'tipoComprobante' in value &&
        'status' in value &&
        'importeTotal' in value
    )
}

function isFiscalDocumentsListResult(
    value: unknown,
): value is { items: FiscalDocument[]; totalCount: number } {
    return (
        typeof value === 'object' &&
        value !== null &&
        'items' in value &&
        Array.isArray((value as { items: unknown }).items)
    )
}

export function NovaResponseRenderer({
                                         message,
                                         onSendMessage,
                                         onShowGuide,
                                         onClosePanel,
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
                <NovaProductsResult
                    products={message.data}
                    intent={message.intent as 'search_product' | 'list_low_stock'}
                />
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
        (Array.isArray(message.data) || isSalesListResult(message.data))
    ) {
        const sales = Array.isArray(message.data)
            ? (message.data as Sale[])
            : message.data.items
        const totalCount = isSalesListResult(message.data)
            ? message.data.totalCount
            : sales.length

        return (
            <div className="space-y-3">
                <p className="whitespace-pre-line">{message.content}</p>
                <NovaSalesListCard sales={sales} totalCount={totalCount} />
            </div>
        )
    }

    if (
        message.type === 'tool_result' &&
        message.intent === 'export_report' &&
        isSalesExportReport(message.data)
    ) {
        return (
            <div className="space-y-3">
                <p className="whitespace-pre-line">{message.content}</p>
                <NovaExportReportCard
                    from={message.data.from}
                    to={message.data.to}
                    sales={message.data.sales}
                />
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
        (message.intent === 'search_customer' || message.intent === 'show_customer') &&
        message.data
    ) {
        if (Array.isArray(message.data)) {
            return (
                <div className="space-y-3">
                    <p className="whitespace-pre-line">{message.content}</p>
                    {(message.data as Customer[]).map((customer) => (
                        <NovaCustomerCard key={customer.id} customer={customer} />
                    ))}
                </div>
            )
        }

        if (isCustomer(message.data)) {
            return (
                <div className="space-y-3">
                    <p className="whitespace-pre-line">{message.content}</p>
                    <NovaCustomerCard customer={message.data} />
                </div>
            )
        }
    }

    if (
        message.type === 'tool_result' &&
        message.intent === 'list_fiscal_documents' &&
        (Array.isArray(message.data) || isFiscalDocumentsListResult(message.data))
    ) {
        const documents = Array.isArray(message.data)
            ? (message.data as FiscalDocument[])
            : message.data.items
        const totalCount = isFiscalDocumentsListResult(message.data)
            ? message.data.totalCount
            : documents.length

        return (
            <div className="space-y-3">
                <p className="whitespace-pre-line">{message.content}</p>
                <NovaFiscalDocumentsListCard
                    documents={documents}
                    totalCount={totalCount}
                />
            </div>
        )
    }

    if (
        message.type === 'tool_result' &&
        message.intent === 'show_fiscal_document' &&
        isFiscalDocument(message.data)
    ) {
        return (
            <div className="space-y-3">
                <p className="whitespace-pre-line">{message.content}</p>
                <NovaFiscalDocumentDetailCard document={message.data} />
            </div>
        )
    }

    if (
        message.type === 'tool_result' &&
        message.intent === 'create_sale' &&
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
        message.intent === 'emit_invoice' &&
        isFiscalDocument(message.data)
    ) {
        return (
            <div className="space-y-3">
                <p className="whitespace-pre-line">{message.content}</p>
                <NovaFiscalDocumentDetailCard document={message.data} />
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

    return (
        <div className="space-y-1">
            <p className="whitespace-pre-line">{message.content}</p>
            {message.actions && message.actions.length > 0 && (
                <NovaActionButtons
                    actions={message.actions}
                    onSendMessage={(text, options) => onSendMessage?.(text, options)}
                    onShowGuide={onShowGuide}
                    onClosePanel={onClosePanel}
                />
            )}
        </div>
    )
}