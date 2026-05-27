import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSaleById } from '../api/salesService'
import type { Sale } from '../types/sales'

function SaleDetailPage() {
    const { id } = useParams()
    const [sale, setSale] = useState<Sale | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadSale() {
            if (!id) return

            try {
                const data = await getSaleById(Number(id))
                setSale(data)
            } finally {
                setLoading(false)
            }
        }

        loadSale()
    }, [id])

    if (loading) {
        return <div>Loading sale...</div>
    }

    if (!sale) {
        return <div>Sale not found.</div>
    }

    return (
        <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Sale #{sale.id}</h1>

                    <p className="mt-2 solaris-muted">
                        {new Date(sale.createdAt).toLocaleString()}
                    </p>
                </div>

                <Link
                    to="/sales"
                    className="rounded-xl border border-slate-300 px-5 py-3 text-center text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    Back to Sales
                </Link>
            </div>

            <section className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">Payment Method</p>
                    <p className="mt-3 text-2xl font-bold">{sale.paymentMethod}</p>
                </div>

                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">Items</p>
                    <p className="mt-3 text-2xl font-bold">{sale.items.length}</p>
                </div>

                <div className="solaris-panel">
                    <p className="text-sm solaris-muted">Total</p>
                    <p className="mt-3 text-2xl font-bold">${sale.totalAmount}</p>
                </div>
            </section>

            <div className="solaris-card mt-8 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            Product
                        </th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            Quantity
                        </th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            Unit Price
                        </th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            Subtotal
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {sale.items.map((item) => (
                        <tr
                            key={item.id}
                            className="border-t border-slate-200 dark:border-slate-800"
                        >
                            <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                                {item.productName}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {item.quantity}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                ${item.unitPrice}
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-950 dark:text-white">
                                ${item.subtotal}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SaleDetailPage