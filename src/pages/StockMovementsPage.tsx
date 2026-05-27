import { useEffect, useState } from 'react'
import { getStockMovements } from '../api/stockMovementService'
import type { StockMovement } from '../types/stockMovement'
import { Link } from 'react-router-dom'
import { exportStockMovements } from '../utils/exportStockMovements'

function StockMovementsPage() {
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadMovements() {
            try {
                const data = await getStockMovements()
                setMovements(data)
            } finally {
                setLoading(false)
            }
        }

        loadMovements()
    }, [])

    if (loading) {
        return <StockMovementsSkeleton />
    }

    return (
        <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Stock Movements</h1>

                    <p className="mt-2 solaris-muted">
                        Track inventory entries, exits and adjustments.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        to="/stock-movements/new"
                        className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                    >
                        New Movement
                    </Link>

                    <button
                        onClick={() => exportStockMovements(movements)}
                        className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/20 dark:text-emerald-300"
                    >
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="mt-8 space-y-4 lg:hidden">
                {movements.map((movement) => (
                    <div key={movement.id} className="solaris-panel">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-semibold text-slate-950 dark:text-white">
                                    {movement.productName}
                                </h2>

                                <p className="mt-2 text-sm solaris-muted">
                                    {movement.reason}
                                </p>
                            </div>

                            <span className={`rounded-lg px-3 py-1 text-xs font-medium ${getTypeStyles(movement.type)}`}>
                {movement.type}
              </span>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                                <p className="solaris-subtle">Quantity</p>
                                <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                                    {movement.quantity}
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                                <p className="solaris-subtle">Previous</p>
                                <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                                    {movement.previousStock}
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                                <p className="solaris-subtle">Current</p>
                                <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                                    {movement.currentStock}
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 text-xs solaris-subtle">
                            {new Date(movement.createdAt).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            <div className="solaris-card mt-8 hidden overflow-hidden lg:block">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Product</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Type</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Quantity</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Previous</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Current</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Reason</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Date</th>
                    </tr>
                    </thead>

                    <tbody>
                    {movements.map((movement) => (
                        <tr
                            key={movement.id}
                            className="border-t border-slate-200 dark:border-slate-800"
                        >
                            <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                                {movement.productName}
                            </td>

                            <td className="px-6 py-4">
                  <span className={`rounded-lg px-3 py-1 text-sm ${getTypeStyles(movement.type)}`}>
                    {movement.type}
                  </span>
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {movement.quantity}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {movement.previousStock}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {movement.currentStock}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {movement.reason}
                            </td>

                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                {new Date(movement.createdAt).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function getTypeStyles(type: StockMovement['type']) {
    if (type === 'IN') return 'bg-green-500/10 text-green-500 dark:text-green-300'
    if (type === 'OUT') return 'bg-red-500/10 text-red-500 dark:text-red-300'
    return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-300'
}

function StockMovementsSkeleton() {
    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-3 h-5 w-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="h-12 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="grid grid-cols-7 gap-4 bg-slate-100 px-6 py-4 dark:bg-slate-800/50">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-4 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
                        />
                    ))}
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div key={index} className="grid grid-cols-7 gap-4 px-6 py-5">
                            {Array.from({ length: 7 }).map((_, columnIndex) => (
                                <div
                                    key={columnIndex}
                                    className="h-5 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default StockMovementsPage