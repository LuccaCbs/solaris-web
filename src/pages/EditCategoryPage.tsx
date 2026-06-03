import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCategoryById, updateCategory } from '../api/categoryService'
import toast from 'react-hot-toast'

function EditCategoryPage() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadCategory() {
            if (!id) return

            try {
                const category = await getCategoryById(Number(id))
                setName(category.name)
                setDescription(category.description)
            } finally {
                setLoading(false)
            }
        }

        loadCategory()
    }, [id])

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        if (!id) return

        setSaving(true)
        setError('')

        try {
            await updateCategory(Number(id), { name, description })

            toast.success('Category updated successfully')
            navigate('/categories')
        } catch {
            setError('Could not update category')
            toast.error('Could not update category')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div>
                <div className="h-10 w-52 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3 h-5 w-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

                <div className="solaris-panel mt-8 max-w-2xl">
                    <div>
                        <div className="h-4 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                        <div className="mt-2 h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    </div>

                    <div className="mt-4">
                        <div className="h-4 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                        <div className="mt-2 h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 sm:w-36" />
                        <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 sm:w-28" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">
                Edit Category
            </h1>

            <p className="mt-2 solaris-muted">
                Update category details.
            </p>

            <form
                onSubmit={handleSubmit}
                className="solaris-panel mt-8 max-w-2xl"
            >
                <div>
                    <label className="text-sm solaris-muted">
                        Name
                    </label>

                    <input
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="solaris-input mt-2 w-full"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm solaris-muted">
                        Description
                    </label>

                    <input
                        required
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="solaris-input mt-2 w-full"
                    />
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
                        onClick={() => navigate('/categories')}
                        className="w-full rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditCategoryPage