import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
    activateCustomer,
    deactivateCustomer,
    getCustomers,
} from '../api/customerService'
import { useAuth } from '../context/AuthContext'
import type { Customer } from '../types/customer'
import { canDeleteCustomers } from '../utils/roleAccess'
import LoadingScreen from '../components/LoadingScreen'

type StatusFilter = 'all' | 'active' | 'inactive'

function CustomersPage() {
    const { t } = useTranslation()
    const { role } = useAuth()
    const canDelete = canDeleteCustomers(role)

    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    async function loadCustomers() {
        try {
            setLoading(true)

            let data: Customer[]

            if (statusFilter === 'all') {
                const [active, inactive] = await Promise.all([
                    getCustomers(true),
                    getCustomers(false),
                ])
                data = [...active, ...inactive]
            } else if (statusFilter === 'inactive') {
                data = await getCustomers(false)
            } else {
                data = await getCustomers(true)
            }

            setCustomers(data)
        } catch {
            toast.error(t('customers.loadError'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadCustomers()
    }, [statusFilter, t])

    async function handleDeactivateCustomer(id: number) {
        const confirmed = window.confirm(t('customers.deactivateConfirm'))

        if (!confirmed) return

        try {
            await deactivateCustomer(id)
            toast.success(t('customers.deactivateSuccess'))
            await loadCustomers()
        } catch {
            toast.error(t('customers.deactivateError'))
        }
    }

    async function handleActivateCustomer(id: number) {
        const confirmed = window.confirm(t('customers.activateConfirm'))

        if (!confirmed) return

        try {
            await activateCustomer(id)
            toast.success(t('customers.activateSuccess'))
            await loadCustomers()
        } catch {
            toast.error(t('customers.activateError'))
        }
    }

    function clearFilters() {
        setSearch('')
        setStatusFilter('all')
        setCurrentPage(1)
    }

    const filteredCustomers = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim()

        return customers
            .filter((customer) => {
                if (!normalizedSearch) return true

                return (
                    customer.razonSocial.toLowerCase().includes(normalizedSearch) ||
                    customer.documentNumber.toLowerCase().includes(normalizedSearch) ||
                    customer.email?.toLowerCase().includes(normalizedSearch) ||
                    customer.phone?.toLowerCase().includes(normalizedSearch)
                )
            })
            .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial))
    }, [customers, search])

    const totalPages = Math.ceil(filteredCustomers.length / pageSize)

    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        {t('customers.title')}
                    </h1>

                    <p className="mt-2 solaris-muted">
                        {t('customers.description')}
                    </p>
                </div>

                <Link
                    to="/customers/new"
                    className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                >
                    {t('customers.newCustomer')}
                </Link>
            </div>

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid gap-3 md:grid-cols-3">
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder={t('customers.searchPlaceholder')}
                        className="solaris-input w-full"
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) => {
                            setStatusFilter(event.target.value as StatusFilter)
                            setCurrentPage(1)
                        }}
                        className="solaris-input w-full"
                    >
                        <option value="all">{t('customers.filters.allStatuses')}</option>
                        <option value="active">{t('customers.filters.activeOnly')}</option>
                        <option value="inactive">{t('customers.filters.inactiveOnly')}</option>
                    </select>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        {t('common.clearFilters')}
                    </button>
                </div>

                <p className="text-sm solaris-muted">
                    {t('customers.results', { count: filteredCustomers.length })}
                </p>
            </div>

            <div className="mt-8 space-y-4 lg:hidden">
                {paginatedCustomers.map((customer) => (
                    <div key={customer.id} className="solaris-panel">
                        <div>
                            <h2 className="font-semibold text-slate-950 dark:text-white">
                                {customer.razonSocial}
                            </h2>

                            <p className="mt-1 text-sm solaris-muted">
                                {customer.documentType}: {customer.documentNumber}
                            </p>

                            <p className="mt-1 text-sm solaris-subtle">
                                {t(`customers.condicionesIva.${customer.condicionIva}`)}
                            </p>

                            {customer.active === false && (
                                <p className="mt-2 text-xs font-semibold text-red-400">
                                    {t('customers.status.inactive')}
                                </p>
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                                to={`/customers/${customer.id}/edit`}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                {t('common.edit')}
                            </Link>

                            {canDelete && customer.active !== false && (
                                <button
                                    onClick={() => handleDeactivateCustomer(customer.id)}
                                    className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                                >
                                    {t('customers.deactivate')}
                                </button>
                            )}

                            {canDelete && customer.active === false && (
                                <button
                                    onClick={() => handleActivateCustomer(customer.id)}
                                    className="rounded-lg border border-emerald-500/30 px-3 py-2 text-sm text-emerald-500 hover:bg-emerald-500/10"
                                >
                                    {t('customers.reactivate')}
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {paginatedCustomers.length === 0 && (
                    <div className="solaris-panel text-center solaris-muted">
                        {t('customers.empty')}
                    </div>
                )}
            </div>

            <div className="solaris-card mt-8 hidden overflow-hidden lg:block">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('customers.table.customer')}
                        </th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('customers.table.document')}
                        </th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('customers.table.condicionIva')}
                        </th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('customers.table.email')}
                        </th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            {t('customers.table.phone')}
                        </th>
                        <th className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                            {t('customers.table.actions')}
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {paginatedCustomers.map((customer) => (
                        <tr
                            key={customer.id}
                            className="border-t border-slate-200 dark:border-slate-800"
                        >
                            <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                                {customer.razonSocial}
                                {customer.active === false && (
                                    <span className="ml-2 text-xs font-semibold text-red-400">
                                        {t('customers.status.inactive')}
                                    </span>
                                )}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {customer.documentType} {customer.documentNumber}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {t(`customers.condicionesIva.${customer.condicionIva}`)}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {customer.email || '-'}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {customer.phone || '-'}
                            </td>

                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Link
                                        to={`/customers/${customer.id}/edit`}
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        {t('common.edit')}
                                    </Link>

                                    {canDelete && customer.active !== false && (
                                        <button
                                            onClick={() => handleDeactivateCustomer(customer.id)}
                                            className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                                        >
                                            {t('customers.deactivate')}
                                        </button>
                                    )}

                                    {canDelete && customer.active === false && (
                                        <button
                                            onClick={() => handleActivateCustomer(customer.id)}
                                            className="rounded-lg border border-emerald-500/30 px-3 py-2 text-sm text-emerald-500 hover:bg-emerald-500/10"
                                        >
                                            {t('customers.reactivate')}
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}

                    {paginatedCustomers.length === 0 && (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-6 py-10 text-center solaris-muted"
                            >
                                {t('customers.empty')}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm solaris-muted">
                        {t('customers.pagination', {
                            currentPage,
                            totalPages,
                            count: filteredCustomers.length,
                        })}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {t('common.previous')}
                        </button>

                        {Array.from({ length: totalPages }).map((_, index) => {
                            const page = index + 1

                            return (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        })}

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((page) => page + 1)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {t('common.next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomersPage
