import { useEffect, useMemo, useState } from 'react'
import { getDashboardSummary } from '../api/dashboardService'
import { getProducts } from '../api/productService'
import { getStockMovements } from '../api/stockMovementService'
import type { DashboardSummary } from '../types/dashboard'
import type { Product } from '../types/product'
import type { StockMovement } from '../types/stockMovement'
import { Link } from 'react-router-dom'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

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

    const stockByProductData = useMemo(() => {
        return products.map((product) => ({
            name: product.name,
            stock: product.stockQuantity,
            lowStock: product.lowStock,
        }))
    }, [products])

    const movementsByTypeData = useMemo(() => {
        const counts = movements.reduce(
            (acc, movement) => {
                acc[movement.type] += 1
                return acc
            },
            { IN: 0, OUT: 0, ADJUSTMENT: 0 }
        )

        return [
            { name: 'IN', value: counts.IN },
            { name: 'OUT', value: counts.OUT },
            { name: 'ADJUSTMENT', value: counts.ADJUSTMENT },
        ]
    }, [movements])

    if (loading) {
        return <DashboardSkeleton />
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">Solaris Dashboard</h1>

            <p className="mt-2 solaris-muted">
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
                <div className="solaris-panel">    <h2 className="text-xl font-semibold">Stock by Product</h2>
                    <p className="mt-1 text-sm solaris-muted">
                        Current inventory units by product.
                    </p>

                    <div className="mt-6 h-96 overflow-y-auto overflow-x-hidden pr-2">
                        <div
                            style={{
                                height: Math.max(stockByProductData.length * 52, 320),
                                width: '100%',
                            }}
                        >
                            <BarChart
                                layout="vertical"
                                width={620}
                                height={Math.max(stockByProductData.length * 52, 320)}
                                data={stockByProductData}
                                margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                                <XAxis
                                    type="number"
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                />

                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                    width={170}
                                />

                                <Tooltip
                                    formatter={(value) => [`${value} units`, 'Stock']}
                                    labelFormatter={(label) => `Product: ${label}`}
                                    contentStyle={{
                                        backgroundColor: '#020617',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        color: '#ffffff',
                                    }}
                                />

                                <Bar dataKey="stock" radius={[0, 8, 8, 0]}>
                                    {stockByProductData.map((entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={entry.lowStock ? '#ef4444' : '#2563eb'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </div>
                    </div>
                </div>

                <div className="solaris-panel">
                    <h2 className="text-xl font-semibold">Movements by Type</h2>
                    <p className="mt-1 text-sm solaris-muted">
                        Distribution of inventory operations.
                    </p>

                    <div className="mt-6 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={movementsByTypeData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={4}
                                >
                                    {movementsByTypeData.map((entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={
                                                entry.name === 'IN'
                                                    ? '#22c55e'
                                                    : entry.name === 'OUT'
                                                        ? '#ef4444'
                                                        : '#eab308'
                                            }
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value} units`, 'Stock']}
                                    labelFormatter={(label) => `Product: ${label}`}
                                    contentStyle={{
                                        backgroundColor: '#020617',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        color: '#ffffff',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-2">
                <div className="solaris-panel">
                    <h2 className="text-xl font-semibold">Low Stock Products</h2>
                    <p className="mt-1 text-sm solaris-muted">
                        Products below their configured low stock threshold.
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
                                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
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

                <div className="solaris-panel">
                    <h2 className="text-xl font-semibold">Recent Stock Movements</h2>
                    <p className="mt-1 text-sm solaris-muted">
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
                                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
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

                                        <p className="mt-1 text-sm solaris-muted">
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
        <div className="solaris-panel">
            <p className="text-sm solaris-muted">{title}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
            <p className="mt-2 text-sm solaris-subtle">{description}</p>
        </div>
    )
}

function getTypeStyles(type: StockMovement['type']) {
    if (type === 'IN') return 'bg-green-500/10 text-green-300'
    if (type === 'OUT') return 'bg-red-500/10 text-red-300'
    return 'bg-yellow-500/10 text-yellow-300'
}

function DashboardSkeleton() {
    return (
        <div>
            <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-800" />
            <div className="mt-3 h-5 w-96 animate-pulse rounded-xl bg-slate-800" />

            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="solaris-panel"
                    >
                        <div className="h-4 w-24 animate-pulse rounded-lg bg-slate-800" />
                        <div className="mt-4 h-8 w-16 animate-pulse rounded-lg bg-slate-800" />
                        <div className="mt-3 h-4 w-32 animate-pulse rounded-lg bg-slate-800" />
                    </div>
                ))}
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                    <div
                        key={index}
                        className="solaris-panel"
                    >
                        <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-800" />
                        <div className="mt-3 h-4 w-72 animate-pulse rounded-lg bg-slate-800" />
                        <div className="mt-6 h-80 animate-pulse rounded-2xl bg-slate-800" />
                    </div>
                ))}
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                    <div
                        key={index}
                        className="solaris-panel"
                    >
                        <div className="h-6 w-56 animate-pulse rounded-lg bg-slate-800" />
                        <div className="mt-3 h-4 w-72 animate-pulse rounded-lg bg-slate-800" />

                        <div className="mt-6 space-y-3">
                            {Array.from({ length: 4 }).map((_, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className="h-16 animate-pulse rounded-xl border border-slate-800 bg-slate-950"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    )
}

export default DashboardPage