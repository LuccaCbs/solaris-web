import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { deleteCategory, getCategories } from '../api/categoryService'
import type { Category } from '../types/category'
import toast from 'react-hot-toast'
import LoadingScreen from '../components/LoadingScreen'

type SortField = 'name' | 'description' | 'createdAt'
type SortDirection = 'asc' | 'desc'

function CategoriesPage() {
    const { t } = useTranslation()

    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    async function loadCategories() {
        try {
            setLoading(true)
            const data = await getCategories()
            setCategories(data)
        } catch {
            toast.error(t('categories.loadError'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [t])

    async function handleDeleteCategory(id: number) {
        const confirmed = window.confirm(t('categories.deleteConfirm'))

        if (!confirmed) return

        try {
            await deleteCategory(id)
            toast.success(t('categories.deleteSuccess'))
            await loadCategories()
        } catch {
            toast.error(t('categories.deleteError'))
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
        return <LoadingScreen />
    }

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        {t('categories.title')}
                    </h1>

                    <p className="mt-2 solaris-muted">
                        {t('categories.description')}
                    </p>
                </div>

                <Link
                    to="/categories/new"
                    className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                >
                    {t('categories.newCategory')}
                </Link>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <input
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value)
                        setCurrentPage(1)
                    }}
                    placeholder={t('categories.searchPlaceholder')}
                    className="solaris-input w-full sm:w-96"
                />

                <p className="text-sm solaris-muted">
                    {t('categories.results', { count: filteredCategories.length })}
                </p>
            </div>

            <div className="mt-8 space-y-4 lg:hidden">
                {paginatedCategories.map((category) => (
                    <div key={category.id} className="solaris-panel">
                        <div>
                            <h2 className="font-semibold text-slate-950 dark:text-white">
                                {category.name}
                            </h2>

                            <p className="mt-2 text-sm solaris-muted">
                                {category.description}
                            </p>

                            <p className="mt-3 text-xs solaris-subtle">
                                {t('categories.created')}: {new Date(category.createdAt).toLocaleString()}
                            </p>
                        </div>

                        {!category.systemCategory && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Link
                                    to={`/categories/${category.id}/edit`}
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    {t('categories.actions.edit')}
                                </Link>

                                <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 hover:bg-red-500/20 dark:text-red-400"
                                >
                                    {t('categories.actions.delete')}
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {paginatedCategories.length === 0 && (
                    <div className="solaris-panel text-center solaris-muted">
                        {t('categories.empty')}
                    </div>
                )}
            </div>

            <div className="solaris-card mt-8 hidden overflow-hidden lg:block">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm solaris-muted">
                            <SortButton
                                label={t('categories.table.name')}
                                field="name"
                                currentField={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                        </th>

                        <th className="px-6 py-4 text-left text-sm solaris-muted">
                            <SortButton
                                label={t('categories.table.description')}
                                field="description"
                                currentField={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                        </th>

                        <th className="px-6 py-4 text-left text-sm solaris-muted">
                            <SortButton
                                label={t('categories.table.createdAt')}
                                field="createdAt"
                                currentField={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                        </th>

                        <th className="px-6 py-4 text-right text-sm solaris-muted">
                            {t('categories.table.actions')}
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

                            <td className="px-6 py-4 solaris-muted">
                                {new Date(category.createdAt).toLocaleString()}
                            </td>

                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    {!category.systemCategory && (
                                        <>
                                            <Link
                                                to={`/categories/${category.id}/edit`}
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                            >
                                                {t('categories.actions.edit')}
                                            </Link>

                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 hover:bg-red-500/20 dark:text-red-400"
                                            >
                                                {t('categories.actions.delete')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}

                    {paginatedCategories.length === 0 && (
                        <tr>
                            <td
                                colSpan={4}
                                className="px-6 py-10 text-center solaris-muted"
                            >
                                {t('categories.empty')}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="solaris-panel mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm solaris-muted">
                        {t('categories.pagination', {
                            currentPage,
                            totalPages,
                            count: filteredCategories.length,
                        })}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {t('categories.previous')}
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
                            {t('categories.next')}
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
            className="flex items-center gap-2 hover:text-slate-950 dark:hover:text-white"
        >
            <span>{label}</span>

            <span className="text-xs solaris-subtle">
                {isActive ? (direction === 'asc' ? '↑' : '↓') : '↕'}
            </span>
        </button>
    )
}

export default CategoriesPage