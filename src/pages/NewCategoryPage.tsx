import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCategory } from '../api/categoryService'
import toast from 'react-hot-toast'

function NewCategoryPage() {
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setCreating(true)
        setError('')

        try {
            await createCategory({ name, description })

            toast.success('Category created successfully')
            navigate('/categories')
        } catch {
            setError('Could not create category')
            toast.error('Could not create category')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">
                New Category
            </h1>

            <p className="mt-2 solaris-muted">
                Create a new product category.
            </p>

            <form
                onSubmit={handleSubmit}
                className="solaris-panel mt-8 max-w-2xl"
            >
                <div>
                    <label className="text-sm solaris-muted">
                        Name *
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
                        Description <span className="solaris-subtle">(optional)</span>
                    </label>

                    <input
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
                        disabled={creating}
                        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60 sm:w-auto"
                    >
                        {creating ? 'Creating...' : 'Create Category'}
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

export default NewCategoryPage