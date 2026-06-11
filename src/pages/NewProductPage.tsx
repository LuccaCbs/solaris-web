import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createProduct } from '../api/productService'
import { getCategories } from '../api/categoryService'
import type { Category } from '../types/category'
import toast from 'react-hot-toast'

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
    const { t } = useTranslation()

    const [categories, setCategories] = useState<Category[]>([])
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState<ProductFormState>(initialFormState)

    useEffect(() => {
        async function loadCategories() {
            try {
                const data = await getCategories()
                setCategories(data)
            } catch {
                toast.error(t('productForm.loadCategoriesError'))
            }
        }

        loadCategories()
    }, [t])

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
                sku: form.sku.trim(),
                price: Number(form.price),
                stockQuantity: Number(form.stockQuantity),
                categoryId: form.categoryId ? Number(form.categoryId) : null,
                lowStockThreshold: form.lowStockThreshold
                    ? Number(form.lowStockThreshold)
                    : null,
            })

            toast.success(t('productForm.createSuccess'))
            navigate('/products')
        } catch {
            setError(t('productForm.createError'))
            toast.error(t('productForm.createError'))
        } finally {
            setCreating(false)
        }
    }

    return (
        <div>
            <div>
                <h1 className="text-4xl font-bold">
                    {t('productForm.newTitle')}
                </h1>

                <p className="mt-2 solaris-muted">
                    {t('productForm.newDescription')}
                </p>
            </div>

            <form onSubmit={handleCreateProduct} className="solaris-panel mt-8">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Input
                        label={t('productForm.nameRequired')}
                        value={form.name}
                        onChange={(value) => updateForm('name', value)}
                    />

                    <div>
                        <label className="text-sm solaris-muted">
                            {t('productForm.sku')}{' '}
                            <span className="solaris-subtle">
                                {t('common.optional')}
                            </span>
                        </label>

                        <input
                            value={form.sku}
                            onChange={(event) => updateForm('sku', event.target.value)}
                            className="solaris-input mt-2 w-full"
                            placeholder={t('productForm.skuPlaceholder')}
                        />
                    </div>

                    <Input
                        label={t('productForm.priceRequired')}
                        type="number"
                        value={form.price}
                        onChange={(value) => updateForm('price', value)}
                    />

                    <Input
                        label={t('productForm.stockQuantityRequired')}
                        type="number"
                        value={form.stockQuantity}
                        onChange={(value) => updateForm('stockQuantity', value)}
                    />

                    <div>
                        <label className="text-sm solaris-muted">
                            {t('productForm.category')}{' '}
                            <span className="solaris-subtle">
                                {t('common.optional')}
                            </span>
                        </label>

                        <select
                            value={form.categoryId}
                            onChange={(event) => updateForm('categoryId', event.target.value)}
                            className="solaris-input mt-2 w-full"
                        >
                            <option value="">
                                {t('productForm.selectCategory')}
                            </option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm solaris-muted">
                            {t('productForm.customLowStockThreshold')}
                        </label>

                        <input
                            min={0}
                            type="number"
                            value={form.lowStockThreshold}
                            onChange={(event) =>
                                updateForm('lowStockThreshold', event.target.value)
                            }
                            placeholder={t('productForm.globalSettingPlaceholder')}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <div className="md:col-span-2 xl:col-span-3">
                        <label className="text-sm solaris-muted">
                            {t('productForm.description')}{' '}
                            <span className="solaris-subtle">
                                {t('common.optional')}
                            </span>
                        </label>

                        <input
                            value={form.description}
                            onChange={(event) => updateForm('description', event.target.value)}
                            className="solaris-input mt-2 w-full"
                            placeholder={t('productForm.descriptionPlaceholder')}
                        />
                    </div>
                </div>

                {error && (
                    <p className="mt-4 text-sm text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        disabled={creating}
                        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60 sm:w-auto"
                    >
                        {creating
                            ? t('productForm.creating')
                            : t('productForm.createProduct')}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="w-full rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
                    >
                        {t('common.cancel')}
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

export default NewProductPage