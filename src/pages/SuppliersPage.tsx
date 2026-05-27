import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { deleteSupplier, getSuppliers } from '../api/supplierService'
import type { Supplier } from '../types/supplier'

type StatusFilter = 'all' | 'active' | 'inactive'

function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    async function loadSuppliers() {
        try {
            const data = await getSuppliers()
            setSuppliers(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSuppliers()
    }, [])

    async function handleDeleteSupplier(id: number) {
        const confirmed = window.confirm('Are you sure you want to delete this supplier?')

        if (!confirmed) return

        try {
            await deleteSupplier(id)
            toast.success('Supplier deleted successfully')
            await loadSuppliers()
        } catch {
            toast.error('Could not delete supplier')
        }
    }

    function clearFilters() {
        setSearch('')
        setStatusFilter('all')
        setCurrentPage(1)
    }

    const filteredSuppliers = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim()

        return suppliers
            .filter((supplier) => {
                const matchesSearch =
                    !normalizedSearch ||
                    supplier.name.toLowerCase().includes(normalizedSearch) ||
                    supplier.contactName?.toLowerCase().includes(normalizedSearch) ||
                    supplier.email?.toLowerCase().includes(normalizedSearch) ||
                    supplier.phone?.toLowerCase().includes(normalizedSearch)

                const matchesStatus =
                    statusFilter === 'all' ||
                    (statusFilter === 'active' && supplier.active) ||
                    (statusFilter === 'inactive' && !supplier.active)

                return matchesSearch && matchesStatus
            })
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [suppliers, search, statusFilter])

    const totalPages = Math.ceil(filteredSuppliers.length / pageSize)

    const paginatedSuppliers = filteredSuppliers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    if (loading) {
        return <SuppliersSkeleton />
    }

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Suppliers</h1>

                    <p className="mt-2 solaris-muted">
                        Manage suppliers used for purchasing and future orders.
                    </p>
                </div>

                <Link
                    to="/suppliers/new"
                    className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                >
                    New Supplier
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
                        placeholder="Search supplier..."
                        className="solaris-input w-full"
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) => {
                            setStatusFilter(event.target.value as StatusFilter)
                            setCurrentPage(1)
                        }}
                        className="solaris-input"
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active only</option>
                        <option value="inactive">Inactive only</option>
                    </select>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        Clear Filters
                    </button>
                </div>

                <p className="text-sm solaris-muted">
                    {filteredSuppliers.length} result
                    {filteredSuppliers.length === 1 ? '' : 's'}
                </p>
            </div>

            <div className="mt-8 space-y-4 lg:hidden">
                {paginatedSuppliers.map((supplier) => (
                    <div key={supplier.id} className="solaris-panel">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-semibold text-slate-950 dark:text-white">
                                    {supplier.name}
                                </h2>

                                <p className="mt-1 text-sm solaris-muted">
                                    {supplier.contactName || 'No contact name'}
                                </p>

                                <p className="mt-1 text-sm solaris-subtle">
                                    {supplier.email || 'No email'}
                                </p>
                            </div>

                            {supplier.active ? (
                                <span className="rounded-lg bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500 dark:text-green-300">
                  ACTIVE
                </span>
                            ) : (
                                <span className="rounded-lg bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-300">
                  INACTIVE
                </span>
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                                to={`/suppliers/${supplier.id}/edit`}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Edit
                            </Link>

                            <button
                                onClick={() => handleDeleteSupplier(supplier.id)}
                                className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="solaris-card mt-8 hidden overflow-hidden lg:block">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Supplier</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Contact</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Email</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Phone</th>
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">Status</th>
                        <th className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-300">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredSuppliers.map((supplier) => (
                        <tr key={supplier.id} className="border-t border-slate-200 dark:border-slate-800">
                            <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                                {supplier.name}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {supplier.contactName || '-'}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {supplier.email || '-'}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {supplier.phone || '-'}
                            </td>

                            <td className="px-6 py-4">
                                {supplier.active ? (
                                    <span className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500 dark:text-green-300">
                      ACTIVE
                    </span>
                                ) : (
                                    <span className="rounded-lg bg-slate-500/10 px-3 py-1 text-sm font-medium text-slate-500 dark:text-slate-300">
                      INACTIVE
                    </span>
                                )}
                            </td>

                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Link
                                        to={`/suppliers/${supplier.id}/edit`}
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => handleDeleteSupplier(supplier.id)}
                                        className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {paginatedSuppliers.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-10 text-center solaris-muted">
                                No suppliers found for the selected filters.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm solaris-muted">
                        Page {currentPage} of {totalPages} · {filteredSuppliers.length} suppliers
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Previous
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
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function SuppliersSkeleton() {
    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-10 w-52 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-3 h-5 w-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="h-12 w-36 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
                <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
        </div>
    )
}

export default SuppliersPage