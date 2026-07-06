import type { OrganizationRole } from '../../../types/auth'
import type { ModuleCode } from '../../../types/subscription'

export type NovaResponseType =
    | 'message'
    | 'confirmation'
    | 'tool_result'
    | 'error';

export type NovaUiActionType = 'navigate' | 'send_message' | 'show_guide'

export interface NovaUiAction {
    id: string
    label: string
    type: NovaUiActionType
    to?: string
    message?: string
    requiredModule?: ModuleCode
    minimumRole?: OrganizationRole
}

export type NovaQuickActionMode = 'navigate' | 'execute' | 'guide' | 'hybrid'

export interface NovaQuickActionDefinition {
    id: string
    groupKey: string
    labelKey: string
    helpKey?: string
    guideKey?: string
    executeMessageKey?: string
    navigateTo?: string
    mode: NovaQuickActionMode
    requiredModule?: ModuleCode
    minimumRole?: OrganizationRole
    onboarding?: boolean
}

export type NovaIntent =
    | 'search_product'
    | 'create_product'
    | 'update_product'
    | 'deactivate_product'
    | 'activate_product'
    | 'update_stock'
    | 'list_low_stock'
    | 'get_dashboard_summary'
    | 'create_category'
    | 'create_supplier'
    | 'search_supplier'
    | 'update_supplier'
    | 'delete_supplier'
    | 'create_supplier_order'
    | 'mark_supplier_order_sent'
    | 'complete_supplier_order'
    | 'cancel_supplier_order'
    | 'delete_supplier_order'
    | 'update_supplier_order'
    | 'show_supplier_order'
    | 'list_sales'
    | 'show_sale'
    | 'get_daily_sales_summary'
    | 'export_report'
    | 'search_customer'
    | 'show_customer'
    | 'list_fiscal_documents'
    | 'show_fiscal_document'
    | 'create_sale'
    | 'emit_invoice'
    | 'unknown'

export interface NovaMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type?: NovaResponseType;
    data?: unknown;
    intent?: NovaIntent;
    actions?: NovaUiAction[];
}

export interface NovaChatRequest {
    message: string;
}

export interface NovaChatResponse {
    type: NovaResponseType;
    message: string;
    intent?: NovaIntent;
    data?: unknown;
    actions?: NovaUiAction[];
}

export type NovaActionEventType =
    | 'create_product'
    | 'update_product'
    | 'deactivate_product'
    | 'activate_product'
    | 'update_stock'
    | 'create_category'
    | 'create_supplier'
    | 'create_supplier_order'
    | 'mark_supplier_order_sent'
    | 'complete_supplier_order'
    | 'cancel_supplier_order'
    | 'delete_supplier_order'
    | 'update_supplier_order'
    | 'show_supplier_order'
    | 'create_sale'
    | 'emit_invoice'

export interface NovaActionEvent {
    id: string
    type: NovaActionEventType
    title: string
    description: string
    createdAt: Date
}