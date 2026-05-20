import { useEffect, useState } from 'react'
import { getStockMovements } from '../api/stockMovementService'
import type { StockMovement } from '../types/stockMovement'
import { Link } from 'react-router-dom'

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
        return <div>Loading stock movements...</div>
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Stock Movements</h1>

                    <p className="mt-2 text-slate-400">
                        Track inventory entries, exits and adjustments.
                    </p>
                </div>

                <Link
                    to="/stock-movements/new"
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
                >
                    New Movement
                </Link>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full">
                    <thead className="bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-300">Product</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-300">Type</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-300">Quantity</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-300">Previous</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-300">Current</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-300">Reason</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-300">Date</th>
                    </tr>
                    </thead>

                    <tbody>
                    {movements.map((movement) => (
                        <tr key={movement.id} className="border-t border-slate-800">
                            <td className="px-6 py-4 font-medium text-white">
                                {movement.productName}
                            </td>

                            <td className="px-6 py-4">
                  <span className={`rounded-lg px-3 py-1 text-sm ${getTypeStyles(movement.type)}`}>
                    {movement.type}
                  </span>
                            </td>

                            <td className="px-6 py-4 text-slate-300">
                                {movement.quantity}
                            </td>

                            <td className="px-6 py-4 text-slate-300">
                                {movement.previousStock}
                            </td>

                            <td className="px-6 py-4 text-slate-300">
                                {movement.currentStock}
                            </td>

                            <td className="px-6 py-4 text-slate-300">
                                {movement.reason}
                            </td>

                            <td className="px-6 py-4 text-slate-400">
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
    if (type === 'IN') return 'bg-green-500/10 text-green-300'
    if (type === 'OUT') return 'bg-red-500/10 text-red-300'
    return 'bg-yellow-500/10 text-yellow-300'
}

export default StockMovementsPage