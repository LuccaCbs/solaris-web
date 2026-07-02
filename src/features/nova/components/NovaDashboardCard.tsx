interface NovaDashboardData {
    todaySalesCount: number
    todaySalesAmount: number
    lowStockProductsCount: number
    supplierOrders: {
        sent: number
        completed: number
        cancelled: number
    }
}

interface NovaDashboardCardProps {
    data: NovaDashboardData
}

export function NovaDashboardCard({ data }: NovaDashboardCardProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="solaris-card p-3">
                <p className="text-xs solaris-muted">Ventas hoy</p>
                <p className="text-xl font-bold">
                    {data.todaySalesCount}
                </p>
            </div>

            <div className="solaris-card p-3">
                <p className="text-xs solaris-muted">Monto vendido</p>
                <p className="text-xl font-bold">
                    ${data.todaySalesAmount}
                </p>
            </div>

            <div className="solaris-card p-3">
                <p className="text-xs solaris-muted">Bajo stock</p>
                <p className="text-xl font-bold">
                    {data.lowStockProductsCount}
                </p>
            </div>

            <div className="solaris-card p-3">
                <p className="text-xs solaris-muted">
                    Órdenes proveedor
                </p>

                <div className="mt-2 text-xs space-y-1">
                    <div>Enviadas: {data.supplierOrders.sent}</div>
                    <div>Completadas: {data.supplierOrders.completed}</div>
                    <div>Canceladas: {data.supplierOrders.cancelled}</div>
                </div>
            </div>
        </div>
    )
}