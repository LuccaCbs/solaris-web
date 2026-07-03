export type DashboardMonthlySales = {
    date: string
    salesCount: number
    totalAmount: number
}

export type DashboardSupplierOrders = {
    draft: number
    sent: number
    completed: number
    cancelled: number
}

export type DashboardCashRegister = {
    open: boolean
    sessionId: number | null
    openedAt: string | null
    openedBy: string | null
}

export type DashboardAlerts = {
    draftSupplierOrders: number
    sentSupplierOrders: number
    rejectedFiscalDocumentsToday: number
    inactiveProducts: number
}

export type DashboardSalesComparison = {
    yesterdaySalesCount: number
    yesterdaySalesAmount: number
    currentMonthSalesCount: number
    currentMonthSalesAmount: number
    previousMonthSalesCount: number
    previousMonthSalesAmount: number
}

export type DashboardTopProduct = {
    productId: number
    productName: string
    quantitySold: number
    totalAmount: number
}

export type DashboardRecentSale = {
    id: number
    totalAmount: number
    paymentMethod: string
    createdAt: string
    itemCount: number
}

export type Dashboard = {
    todaySalesCount: number
    todaySalesAmount: number
    lowStockProductsCount: number
    supplierOrders: DashboardSupplierOrders
    monthlySales: DashboardMonthlySales[]
    cashRegister: DashboardCashRegister
    alerts: DashboardAlerts
    comparison: DashboardSalesComparison
    topProducts: DashboardTopProduct[]
    recentSales: DashboardRecentSale[]
}
