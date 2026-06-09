import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { getDashboard } from '../api/dashboardService'
import type { Dashboard } from '../types/dashboard'
import LoadingScreen from '../components/LoadingScreen'

type SupplierOrderDashboardFilter = 'SENT' | 'COMPLETED' | 'CANCELLED'

function DashboardPage() {
    const navigate = useNavigate()

    const [dashboard, setDashboard] = useState<Dashboard | null>(null)
    const [loading, setLoading] = useState(true)
    const [supplierOrderFilter, setSupplierOrderFilter] =
        useState<SupplierOrderDashboardFilter>('SENT')

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true)

                const data = await getDashboard()
                setDashboard(data)
            } catch {
                toast.error('Could not load dashboard')
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
    }, [])

    const monthlySalesData = useMemo(() => {
        if (!dashboard) return []

        return dashboard.monthlySales.map((item) => ({
            date: item.date.slice(8, 10),
            fullDate: item.date,
            totalAmount: item.totalAmount,
            salesCount: item.salesCount,
        }))
    }, [dashboard])

    const monthlySalesSummary = useMemo(() => {
        if (!dashboard) {
            return {
                salesCount: 0,
                totalAmount: 0,
            }
        }

        return dashboard.monthlySales.reduce(
            (summary, item) => ({
                salesCount: summary.salesCount + item.salesCount,
                totalAmount: summary.totalAmount + item.totalAmount,
            }),
            {
                salesCount: 0,
                totalAmount: 0,
            }
        )
    }, [dashboard])

    const selectedSupplierOrdersCount = useMemo(() => {
        if (!dashboard) return 0

        if (supplierOrderFilter === 'SENT') return dashboard.supplierOrders.sent
        if (supplierOrderFilter === 'COMPLETED') return dashboard.supplierOrders.completed

        return dashboard.supplierOrders.cancelled
    }, [dashboard, supplierOrderFilter])

    function goToSales() {
        navigate('/sales')
    }

    function goToLowStockProducts() {
        navigate('/products?stock=low')
    }

    function goToSupplierOrders() {
        navigate(`/supplier-orders?status=${supplierOrderFilter}`)
    }

    function formatDateInputValue(date: Date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    function goToMonthlySales() {
        const now = new Date()

        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        navigate(
            `/sales?from=${formatDateInputValue(firstDay)}&to=${formatDateInputValue(lastDay)}`
        )
    }

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div>
            <div>
                <h1 className="text-4xl font-bold">Solaris Dashboard</h1>

                <p className="mt-2 solaris-muted">
                    Quick overview of sales, stock alerts and supplier orders.
                </p>
            </div>

            <section className="mt-8 grid gap-4 lg:grid-cols-4">
                <button
                    type="button"
                    onClick={goToMonthlySales}
                    className="solaris-panel text-left transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                    <p className="text-sm solaris-muted">Monthly Sales</p>

                    <div className="mt-4 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-4xl font-bold">
                                {monthlySalesSummary.salesCount}
                            </p>
                            <p className="mt-1 text-sm solaris-subtle">sales</p>
                        </div>

                        <div className="text-right">
                            <p className="text-3xl font-bold text-emerald-500 dark:text-emerald-300">
                                ${monthlySalesSummary.totalAmount.toFixed(2)}
                            </p>
                            <p className="mt-1 text-sm solaris-subtle">income</p>
                        </div>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={goToSales}
                    className="solaris-panel text-left transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                    <p className="text-sm solaris-muted">Today Sales</p>

                    <div className="mt-4 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-4xl font-bold">
                                {dashboard?.todaySalesCount ?? 0}
                            </p>
                            <p className="mt-1 text-sm solaris-subtle">sales</p>
                        </div>

                        <div className="text-right">
                            <p className="text-3xl font-bold text-emerald-500 dark:text-emerald-300">
                                ${(dashboard?.todaySalesAmount ?? 0).toFixed(2)}
                            </p>
                            <p className="mt-1 text-sm solaris-subtle">income</p>
                        </div>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={goToLowStockProducts}
                    className="solaris-panel text-left transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                    <p className="text-sm solaris-muted">Low Stock Products</p>

                    <p className="mt-4 text-4xl font-bold text-red-500 dark:text-red-300">
                        {dashboard?.lowStockProductsCount ?? 0}
                    </p>

                    <p className="mt-2 text-sm solaris-subtle">
                        products need restock
                    </p>
                </button>

                <div className="solaris-panel">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm solaris-muted">Supplier Orders</p>
                            <p className="mt-4 text-4xl font-bold">
                                {selectedSupplierOrdersCount}
                            </p>
                        </div>

                        <select
                            value={supplierOrderFilter}
                            onChange={(event) =>
                                setSupplierOrderFilter(
                                    event.target.value as SupplierOrderDashboardFilter
                                )
                            }
                            className="solaris-input w-40"
                        >
                            <option value="SENT">Sent</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={goToSupplierOrders}
                        className="mt-6 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                        View filtered orders
                    </button>
                </div>
            </section>

            <section className="solaris-panel mt-8">
                <h2 className="text-xl font-semibold">Monthly Sales Overview</h2>

                <p className="mt-1 text-sm solaris-muted">
                    Daily income and sales count for the current month.
                </p>

                <div className="mt-6 h-[520px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={monthlySalesData}
                            margin={{ top: 10, right: 24, left: 8, bottom: 8 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-slate-200 dark:stroke-slate-800"
                            />

                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                className="fill-slate-500"
                            />

                            <YAxis
                                yAxisId="amount"
                                tick={{ fontSize: 12 }}
                                className="fill-slate-500"
                            />

                            <YAxis
                                yAxisId="count"
                                orientation="right"
                                tick={{ fontSize: 12 }}
                                className="fill-slate-500"
                            />

                            <Tooltip
                                formatter={(value, name) => {
                                    if (name === 'totalAmount') {
                                        return [`$${Number(value).toFixed(2)}`, 'Income']
                                    }

                                    return [value, 'Sales']
                                }}
                                labelFormatter={(label, payload) => {
                                    const item = payload?.[0]?.payload
                                    return item?.fullDate ?? `Day ${label}`
                                }}
                                contentStyle={{
                                    backgroundColor: '#020617',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    color: '#ffffff',
                                }}
                            />

                            <Bar
                                yAxisId="amount"
                                dataKey="totalAmount"
                                name="Income"
                                radius={[8, 8, 0, 0]}
                                fill="#2563eb"
                            />

                            <Bar
                                yAxisId="count"
                                dataKey="salesCount"
                                name="Sales"
                                radius={[8, 8, 0, 0]}
                                fill="#22c55e"
                                barSize={14}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    )
}

export default DashboardPage