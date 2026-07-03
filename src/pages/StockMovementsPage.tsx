import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getStockMovements } from '../api/stockMovementService'
import type { StockMovement } from '../types/stockMovement'
import { exportStockMovements } from '../utils/exportStockMovements'
import LoadingScreen from '../components/LoadingScreen'

function StockMovementsPage() {
    const { t } = useTranslation()

    const [movements, setMovements] = useState<StockMovement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadMovements() {
            try {
                setLoading(true)

                const data = await getStockMovements()
                setMovements(data)
            } catch {
                toast.error(t('stockMovements.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadMovements()
    }, [t])

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        {t('stockMovements.title')}
                    </h1>

                    <p className="mt-2 solaris-muted">
                        {t('stockMovements.description')}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        to="/stock/restock"
                        className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-500"
                    >
                        {t('stockMovements.quickRestock')}
                    </Link>

                    <button
                        type="button"
                        onClick={() => exportStockMovements(movements)}
                        className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/20 dark:text-emerald-300"
                    >
                        {t('stockMovements.exportExcel')}
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

                            <TypeBadge type={movement.type} />
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                            <InfoBox
                                label={t('stockMovements.table.quantity')}
                                value={String(movement.quantity)}
                            />

                            <InfoBox
                                label={t('stockMovements.table.previous')}
                                value={String(movement.previousStock)}
                            />

                            <InfoBox
                                label={t('stockMovements.table.current')}
                                value={String(movement.currentStock)}
                            />
                        </div>

                        <p className="mt-4 text-xs solaris-subtle">
                            {new Date(movement.createdAt).toLocaleString()}
                        </p>
                    </div>
                ))}

                {movements.length === 0 && (
                    <div className="solaris-panel text-center solaris-muted">
                        {t('stockMovements.empty')}
                    </div>
                )}
            </div>

            <div className="solaris-card mt-8 hidden overflow-hidden lg:block">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('stockMovements.table.product')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('stockMovements.table.type')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('stockMovements.table.quantity')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('stockMovements.table.previous')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('stockMovements.table.current')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('stockMovements.table.reason')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('stockMovements.table.date')}
                        </th>
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
                                <TypeBadge type={movement.type} />
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

                    {movements.length === 0 && (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-6 py-10 text-center solaris-muted"
                            >
                                {t('stockMovements.empty')}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

type InfoBoxProps = {
    label: string
    value: string
}

function InfoBox({ label, value }: InfoBoxProps) {
    return (
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
            <p className="solaris-subtle">
                {label}
            </p>

            <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    )
}

type TypeBadgeProps = {
    type: StockMovement['type']
}

function TypeBadge({ type }: TypeBadgeProps) {
    const { t } = useTranslation()

    return (
        <span className={`rounded-lg px-3 py-1 text-xs font-medium lg:text-sm ${getTypeStyles(type)}`}>
            {t(`stockMovements.types.${type.toLowerCase()}`)}
        </span>
    )
}

function getTypeStyles(type: StockMovement['type']) {
    if (type === 'IN') return 'bg-green-500/10 text-green-500 dark:text-green-300'
    if (type === 'OUT') return 'bg-red-500/10 text-red-500 dark:text-red-300'

    return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-300'
}

export default StockMovementsPage