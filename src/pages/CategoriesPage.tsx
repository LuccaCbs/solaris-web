import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteCategory, getCategories } from '../api/categoryService'
import type { Category } from '../types/category'
import toast from 'react-hot-toast'

type SortField = 'name' | 'description' | 'createdAt'
type SortDirection = 'asc' | 'desc'

function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    async function loadCategories() {
        try {
            const data = await getCategories()
            setCategories(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

    async function handleDeleteCategory(id: number) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this category?'
        )

        if (!confirmed) return

        try {
            await deleteCategory(id)

            toast.success('Category deleted successfully')

            await loadCategories()
        } catch {
            toast.error('Could not delete category')
        }
    }

    function handleSort(field: SortField) {
        if (sortField === field) {
            setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
            return
        }

        setSortField(field)
        setSortDirection('asc')
    }

    const filteredCategories = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim()

        const filtered = categories.filter((category) => {
            const searchableText = [
                category.name,
                category.description,
                category.createdAt,
            ]
                .join(' ')
                .toLowerCase()

            return searchableText.includes(normalizedSearch)
        })

        return filtered.sort((a, b) => {
            const firstValue = a[sortField]
            const secondValue = b[sortField]

            return sortDirection === 'asc'
                ? String(firstValue).localeCompare(String(secondValue))
                : String(secondValue).localeCompare(String(firstValue))
        })
    }, [categories, search, sortField, sortDirection])

    const totalPages = Math.ceil(filteredCategories.length / pageSize)

    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    if (loading) {
        return <CategoriesSkeleton />
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Categories</h1>

                    <p className="mt-2 solaris-muted">
                        Organize products into business categories.
                    </p>
                </div>

                <Link
                    to="/categories/new"
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
                >
                    New Category
                </Link>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
                <input
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value)
                        setCurrentPage(1)
                    }}
                    placeholder="Search by name, description or date..."
                    className="solaris-input w-full sm:w-96"
                />

                <p className="text-sm text-slate-400">
                    {filteredCategories.length} result
                    {filteredCategories.length === 1 ? '' : 's'}
                </p>
            </div>

            <div className="mt-8 space-y-4 lg:hidden">
                {paginatedCategories.map((category) => (
                    <div
                        key={category.id}
                        className="solaris-panel"
                    >
                        <div>
                            <h2 className="font-semibold text-slate-950 dark:text-white">
                                {category.name}
                            </h2>

                            <p className="mt-2 text-sm solaris-muted">
                                {category.description}
                            </p>

                            <p className="mt-3 text-xs solaris-subtle">
                                Created: {new Date(category.createdAt).toLocaleString()}
                            </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                                to={`/categories/${category.id}/edit`}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Edit
                            </Link>

                            <button
                                onClick={() => handleDeleteCategory(category.id)}
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
                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            <SortButton
                                label="Name"
                                field="name"
                                currentField={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            <SortButton
                                label="Description"
                                field="description"
                                currentField={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-600 dark:text-slate-300">
                            <SortButton
                                label="Created At"
                                field="createdAt"
                                currentField={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                        </th>

                        <th className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {paginatedCategories.map((category) => (
                        <tr
                            key={category.id}
                            className="border-t border-slate-200 dark:border-slate-800"
                        >
                            <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                                {category.name}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {category.description}
                            </td>

                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                {new Date(category.createdAt).toLocaleString()}
                            </td>

                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Link
                                        to={`/categories/${category.id}/edit`}
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>

                    ))}
                    {paginatedCategories.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-10 text-center solaris-muted">
                                No categories found for the selected filters.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm solaris-muted">
                        Page {currentPage} of {totalPages} · {filteredCategories.length} categories
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

type SortButtonProps = {
    label: string
    field: SortField
    currentField: SortField
    direction: SortDirection
    onSort: (field: SortField) => void
}

function SortButton({
                        label,
                        field,
                        currentField,
                        direction,
                        onSort,
                    }: SortButtonProps) {
    const isActive = currentField === field

    return (
        <button
            type="button"
            onClick={() => onSort(field)}
            className="flex items-center gap-2 hover:text-white"
        >
            <span>{label}</span>

            <span className="text-xs text-slate-500">
        {isActive ? (direction === 'asc' ? '↑' : '↓') : '↕'}
      </span>
        </button>
    )
}

function CategoriesSkeleton() {
    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-10 w-52 animate-pulse rounded-xl bg-slate-800" />
                    <div className="mt-3 h-5 w-72 animate-pulse rounded-xl bg-slate-800" />
                </div>

                <div className="h-12 w-36 animate-pulse rounded-xl bg-slate-800" />
            </div>

            <div className="mt-8 flex items-center justify-between">
                <div className="h-12 w-96 animate-pulse rounded-xl bg-slate-800" />
                <div className="h-5 w-20 animate-pulse rounded-xl bg-slate-800" />
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="grid grid-cols-4 gap-4 bg-slate-800/50 px-6 py-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-4 animate-pulse rounded-lg bg-slate-700"
                        />
                    ))}
                </div>

                <div className="divide-y divide-slate-800">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-4 gap-4 px-6 py-5"
                        >
                            {Array.from({ length: 4 }).map((_, columnIndex) => (
                                <div
                                    key={columnIndex}
                                    className="h-5 animate-pulse rounded-lg bg-slate-800"
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CategoriesPage