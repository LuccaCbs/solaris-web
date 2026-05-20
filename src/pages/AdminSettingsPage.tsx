import { useEffect, useState } from 'react'
import { getSystemSettings, updateSystemSettings } from '../api/systemSettingsService'
import type { SystemSettings } from '../types/systemSettings'

function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings | null>(null)
    const [globalLowStockThreshold, setGlobalLowStockThreshold] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadSettings() {
            try {
                const data = await getSystemSettings()
                setSettings(data)
                setGlobalLowStockThreshold(String(data.globalLowStockThreshold))
            } finally {
                setLoading(false)
            }
        }

        loadSettings()
    }, [])

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        setSaving(true)
        setSuccess('')
        setError('')

        try {
            const updatedSettings = await updateSystemSettings({
                globalLowStockThreshold: Number(globalLowStockThreshold),
            })

            setSettings(updatedSettings)
            setSuccess('Settings updated successfully.')
        } catch {
            setError('Could not update settings.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div>Loading settings...</div>
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">Admin Settings</h1>

            <p className="mt-2 text-slate-400">
                Configure global business rules used across Solaris.
            </p>

            <form
                onSubmit={handleSubmit}
                className="mt-8 max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
            >
                <h2 className="text-xl font-semibold">Inventory Settings</h2>

                <div className="mt-6">
                    <label className="text-sm text-slate-400">
                        Global Low Stock Threshold
                    </label>

                    <input
                        required
                        min={0}
                        type="number"
                        value={globalLowStockThreshold}
                        onChange={(event) => setGlobalLowStockThreshold(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                        Products without a custom threshold will use this value to determine low stock status.
                    </p>
                </div>

                {settings && (
                    <p className="mt-4 text-sm text-slate-500">
                        Last updated: {new Date(settings.updatedAt).toLocaleString()}
                    </p>
                )}

                {success && <p className="mt-4 text-sm text-green-400">{success}</p>}
                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                <button
                    disabled={saving}
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </div>
    )
}

export default AdminSettingsPage