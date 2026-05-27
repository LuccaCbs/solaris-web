import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCategories } from '../api/categoryService'
import { getProductById, updateProduct } from '../api/productService'
import type { Category } from '../types/category'
import toast from 'react-hot-toast'

type ProductFormState = {
    name: string
    description: string
    sku: string
    price: string
    categoryId: string
    lowStockThreshold: string
}

function EditProductPage() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState<ProductFormState>({
        name: '',
        description: '',
        sku: '',
        price: '',
        categoryId: '',
        lowStockThreshold: '',
    })

    useEffect(() => {
        async function loadData() {
            if (!id) return

            try {
                const [product, categoriesData] = await Promise.all([
                    getProductById(Number(id)),
                    getCategories(),
                ])

                setForm({
                    name: product.name,
                    description: product.description,
                    sku: product.sku,
                    price: String(product.price),
                    categoryId: String(product.categoryId),
                    lowStockThreshold: product.lowStockThreshold !== null
                        ? String(product.lowStockThreshold)
                        : '',
                })

                setCategories(categoriesData)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [id])

    function updateForm(field: keyof ProductFormState, value: string) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }))
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        if (!id) return

        setSaving(true)
        setError('')

        try {
            await updateProduct(Number(id), {
                name: form.name,
                description: form.description,
                sku: form.sku,
                price: Number(form.price),
                categoryId: Number(form.categoryId),
                lowStockThreshold: form.lowStockThreshold
                    ? Number(form.lowStockThreshold)
                    : null,
            })

            toast.success('Product updated successfully')

            navigate('/products')
        } catch {
            toast.error('Could not update product')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div>Loading product...</div>
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">Edit Product</h1>

            <p className="mt-2 text-slate-400">
                Update inventory product details.
            </p>

            <form
                onSubmit={handleSubmit}
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

                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
                        Stock is managed through Stock Movements to preserve audit history.
                    </div>

                    <div>
                        <label className="text-sm text-slate-400">Category</label>

                        <select
                            value={form.categoryId}
                            onChange={(event) => updateForm('categoryId', event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">Select category</option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
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

                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        disabled={saving}
                        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60 sm:w-auto"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="w-full rounded-xl border border-slate-700 px-5 py-3 text-slate-300 hover:bg-slate-800 sm:w-auto"
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

function Input({ label, value, type = 'text', onChange }: InputProps) {
    return (
        <div>
            <label className="text-sm text-slate-400">{label}</label>

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

export default EditProductPage