import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProduct } from '../api/productService'
import { getCategories } from '../api/categoryService'
import type { Category } from '../types/category'

type ProductFormState = {
    name: string
    description: string
    sku: string
    price: string
    stockQuantity: string
    categoryId: string
    lowStockThreshold: string
}

const initialFormState: ProductFormState = {
    name: '',
    description: '',
    sku: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    lowStockThreshold: '',
}

function NewProductPage() {
    const navigate = useNavigate()

    const [categories, setCategories] = useState<Category[]>([])
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState<ProductFormState>(initialFormState)

    useEffect(() => {
        async function loadCategories() {
            const data = await getCategories()
            setCategories(data)
        }

        loadCategories()
    }, [])

    function updateForm(field: keyof ProductFormState, value: string) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }))
    }

    async function handleCreateProduct(event: React.FormEvent) {
        event.preventDefault()

        setError('')
        setCreating(true)

        try {
            await createProduct({
                name: form.name,
                description: form.description,
                sku: form.sku,
                price: Number(form.price),
                stockQuantity: Number(form.stockQuantity),
                categoryId: Number(form.categoryId),
                lowStockThreshold: form.lowStockThreshold
                    ? Number(form.lowStockThreshold)
                    : null,
            })

            navigate('/products')
        } catch {
            setError('Could not create product.')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div>
            <div>
                <h1 className="text-4xl font-bold">
                    New Product
                </h1>

                <p className="mt-2 text-slate-400">
                    Create a new inventory product.
                </p>
            </div>

            <form
                onSubmit={handleCreateProduct}
                className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Input
                        label="Name"
                        value={form.name}
                        onChange={(value) => updateForm('name', value)}
                    />

                    <Input
                        label="SKU"
                        value={form.sku}
                        onChange={(value) => updateForm('sku', value)}
                    />

                    <Input
                        label="Price"
                        type="number"
                        value={form.price}
                        onChange={(value) => updateForm('price', value)}
                    />

                    <Input
                        label="Stock Quantity"
                        type="number"
                        value={form.stockQuantity}
                        onChange={(value) => updateForm('stockQuantity', value)}
                    />

                    <div>
                        <label className="text-sm text-slate-400">
                            Category
                        </label>

                        <select
                            value={form.categoryId}
                            onChange={(event) => updateForm('categoryId', event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">
                                Select category
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-slate-400">
                            Custom Low Stock Threshold
                        </label>

                        <input
                            min={0}
                            type="number"
                            value={form.lowStockThreshold}
                            onChange={(event) =>
                                updateForm('lowStockThreshold', event.target.value)
                            }
                            placeholder="Use global setting"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />

                        <p className="mt-2 text-sm text-slate-500">
                            Leave empty to use the global low stock threshold.
                        </p>
                    </div>

                    <div className="md:col-span-2 xl:col-span-3">
                        <Input
                            label="Description"
                            value={form.description}
                            onChange={(value) => updateForm('description', value)}
                        />
                    </div>
                </div>

                {error && (
                    <p className="mt-4 text-sm text-red-400">
                        {error}
                    </p>
                )}

                <div className="mt-6 flex gap-3">
                    <button
                        disabled={creating}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
                    >
                        {creating ? 'Creating...' : 'Create Product'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

type InputProps = {
    label: string
    value: string
    type?: string
    onChange: (value: string) => void
}

function Input({
                   label,
                   value,
                   type = 'text',
                   onChange,
               }: InputProps) {
    return (
        <div>
            <label className="text-sm text-slate-400">
                {label}
            </label>

            <input
                required
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
        </div>
    )
}

export default NewProductPage