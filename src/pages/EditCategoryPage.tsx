import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    getCategoryById,
    updateCategory,
} from '../api/categoryService'
import toast from 'react-hot-toast'
import LoadingScreen from '../components/LoadingScreen'

function EditCategoryPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadCategory() {
            if (!id) return

            try {
                setLoading(true)

                const category = await getCategoryById(Number(id))

                setName(category.name)
                setDescription(category.description)
            } catch {
                toast.error(t('categoryForm.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadCategory()
    }, [id, t])

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        if (!id) return

        setSaving(true)
        setError('')

        try {
            await updateCategory(Number(id), {
                name,
                description,
            })

            toast.success(t('categoryForm.updateSuccess'))
            navigate('/categories')
        } catch {
            setError(t('categoryForm.updateError'))
            toast.error(t('categoryForm.updateError'))
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
                {t('categoryForm.editTitle')}
            </h1>

            <p className="mt-2 solaris-muted">
                {t('categoryForm.editDescription')}
            </p>

            <form
                onSubmit={handleSubmit}
                className="solaris-panel mt-8 max-w-2xl"
            >
                <div>
                    <label className="text-sm solaris-muted">
                        {t('categoryForm.nameRequired')}
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
                        {t('categoryForm.description')}{' '}
                        <span className="solaris-subtle">
                            {t('common.optional')}
                        </span>
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
                        disabled={saving}
                        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60 sm:w-auto"
                    >
                        {saving
                            ? t('categoryForm.updating')
                            : t('categoryForm.updateCategory')}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/categories')}
                        className="w-full rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditCategoryPage