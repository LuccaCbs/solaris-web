import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteCategory, getCategories } from '../api/categoryService'
import type { Category } from '../types/category'

type SortField = 'name' | 'description' | 'createdAt'
type SortDirection = 'asc' | 'desc'

function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

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

        await deleteCategory(id)
        await loadCategories()
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

    if (loading) {
        return <div>Loading categories...</div>
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Categories</h1>

                    <p className="mt-2 text-slate-400">
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
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, description or date..."
                    className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                <p className="text-sm text-slate-400">
                    {filteredCategories.length} result
                    {filteredCategories.length === 1 ? '' : 's'}
                </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full">
                    <thead className="bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <SortButton
                                label="Name"
                                field="name"
                                currentField={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <SortButton
                                label="Description"
                                field="description"
                                currentField={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <SortButton
                                label="Created At"
                                field="createdAt"
                                currentField={sortField}
                                direction={sortDirection}
                                onSort={handleSort}
                            />
                        </th>

                        <th className="px-6 py-4 text-right text-sm text-slate-300">
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredCategories.map((category) => (
                        <tr key={category.id} className="border-t border-slate-800">
                            <td className="px-6 py-4 font-medium text-white">
                                {category.name}
                            </td>

                            <td className="px-6 py-4 text-slate-300">
                                {category.description}
                            </td>

                            <td className="px-6 py-4 text-slate-400">
                                {new Date(category.createdAt).toLocaleString()}
                            </td>

                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Link
                                        to={`/categories/${category.id}/edit`}
                                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
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

export default CategoriesPage