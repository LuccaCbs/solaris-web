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
                sku: form.sku.trim(),
                price: Number(form.price),
                categoryId: form.categoryId ? Number(form.categoryId) : null,
                lowStockThreshold: form.lowStockThreshold
                    ? Number(form.lowStockThreshold)
                    : null,
            })

            toast.success('Product updated successfully')
            navigate('/products')
        } catch {
            setError('Could not update product')
            toast.error('Could not update product')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div>
                <div className="h-10 w-52 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3 h-5 w-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

                <div className="solaris-panel mt-8">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index}>
                                <div className="h-4 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                                <div className="mt-2 h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">Edit Product</h1>

            <p className="mt-2 solaris-muted">
                Update inventory product details.
            </p>

            <form
                onSubmit={handleSubmit}
                className="solaris-panel mt-8"
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Input
                        label="Name"
                        value={form.name}
                        onChange={(value) => updateForm('name', value)}
                    />

                    <div>
                        <label className="text-sm solaris-muted">
                            SKU <span className="solaris-subtle">(optional)</span>
                        </label>

                        <input
                            value={form.sku}
                            onChange={(event) => updateForm('sku', event.target.value)}
                            className="solaris-input mt-2 w-full"
                            placeholder="Leave empty to generate automatically"
                        />

                        <p className="mt-2 text-sm solaris-subtle">
                            Leave empty to generate a new system SKU automatically.
                        </p>
                    </div>

                    <Input
                        label="Price"
                        type="number"
                        value={form.price}
                        onChange={(value) => updateForm('price', value)}
                    />

                    {/*
                      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                       Stock is managed through Stock Movements to preserve audit history.
                    </div>
                    */}

                    <div>
                        <label className="text-sm solaris-muted">
                            Category
                        </label>

                        <select
                            value={form.categoryId}
                            onChange={(event) => updateForm('categoryId', event.target.value)}
                            className="solaris-input mt-2 w-full"
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
                        <label className="text-sm solaris-muted">
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
                            className="solaris-input mt-2 w-full"
                        />

                        <p className="mt-2 text-sm solaris-subtle">
                            Leave empty to use the global low stock threshold.
                        </p>
                    </div>

                    <div className="md:col-span-2 xl:col-span-3">
                        <div>
                            <label className="text-sm solaris-muted">
                                Description <span className="solaris-subtle">(optional)</span>
                            </label>

                            <input
                                value={form.description}
                                onChange={(event) => updateForm('description', event.target.value)}
                                className="solaris-input mt-2 w-full"
                                placeholder="Optional product description"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="mt-4 text-sm text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        disabled={saving}
                        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60 sm:w-auto"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="w-full rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
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
            <label className="text-sm solaris-muted">
                {label}
            </label>

            <input
                required
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="solaris-input mt-2 w-full"
            />
        </div>
    )
}

export default EditProductPage