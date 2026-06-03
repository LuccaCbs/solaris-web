import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    downloadProductImportTemplate,
    importProducts,
    type ProductImportResponse,
} from '../api/productService'
import toast from 'react-hot-toast'

function ImportProductsPage() {
    const navigate = useNavigate()

    const [file, setFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [result, setResult] = useState<ProductImportResponse | null>(null)
    const [mode, setMode] = useState<'CREATE_ONLY' | 'CREATE_OR_UPDATE'>('CREATE_ONLY')

    async function handleImport(event: React.FormEvent) {
        event.preventDefault()

        if (!file) {
            toast.error('Select an Excel file first')
            return
        }

        setImporting(true)
        setResult(null)

        try {
            const response = await importProducts(file, mode)
            setResult(response)

            if (response.failedCount > 0) {
                toast.error('Import completed with errors')
            } else {
                toast.success('Products imported successfully')
            }
        } catch {
            toast.error('Could not import products')
        } finally {
            setImporting(false)
        }
    }

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        Import Products
                    </h1>

                    <p className="mt-2 solaris-muted">
                        Upload an Excel file to create multiple products at once.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    Back to Products
                </button>
            </div>

            <div className="solaris-panel mt-8">
                <h2 className="text-xl font-semibold">
                    Excel format
                </h2>

                <p className="mt-2 solaris-muted">
                    Your file must use the following columns in the first row:
                </p>

                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800/50">
                        <tr>
                            {[
                                'Name',
                                'SKU',
                                'Price',
                                'Stock Quantity',
                                'Category',
                                'Custom Low Stock',
                                'Description',
                            ].map((column) => (
                                <th
                                    key={column}
                                    className="whitespace-nowrap px-4 py-3 text-left solaris-muted"
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                        </thead>
                    </table>
                </div>

                <p className="mt-4 text-sm solaris-subtle">
                    SKU, Category, Custom Low Stock and Description are optional.
                    If SKU is empty, Solaris will generate one automatically.
                    If Category is empty, Solaris will use General.
                </p>

                <button
                    type="button"
                    onClick={downloadProductImportTemplate}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
                >
                    Download Template
                </button>
            </div>

            <form
                onSubmit={handleImport}
                className="solaris-panel mt-6"
            >

                <div className="mt-6">
                    <label className="text-sm solaris-muted">
                        Import mode
                    </label>

                    <select
                        value={mode}
                        onChange={(event) =>
                            setMode(event.target.value as 'CREATE_ONLY' | 'CREATE_OR_UPDATE')
                        }
                        className="solaris-input mt-2 w-full sm:w-80"
                    >
                        <option value="CREATE_ONLY">
                            Create only
                        </option>

                        <option value="CREATE_OR_UPDATE">
                            Create or update existing products
                        </option>
                    </select>

                    <p className="mt-2 text-sm solaris-subtle">
                        Products are matched by name. In update mode, existing products will be updated instead of failing.
                    </p>
                </div>

                <h2 className="text-xl font-semibold">
                    Upload file
                </h2>

                <p className="mt-2 solaris-muted">
                    Select a .xlsx file and start the import.
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
                        {importing ? 'Importing...' : 'Import Products'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            {result && (
                <div className="solaris-panel mt-6">
                    <h2 className="text-xl font-semibold">
                        Import result
                    </h2>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl bg-green-500/10 p-4 text-green-600 dark:text-green-400">
                            <p className="text-sm font-medium">
                                Created
                            </p>

                            <p className="mt-1 text-3xl font-bold">
                                {result.createdCount}
                            </p>
                        </div>

                        <div className="rounded-xl bg-blue-500/10 p-4 text-blue-600 dark:text-blue-400">
                            <p className="text-sm font-medium">
                                Updated
                            </p>

                            <p className="mt-1 text-3xl font-bold">
                                {result.updatedCount}
                            </p>
                        </div>

                        <div className="rounded-xl bg-red-500/10 p-4 text-red-600 dark:text-red-400">
                            <p className="text-sm font-medium">
                                Failed
                            </p>

                            <p className="mt-1 text-3xl font-bold">
                                {result.failedCount}
                            </p>
                        </div>
                    </div>

                    {result.errors.length > 0 && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                            <h3 className="font-semibold text-red-600 dark:text-red-400">
                                Errors
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