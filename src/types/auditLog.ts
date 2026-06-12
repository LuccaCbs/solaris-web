export type AuditAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'REGISTER_USER'
    | 'LOGIN'
    | 'LOGOUT'
    | 'OPEN_CASH_REGISTER'
    | 'CLOSE_CASH_REGISTER'
    | 'REOPEN_CASH_REGISTER'
    | 'CREATE_SALE'
    | 'CREATE_SUPPLIER_ORDER'
    | 'COMPLETE_SUPPLIER_ORDER'
    | 'CANCEL_SUPPLIER_ORDER'
    | 'UPDATE_SETTINGS'

export type AuditEntityType =
    | 'PRODUCT'
    | 'CATEGORY'
    | 'SUPPLIER'
    | 'SALE'
    | 'CASH_REGISTER'
    | 'SUPPLIER_ORDER'
    | 'SYSTEM_SETTINGS'
    | 'USER'

export type AuditLog = {
    id: number
    action: AuditAction
    entityType: AuditEntityType
    entityId: number | null
    entityName: string | null
    description: string
    userId: number | null
    userEmail: string | null
    userName: string | null
    createdAt: string
}