import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    downloadProductImportTemplate,
    importProducts,
    type ProductImportResponse,
} from '../api/productService'
import {
    extractProductsFromImage,
    exportProductsToExcel,
    type OCRProductItem,
} from '../api/ocrAgentService'
import toast from 'react-hot-toast'
import { getCategories } from '../api/categoryService'
import type { Category } from '../types/category'

function ImportProductsPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [file, setFile] = useState<File | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewItems, setPreviewItems] = useState<OCRProductItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    const [importing, setImporting] = useState(false)
    const [processingImage, setProcessingImage] = useState(false)
    const [importingPreview, setImportingPreview] = useState(false)

    const [result, setResult] = useState<ProductImportResponse | null>(null)
    const [mode, setMode] = useState<'CREATE_ONLY' | 'CREATE_OR_UPDATE'>('CREATE_ONLY')

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

    async function handleImport(event: React.FormEvent) {
        event.preventDefault()

        if (!file) {
            toast.error(t('productImport.selectFileError'))
            return
        }

        setImporting(true)
        setResult(null)

        try {
            const response = await importProducts(file, mode)
            setResult(response)

            if (response.failedCount > 0) {
                toast.error(t('productImport.completedWithErrors'))
            } else {
                toast.success(t('productImport.success'))
            }
        } catch {
            toast.error(t('productImport.error'))
        } finally {
            setImporting(false)
        }
    }

    async function handleExtractFromImage() {
        if (!imageFile) {
            toast.error(t('productImport.image.selectImageError'))
            return
        }

        setProcessingImage(true)
        setResult(null)
        setPreviewItems([])

        try {
            const response = await extractProductsFromImage(imageFile)
            setPreviewItems(response.items)

            if (response.items.length === 0) {
                toast.error(t('productImport.image.noProductsDetected'))
            } else {
                toast.success(t('productImport.image.detectedSuccess'))
            }
        } catch {
            toast.error(t('productImport.image.processingError'))
        } finally {
            setProcessingImage(false)
        }
    }

    function updatePreviewItem(
        index: number,
        field: keyof OCRProductItem,
        value: string
    ) {
        setPreviewItems((current) =>
            current.map((item, itemIndex) => {
                if (itemIndex !== index) return item

                if (field === 'price') {
                    return {
                        ...item,
                        price: Number(value),
                    }
                }

                if (field === 'stockQuantity') {
                    return {
                        ...item,
                        stockQuantity: Number(value),
                    }
                }

                return {
                    ...item,
                    [field]: value,
                }
            })
        )
    }

    function discardPreview() {
        setPreviewItems([])
        setImageFile(null)
    }

    async function handleImportPreview() {
        if (previewItems.length === 0) {
            toast.error(t('productImport.image.noProductsToImport'))
            return
        }

        setImportingPreview(true)
        setResult(null)

        try {
            const excelFile = await exportProductsToExcel(previewItems)
            const response = await importProducts(excelFile, mode)

            setResult(response)

            if (response.failedCount > 0) {
                toast.error(t('productImport.completedWithErrors'))
            } else {
                toast.success(t('productImport.image.importSuccess'))
                setPreviewItems([])
                setImageFile(null)
            }
        } catch {
            toast.error(t('productImport.image.importError'))
        } finally {
            setImportingPreview(false)
        }
    }

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        {t('productImport.title')}
                    </h1>

                    <p className="mt-2 solaris-muted">
                        {t('productImport.description')}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    {t('productImport.backToProducts')}
                </button>
            </div>

            <div className="solaris-panel mt-8">
                <h2 className="text-xl font-semibold">
                    {t('productImport.image.title')}
                </h2>

                <p className="mt-2 solaris-muted">
                    {t('productImport.image.description')}
                </p>

                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                    className="mt-5 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                />

                <button
                    type="button"
                    disabled={processingImage}
                    onClick={handleExtractFromImage}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                    {processingImage
                        ? t('productImport.image.processing')
                        : t('productImport.image.generatePreview')}
                </button>
            </div>

            {previewItems.length > 0 && (
                <div className="solaris-panel mt-6">
                    <h2 className="text-xl font-semibold">
                        {t('productImport.image.previewTitle')}
                    </h2>

                    <p className="mt-2 solaris-muted">
                        {t('productImport.image.previewDescription')}
                    </p>

                    <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="min-w-[1100px] w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800/50">
                            <tr>
                                {[
                                    t('productImport.columns.name'),
                                    t('productImport.columns.barcode'),
                                    t('productImport.columns.price'),
                                    t('productImport.columns.stockQuantity'),
                                    t('productImport.columns.category'),
                                    t('productImport.columns.description'),
                                ].map((column) => (
                                    <th
                                        key={column}
                                        className="px-4 py-3 text-left solaris-muted"
                                    >
                                        {column}
                                    </th>
                                ))}
                            </tr>
                            </thead>

                            <tbody>
                            {previewItems.map((item, index) => (
                                <tr
                                    key={`${item.name}-${index}`}
                                    className="border-t border-slate-200 dark:border-slate-800"
                                >
                                    <td className="px-4 py-3">
                                        <input
                                            value={item.name}
                                            onChange={(event) =>
                                                updatePreviewItem(index, 'name', event.target.value)
                                            }
                                            className="solaris-input w-full"
                                        />
                                    </td>

                                    <td className="px-4 py-3">
                                        <input
                                            value={item.barcode}
                                            onChange={(event) =>
                                                updatePreviewItem(index, 'barcode', event.target.value)
                                            }
                                            className="solaris-input w-full"
                                        />
                                    </td>

                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(event) =>
                                                updatePreviewItem(index, 'price', event.target.value)
                                            }
                                            className="solaris-input w-full"
                                        />
                                    </td>

                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            value={item.stockQuantity}
                                            onChange={(event) =>
                                                updatePreviewItem(index, 'stockQuantity', event.target.value)
                                            }
                                            className="solaris-input w-full"
                                        />
                                    </td>

                                    <td className="px-4 py-3">
                                        <select
                                            value={item.category}
                                            onChange={(event) =>
                                                updatePreviewItem(index, 'category', event.target.value)
                                            }
                                            className="solaris-input w-full"
                                        >
                                            <option value="">
                                                {t('productForm.selectCategory')}
                                            </option>

                                            {categories.map((category) => (
                                                <option key={category.id} value={category.name}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="px-4 py-3">
                                        <input
                                            value={item.description}
                                            onChange={(event) =>
                                                updatePreviewItem(index, 'description', event.target.value)
                                            }
                                            className="solaris-input w-full"
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            disabled={importingPreview}
                            onClick={handleImportPreview}
                            className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-60"
                        >
                            {importingPreview
                                ? t('productImport.importing')
                                : t('productImport.image.importGeneratedProducts')}
                        </button>

                        <button
                            type="button"
                            onClick={discardPreview}
                            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {t('productImport.image.discardPreview')}
                        </button>
                    </div>
                </div>
            )}

            <div className="solaris-panel mt-8">
                <h2 className="text-xl font-semibold">
                    {t('productImport.excelFormat')}
                </h2>

                <p className="mt-2 solaris-muted">
                    {t('productImport.excelFormatDescription')}
                </p>

                <button
                    type="button"
                    onClick={downloadProductImportTemplate}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
                >
                    {t('productImport.downloadTemplate')}
                </button>
            </div>

            <form
                onSubmit={handleImport}
                className="solaris-panel mt-6"
            >
                <div>
                    <label className="text-sm solaris-muted">
                        {t('productImport.importMode')}
                    </label>

                    <select
                        value={mode}
                        onChange={(event) =>
                            setMode(event.target.value as 'CREATE_ONLY' | 'CREATE_OR_UPDATE')
                        }
                        className="solaris-input mt-2 w-full sm:w-80"
                    >
                        <option value="CREATE_ONLY">
                            {t('productImport.modes.createOnly')}
                        </option>

                        <option value="CREATE_OR_UPDATE">
                            {t('productImport.modes.createOrUpdate')}
                        </option>
                    </select>

                    <p className="mt-2 text-sm solaris-subtle">
                        {t('productImport.importModeHelp')}
                    </p>
                </div>

                <h2 className="mt-6 text-xl font-semibold">
                    {t('productImport.uploadFile')}
                </h2>

                <p className="mt-2 solaris-muted">
                    {t('productImport.uploadFileDescription')}
                </p>

                <input
                    type="file"
                    accept=".xlsx"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="mt-5 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                />

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        disabled={importing}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                        {importing
                            ? t('productImport.importing')
                            : t('productImport.importProducts')}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </form>

            {result && (
                <div className="solaris-panel mt-6">
                    <h2 className="text-xl font-semibold">
                        {t('productImport.result.title')}
                    </h2>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl bg-green-500/10 p-4 text-green-600 dark:text-green-400">
                            <p className="text-sm font-medium">
                                {t('productImport.result.created')}
                            </p>

                            <p className="mt-1 text-3xl font-bold">
                                {result.createdCount}
                            </p>
                        </div>

                        <div className="rounded-xl bg-blue-500/10 p-4 text-blue-600 dark:text-blue-400">
                            <p className="text-sm font-medium">
                                {t('productImport.result.updated')}
                            </p>

                            <p className="mt-1 text-3xl font-bold">
                                {result.updatedCount}
                            </p>
                        </div>

                        <div className="rounded-xl bg-red-500/10 p-4 text-red-600 dark:text-red-400">
                            <p className="text-sm font-medium">
                                {t('productImport.result.failed')}
                            </p>

                            <p className="mt-1 text-3xl font-bold">
                                {result.failedCount}
                            </p>
                        </div>
                    </div>

                    {result.errors.length > 0 && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                            <h3 className="font-semibold text-red-600 dark:text-red-400">
                                {t('productImport.result.errors')}
                            </h3>

                            <ul className="mt-3 space-y-2 text-sm text-red-600 dark:text-red-300">
                                {result.errors.map((error) => (
                                    <li key={error}>
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ImportProductsPage