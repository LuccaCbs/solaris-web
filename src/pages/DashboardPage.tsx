import { useEffect, useMemo, useState } from 'react'
import { getDashboardSummary } from '../api/dashboardService'
import { getProducts } from '../api/productService'
import { getStockMovements } from '../api/stockMovementService'
import type { DashboardSummary } from '../types/dashboard'
import type { Product } from '../types/product'
import type { StockMovement } from '../types/stockMovement'
import { Link } from 'react-router-dom'

function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [summaryData, productsData, movementsData] = await Promise.all([
                    getDashboardSummary(),
                    getProducts(),
                    getStockMovements(),
                ])

                setSummary(summaryData)
                setProducts(productsData)
                setMovements(movementsData)
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
    }, [])

    const lowStockProducts = useMemo(() => {
        return products.filter((product) => product.lowStock)
    }, [products])

    const recentMovements = useMemo(() => {
        return [...movements]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
    }, [movements])

    if (loading) {
        return <div>Loading dashboard...</div>
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">Solaris Dashboard</h1>

            <p className="mt-2 text-slate-400">
                Real-time business overview from Solaris API.
            </p>

            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <MetricCard title="Products" value={summary?.totalProducts ?? 0} description="Registered items" />
                <MetricCard title="Categories" value={summary?.totalCategories ?? 0} description="Product groups" />
                <MetricCard title="Stock Units" value={summary?.totalStockUnits ?? 0} description="Available units" />
                <MetricCard title="Low Stock" value={lowStockProducts.length} description="Needs attention" />
                <MetricCard title="Movements" value={summary?.totalStockMovements ?? 0} description="Stock operations" />
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                    <h2 className="text-xl font-semibold">Low Stock Products</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Products with 5 units or less.
                    </p>

                    <div className="mt-6 space-y-3">
                        {lowStockProducts.length === 0 ? (
                            <p className="text-sm text-slate-400">
                                No low stock products.
                            </p>
                        ) : (
                            lowStockProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
                                >
                                    <div>
                                        <p className="font-medium text-white">{product.name}</p>
                                        <p className="text-sm text-slate-400">{product.sku}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <span className="rounded-lg bg-red-500/10 px-3 py-1 text-sm text-red-300">
                                        {product.stockQuantity} units
                                      </span>

                                        <Link
                                            to={`/stock-movements/new?productId=${product.id}&type=IN`}
                                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                                        >
                                            Restock
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                    <h2 className="text-xl font-semibold">Recent Stock Movements</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Latest inventory operations.
                    </p>

                    <div className="mt-6 space-y-3">
                        {recentMovements.length === 0 ? (
                            <p className="text-sm text-slate-400">
                                No stock movements yet.
                            </p>
                        ) : (
                            recentMovements.map((movement) => (
                                <div
                                    key={movement.id}
                                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
                                >
                                    <div>
                                        <p className="font-medium text-white">{movement.productName}</p>
                                        <p className="text-sm text-slate-400">
                                            {movement.reason}
                                        </p>
                                    </div>

                                    <div className="text-right">
                    <span className={`rounded-lg px-3 py-1 text-sm ${getTypeStyles(movement.type)}`}>
                      {movement.type}
                    </span>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {movement.previousStock} → {movement.currentStock}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

type MetricCardProps = {
    title: string
    value: number
    description: string
}

function MetricCard({ title, value, description }: MetricCardProps) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
    )
}

function getTypeStyles(type: StockMovement['type']) {
    if (type === 'IN') return 'bg-green-500/10 text-green-300'
    if (type === 'OUT') return 'bg-red-500/10 text-red-300'
    return 'bg-yellow-500/10 text-yellow-300'
}

export default DashboardPage