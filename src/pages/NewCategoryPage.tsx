import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCategory } from '../api/categoryService'

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
            navigate('/categories')
        } catch {
            setError('Could not create category. Check if the name already exists.')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">New Category</h1>
            <p className="mt-2 text-slate-400">Create a new product category.</p>

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
                        disabled={creating}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
                    >
                        {creating ? 'Creating...' : 'Create Category'}
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

export default NewCategoryPage