import { useEffect, useMemo, useState } from 'react'
import type { Product } from '../types/product'
import { Link } from 'react-router-dom'
import { deleteProduct, getProducts } from '../api/productService'
type SortField = 'name' | 'sku' | 'categoryName' | 'price' | 'stockQuantity'
type SortDirection = 'asc' | 'desc'
type StockStatusFilter = 'all' | 'low' | 'normal'
import toast from 'react-hot-toast'

function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState<SortField>('name')
    const [stockStatusFilter, setStockStatusFilter] = useState<StockStatusFilter>('all')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

    async function loadData() {
        try {
            const productsData = await getProducts()
            setProducts(productsData)
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteProduct(id: number) {
        const confirmed = window.confirm('Are you sure you want to delete this product?')

        if (!confirmed) return

        try {
            await deleteProduct(id)

            toast.success('Product deleted successfully')

            await loadData()
        } catch {
            toast.error('Could not delete product')
        }
    }

    function handleSort(field: SortField) {
        if (sortField === field) {
            setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')
            return
        }

        setSortField(field)
        setSortDirection('asc')
    }

    const filteredProducts = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim()

        const filtered = products.filter((product) => {
            const matchesStockStatus =
                stockStatusFilter === 'all' ||
                (stockStatusFilter === 'low' && product.lowStock) ||
                (stockStatusFilter === 'normal' && !product.lowStock)

            const searchableText = [
                product.name,
                product.description,
                product.sku,
                product.categoryName,
                String(product.price),
                String(product.stockQuantity),
                product.lowStock ? 'low stock' : 'normal stock',
            ]
                .join(' ')
                .toLowerCase()

            return matchesStockStatus && searchableText.includes(normalizedSearch)
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
    }, [products, search, stockStatusFilter, sortField, sortDirection])

    useEffect(() => {
        loadData()
    }, [])

    if (loading) {
        return <div className="text-white">Loading products...</div>
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Products</h1>

                    <p className="mt-2 text-slate-400">
                        Manage inventory products and stock.
                    </p>
                </div>

                <Link
                    to="/products/new"
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
                >
                    New Product
                </Link>
            </div>


            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name, SKU, category, price or stock..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500 sm:w-96"
                    />

                    <select
                        value={stockStatusFilter}
                        onChange={(event) =>
                            setStockStatusFilter(event.target.value as StockStatusFilter)
                        }
                        className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                    >
                        <option value="all">All products</option>
                        <option value="low">Low stock only</option>
                        <option value="normal">Normal stock only</option>
                    </select>
                </div>

                <p className="text-sm text-slate-400">
                    {filteredProducts.length} result
                    {filteredProducts.length === 1 ? '' : 's'}
                </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full">
                    <thead className="bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <SortButton label="Product" field="name" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <SortButton label="SKU" field="sku" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <SortButton label="Category" field="categoryName" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <SortButton label="Price" field="price" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-300">
                            <SortButton label="Stock" field="stockQuantity" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                        </th>

                        <th className="px-6 py-4 text-left text-sm text-slate-300">
                            Status
                        </th>

                        <th className="px-6 py-4 text-right text-sm text-slate-300">
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-t border-slate-800">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-medium text-white">{product.name}</p>
                                    <p className="text-sm text-slate-400">{product.description}</p>
                                </div>
                            </td>

                            <td className="px-6 py-4 text-slate-300">{product.sku}</td>
                            <td className="px-6 py-4 text-slate-300">{product.categoryName}</td>
                            <td className="px-6 py-4 text-slate-300">${product.price}</td>

                            <td className="px-6 py-4">
                              <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                                {product.stockQuantity}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                                {product.lowStock ? (
                                    <span className="rounded-lg bg-red-500/10 px-3 py-1 text-sm font-medium text-red-300">
                                      LOW STOCK
                                    </span>
                                ) : (
                                    <span className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-300">
                                      OK
                                    </span>
                                )}
                            </td>

                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Link
                                        to={`/stock-movements/new?productId=${product.id}&type=IN`}
                                        className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-300 hover:bg-blue-500/20"
                                    >
                                        Restock
                                    </Link>

                                    <Link
                                        to={`/products/${product.id}/edit`}
                                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
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

export default ProductsPage