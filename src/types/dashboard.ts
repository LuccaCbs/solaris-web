export type DashboardMonthlySales = {
    date: string
    salesCount: number
    totalAmount: number
}

export type DashboardSupplierOrders = {
    sent: number
    completed: number
    cancelled: number
}

export type Dashboard = {
    todaySalesCount: number
    todaySalesAmount: number
    lowStockProductsCount: number
    supplierOrders: DashboardSupplierOrders
    monthlySales: DashboardMonthlySales[]
}