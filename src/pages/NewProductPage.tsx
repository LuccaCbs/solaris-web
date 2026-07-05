import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createProduct } from '../api/productService'
import { getCategories } from '../api/categoryService'
import type { Category } from '../types/category'
import { PRODUCT_IVA_RATES, BARCODE_FORMATS, type ProductIvaRate, type BarcodeFormat } from '../types/product'
import toast from 'react-hot-toast'
import { BarcodePreviewField } from '../components/barcode/BarcodePreviewField'

function resolveDefaultCategoryId(categories: Category[]): string {
    const defaultCategory = categories.find((category) => category.systemCategory)
        ?? categories.find((category) => category.name.toLowerCase() === 'general')

    return defaultCategory ? String(defaultCategory.id) : ''
}

type ProductFormState = {
    name: string
    description: string
    barcode: string
    barcodeFormat: string
    price: string
    stockQuantity: string
    categoryId: string
    lowStockThreshold: string
    ivaRate: ProductIvaRate
}

const initialFormState: ProductFormState = {
    name: '',
    description: '',
    barcode: '',
    barcodeFormat: 'EAN_13',
    price: '',
    stockQuantity: '',
    categoryId: '',
    lowStockThreshold: '',
    ivaRate: 'GENERAL_21',
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
                setForm((current) => ({
                    ...current,
                    categoryId: current.categoryId || resolveDefaultCategoryId(data),
                }))
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

        if (!form.categoryId) {
            const message = t('productForm.categoryRequiredError')
            setError(message)
            toast.error(message)
            setCreating(false)
            return
        }

        try {
            await createProduct({
                name: form.name,
                description: form.description,
                barcode: form.barcode.trim() || null,
                barcodeFormat: form.barcode.trim()
                    ? (form.barcodeFormat as import('../types/product').BarcodeFormat)
                    : undefined,
                price: Number(form.price),
                stockQuantity: Number(form.stockQuantity),
                categoryId: Number(form.categoryId),
                lowStockThreshold: form.lowStockThreshold
                    ? Number(form.lowStockThreshold)
                    : null,
                ivaRate: form.ivaRate,
            })

            toast.success(t('productForm.createSuccess'))
            navigate('/products')
        } catch (error: unknown) {
            const message =
                (error as { response?: { data?: { message?: string } } }).response?.data
                    ?.message ?? t('productForm.createError')

            setError(message)
            toast.error(message)
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
                            {t('productForm.barcode')}{' '}
                            <span className="solaris-subtle">
                                {t('common.optional')}
                            </span>
                        </label>

                        <input
                            value={form.barcode}
                            onChange={(event) => updateForm('barcode', event.target.value)}
                            className="solaris-input mt-2 w-full"
                            placeholder={t('productForm.barcodePlaceholder')}
                        />
                    </div>

                    <div>
                        <label className="text-sm solaris-muted">
                            {t('productForm.barcodeFormat')}
                        </label>

                        <select
                            value={form.barcodeFormat}
                            onChange={(event) => updateForm('barcodeFormat', event.target.value)}
                            className="solaris-input mt-2 w-full"
                        >
                            {BARCODE_FORMATS.map((format) => (
                                <option key={format} value={format}>
                                    {t(`productForm.barcodeFormats.${format}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {form.barcode.trim() && (
                        <div className="md:col-span-2 xl:col-span-3">
                            <BarcodePreviewField
                                value={form.barcode}
                                format={form.barcodeFormat as BarcodeFormat}
                            />
                        </div>
                    )}

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
                            {t('productForm.categoryRequired')}
                        </label>

                        <select
                            required
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
                            {t('productForm.ivaRate')} *
                        </label>

                        <select
                            value={form.ivaRate}
                            onChange={(event) =>
                                updateForm('ivaRate', event.target.value)
                            }
                            className="solaris-input mt-2 w-full"
                        >
                            {PRODUCT_IVA_RATES.map((rate) => (
                                <option key={rate} value={rate}>
                                    {t(`productForm.ivaRates.${rate}`)}
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