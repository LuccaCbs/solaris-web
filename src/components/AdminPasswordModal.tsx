import { useState } from 'react'
import toast from 'react-hot-toast'
import { validateAdminPassword } from '../api/systemSettingsService'

type AdminPasswordModalProps = {
    isOpen: boolean
    title: string
    description: string
    onClose: () => void
    onSuccess: () => void
}

function AdminPasswordModal({
                                isOpen,
                                title,
                                description,
                                onClose,
                                onSuccess,
                            }: AdminPasswordModalProps) {
    const [password, setPassword] = useState('')
    const [validating, setValidating] = useState(false)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        setValidating(true)

        try {
            const response = await validateAdminPassword({
                password,
            })

            if (!response.valid) {
                toast.error('Invalid admin password')
                return
            }

            setPassword('')
            onSuccess()
            onClose()
        } catch {
            toast.error('Could not validate admin password')
        } finally {
            setValidating(false)
        }
    }

    function handleClose() {
        setPassword('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold">{title}</h2>

                <p className="mt-2 solaris-muted">
                    {description}
                </p>

                <form onSubmit={handleSubmit} className="mt-6">
                    <label className="text-sm solaris-muted">
                        Admin Password
                    </label>

                    <input
                        required
                        autoFocus
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="solaris-input mt-2 w-full"
                    />

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                            disabled={validating}
                            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60 sm:w-auto"
                        >
                            {validating ? 'Validating...' : 'Confirm'}
                        </button>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AdminPasswordModal