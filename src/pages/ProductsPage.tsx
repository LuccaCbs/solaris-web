import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { Product } from '../types/product'
import type { Category } from '../types/category'
import { deleteProduct, getProducts } from '../api/productService'
import { getCategories } from '../api/categoryService'
import { useTranslation } from 'react-i18next'

type SortField = 'name' | 'sku' | 'categoryName' | 'price' | 'stockQuantity'
type SortDirection = 'asc' | 'desc'
type StockStatusFilter = 'all' | 'low' | 'normal'

function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams()

    const initialStockFilter =
        searchParams.get('stock') === 'low' ? 'low' : 'all'
    const { t } = useTranslation()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [stockStatusFilter, setStockStatusFilter] =
        useState<StockStatusFilter>(initialStockFilter)
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const [currentPage, setCurrentPage] = useState(1)

    const pageSize = 10

    async function loadData() {
        try {
            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories(),
            ])

            setProducts(productsData)
            setCategories(categoriesData)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        const stockParam = searchParams.get('stock')

        if (stockParam === 'low') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStockStatusFilter('low')
            setCurrentPage(1)
        }
    }, [searchParams])

    async function handleDeleteProduct(id: number) {
        const confirmed = window.confirm(t('products.deleteConfirm'))

        if (!confirmed) return

        try {
            await deleteProduct(id)
            toast.success(t('products.deleteSuccess'))
            await loadData()
        } catch {
            toast.error(t('products.deleteError'))
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

    function handleStockFilterChange(value: StockStatusFilter) {
        setStockStatusFilter(value)
        setCurrentPage(1)

        if (value === 'low') {
            setSearchParams({ stock: 'low' })
            return
        }

        setSearchParams({})
    }

    function clearFilters() {
        setSearch('')
        setCategoryFilter('all')
        setStockStatusFilter('all')
        setSortField('name')
        setSortDirection('asc')
        setCurrentPage(1)
        setSearchParams({})
    }

    const filteredProducts = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim()

        const filtered = products.filter((product) => {
            const matchesSearch =
                !normalizedSearch ||
                product.name.toLowerCase().includes(normalizedSearch) ||
                product.sku.toLowerCase().includes(normalizedSearch)

            const matchesCategory =
                categoryFilter === 'all' || product.categoryName === categoryFilter

            const matchesStockStatus =
                stockStatusFilter === 'all' ||
                (stockStatusFilter === 'low' && product.lowStock) ||
                (stockStatusFilter === 'normal' && !product.lowStock)

            return matchesSearch && matchesCategory && matchesStockStatus
        })

        return filtered.sort((a, b) => {
            const firstValue = a[sortField]
            const secondValue = b[sortField]

            if (typeof firstValue === 'number' && typeof secondValue === 'number') {
                return sortDirection === 'asc'
                    ? firstValue - secondValue
                    : secondValue - firstValue
            }

            return sortDirection === 'asc'
                ? String(firstValue).localeCompare(String(secondValue))
                : String(secondValue).localeCompare(String(firstValue))
        })
    }, [products, search, categoryFilter, stockStatusFilter, sortField, sortDirection])

    const totalPages = Math.ceil(filteredProducts.length / pageSize)

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    if (loading) {
        return <ProductsSkeleton />
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">{t('products.title')}</h1>

                    <p className="mt-2 solaris-muted">
                        {t('products.description')}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        to="/products/import"
                        className="rounded-xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        {t('products.importProducts')}
                    </Link>

                    <Link
                        to="/products/new"
                        className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                    >
                        {t('products.newProduct')}
                    </Link>
                </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid gap-3 md:grid-cols-4">
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder={t('products.searchPlaceholder')}
                        className="solaris-input w-full"
                    />

                    <select
                        value={categoryFilter}
                        onChange={(event) => {
                            setCategoryFilter(event.target.value)
                            setCurrentPage(1)
                        }}
                        className="solaris-input"
                    >
                        <option value="all">{t('products.allCategories')}</option>

                        {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={stockStatusFilter}
                        onChange={(event) =>
                            handleStockFilterChange(event.target.value as StockStatusFilter)
                        }
                        className="solaris-input"
                    >
                        <option value="all">{t('products.allStockStatus')}</option>
                        <option value="low">{t('products.lowStockOnly')}</option>
                        <option value="normal">{t('products.okStockOnly')}</option>
                    </select>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        {t('products.clearFilters')}
                    </button>
                </div>

                <p className="text-sm solaris-muted">
                    {t('products.results', { count: filteredProducts.length })}
                </p>
            </div>

            <div className="mt-8 space-y-4 lg:hidden">
                {paginatedProducts.map((product) => (
                    <div key={product.id} className="solaris-panel">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-semibold text-slate-950 dark:text-white">
                                    {product.name}
                                </h2>

                                <p className="mt-1 text-sm solaris-muted">
                                    {product.sku}
                                </p>

                                <p className="mt-1 text-sm solaris-subtle">
                                    {product.categoryName}
                                </p>
                            </div>

                            {product.lowStock ? (
                                <span className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                                    {t('products.status.lowStock')}
                                </span>
                            ) : (
                                <span className="rounded-lg bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500 dark:text-green-300">
                                    {t('products.status.ok')}
                                </span>
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                                to={`/stock-movements/new?productId=${product.id}&type=IN`}
                                className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-500 hover:bg-blue-500/20 dark:text-blue-300"
                            >
                                {t('products.actions.restock')}
                            </Link>

                            <Link
                                to={`/products/${product.id}/edit`}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >

                                {t('products.actions.edit')}
                            </Link>

                            <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                            >

                                {t('products.actions.delete')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="solaris-card mt-8 hidden overflow-hidden lg:block">
                <table className="min-w-[1100px] w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-700 dark:text-slate-300">
                            <SortButton label={t('products.table.product')} field="name" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-700 dark:text-slate-300">
                            <SortButton label={t('products.table.sku')} field="sku" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-700 dark:text-slate-300">
                            <SortButton label={t('products.table.category')} field="categoryName" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-700 dark:text-slate-300">
                            <SortButton label={t('products.table.price')} field="price" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-700 dark:text-slate-300">
                            <SortButton label={t('products.table.stock')} field="stockQuantity" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-700 dark:text-slate-300">
                            {t('products.table.status')}
                        </th>

                        <th className="px-6 py-4 text-right text-sm text-slate-700 dark:text-slate-300">
                            {t('products.table.actions')}
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {paginatedProducts.map((product) => (
                        <tr key={product.id} className="border-t border-slate-200 dark:border-slate-800">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-medium text-slate-950 dark:text-white">
                                        {product.name}
                                    </p>
                                    <p className="text-sm solaris-muted">
                                        {product.description}
                                    </p>
                                </div>
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {product.sku}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {product.categoryName}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                ${product.price}
                            </td>

                            <td className="px-6 py-4">
                                    <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-sm text-blue-500 dark:text-blue-300">
                                        {product.stockQuantity}
                                    </span>
                            </td>

                            <td className="px-6 py-4">
                                {product.lowStock ? (
                                    <span className="rounded-lg bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400">
                                            LOW STOCK
                                        </span>
                                ) : (
                                    <span className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500 dark:text-green-300">
                                            OK
                                        </span>
                                )}
                            </td>

                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Link
                                        to={`/stock-movements/new?productId=${product.id}&type=IN`}
                                        className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-500 hover:bg-blue-500/20 dark:text-blue-300"
                                    >
                                        Restock
                                    </Link>

                                    <Link
                                        to={`/products/${product.id}/edit`}
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {paginatedProducts.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-10 text-center solaris-muted">
                                {t('products.empty')}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm solaris-muted">
                        {t('products.pagination', {
                            currentPage,
                            totalPages,
                            count: filteredProducts.length,
                        })}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {t('products.previous')}
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
                            {t('products.next')}
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
            <span className="text-xs text-slate-500">
                {isActive ? (direction === 'asc' ? '↑' : '↓') : '↕'}
            </span>
        </button>
    )
}

function ProductsSkeleton() {
    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-3 h-5 w-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="h-12 w-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-4">
                <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
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
                    {Array.from({ length: 6 }).map((_, index) => (
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

export default ProductsPage