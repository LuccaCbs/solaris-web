import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCategories } from '../api/categoryService'
import { getProductById, updateProduct } from '../api/productService'
import type { Category } from '../types/category'
import { PRODUCT_IVA_RATES, BARCODE_FORMATS, type BarcodeFormat, type ProductIvaRate } from '../types/product'
import toast from 'react-hot-toast'
import LoadingScreen from '../components/LoadingScreen'
import { BarcodePreviewField } from '../components/barcode/BarcodePreviewField'

type ProductFormState = {
    name: string
    description: string
    barcode: string
    barcodeFormat: BarcodeFormat
    price: string
    categoryId: string
    lowStockThreshold: string
    ivaRate: ProductIvaRate
}

function EditProductPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { t } = useTranslation()

    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState<ProductFormState>({
        name: '',
        description: '',
        barcode: '',
        barcodeFormat: 'EAN_13',
        price: '',
        categoryId: '',
        lowStockThreshold: '',
        ivaRate: 'GENERAL_21',
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
                    barcode: product.barcode,
                    barcodeFormat: product.barcodeFormat,
                    price: String(product.price),
                    categoryId: String(product.categoryId),
                    lowStockThreshold: product.lowStockThreshold !== null
                        ? String(product.lowStockThreshold)
                        : '',
                    ivaRate: product.ivaRate ?? 'GENERAL_21',
                })

                setCategories(categoriesData)
            } catch {
                toast.error(t('productForm.loadProductError'))
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [id, t])

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
                barcode: form.barcode.trim(),
                barcodeFormat: form.barcodeFormat,
                price: Number(form.price),
                categoryId: form.categoryId ? Number(form.categoryId) : null,
                lowStockThreshold: form.lowStockThreshold
                    ? Number(form.lowStockThreshold)
                    : null,
                ivaRate: form.ivaRate,
            })

            toast.success(t('productForm.updateSuccess'))
            navigate('/products')
        } catch {
            setError(t('productForm.updateError'))
            toast.error(t('productForm.updateError'))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">
                {t('productForm.editTitle')}
            </h1>

            <p className="mt-2 solaris-muted">
                {t('productForm.editDescription')}
            </p>

            <form
                onSubmit={handleSubmit}
                className="solaris-panel mt-8"
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Input
                        label={t('productForm.nameRequired')}
                        value={form.name}
                        onChange={(value) => updateForm('name', value)}
                    />

                    <div>
                        <label className="text-sm solaris-muted">
                            {t('productForm.barcode')} *
                        </label>

                        <input
                            required
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
                            onChange={(event) =>
                                updateForm('barcodeFormat', event.target.value)
                            }
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
                                format={form.barcodeFormat}
                            />
                        </div>
                    )}

                    <Input
                        label={t('productForm.priceRequired')}
                        type="number"
                        value={form.price}
                        onChange={(value) => updateForm('price', value)}
                    />

                    <div>
                        <label className="text-sm solaris-muted">
                            {t('productForm.category')}
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

                        <p className="mt-2 text-sm solaris-subtle">
                            {t('productForm.lowStockHelp')}
                        </p>
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
                        disabled={saving}
                        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60 sm:w-auto"
                    >
                        {saving
                            ? t('productForm.updating')
                            : t('productForm.updateProduct')}
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