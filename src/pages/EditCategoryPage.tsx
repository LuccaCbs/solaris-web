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
            toast.error('Could not update category')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div>Loading category...</div>
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">Edit Category</h1>
            <p className="mt-2 text-slate-400">Update category details.</p>

            <form
                onSubmit={handleSubmit}
                className="mt-8 max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
            >
                <div>
                    <label className="text-sm text-slate-400">Name</label>
                    <input
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm text-slate-400">Description</label>
                    <input
                        required
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                </div>

                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                <div className="mt-6 flex gap-3">
                    <button
                        disabled={saving}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/categories')}
                        className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditCategoryPage