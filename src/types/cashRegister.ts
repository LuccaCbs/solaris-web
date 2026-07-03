export type CashRegisterStatus = 'OPEN' | 'CLOSED'

export type CashRegisterSession = {
    id: number
    storeId?: number | null
    openedAt: string
    closedAt: string | null
    openedBy: string
    closedBy: string | null
    status: CashRegisterStatus
    reopenCount: number
    closingAmount: number

    cashCount: number
    cashAmount: number

    creditCardCount: number
    creditCardAmount: number

    debitCardCount: number
    debitCardAmount: number

    transferCount: number
    transferAmount: number

    otherCount: number
    otherAmount: number
}

export type CashRegisterAuthorizationRequest = {
    adminPassword: string
}