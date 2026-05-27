import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getSystemSettings, updateSystemSettings } from '../api/systemSettingsService'
import type { SystemSettings } from '../types/systemSettings'

const timezones =
    typeof Intl.supportedValuesOf === 'function'
        ? Intl.supportedValuesOf('timeZone')
        : [
            'America/Argentina/Buenos_Aires',
            'America/Argentina/Mendoza',
            'America/Santiago',
            'America/Montevideo',
            'America/Sao_Paulo',
            'Europe/Madrid',
            'America/New_York',
        ]

function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings | null>(null)
    const [globalLowStockThreshold, setGlobalLowStockThreshold] = useState('')
    const [adminAccessPassword, setAdminAccessPassword] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [businessTimezone, setBusinessTimezone] = useState('')
    const [cashRegisterAutoCloseTime, setCashRegisterAutoCloseTime] = useState('')

    useEffect(() => {
        async function loadSettings() {
            try {
                const data = await getSystemSettings()
                setSettings(data)
                setGlobalLowStockThreshold(String(data.globalLowStockThreshold))
                setBusinessTimezone(data.businessTimezone)
                setCashRegisterAutoCloseTime(data.cashRegisterAutoCloseTime.slice(0, 5))
            } finally {
                setLoading(false)
            }
        }

        loadSettings()
    }, [])

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        setSaving(true)

        try {
            const updatedSettings = await updateSystemSettings({
                globalLowStockThreshold: Number(globalLowStockThreshold),
                adminAccessPassword: adminAccessPassword.trim()
                    ? adminAccessPassword
                    : undefined,
                businessTimezone,
                cashRegisterAutoCloseTime,
            })

            setSettings(updatedSettings)
            setAdminAccessPassword('')
            toast.success('Settings updated successfully')
        } catch {
            toast.error('Could not update settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <AdminSettingsSkeleton />
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">Admin Settings</h1>

            <p className="mt-2 solaris-muted">
                Configure global business rules and security settings used across Solaris.
            </p>

            <form onSubmit={handleSubmit} className="solaris-panel mt-8 max-w-2xl">
                <h2 className="text-xl font-semibold">Inventory Settings</h2>

                <div className="mt-6">
                    <label className="text-sm solaris-muted">
                        Global Low Stock Threshold
                    </label>

                    <input
                        required
                        min={0}
                        type="number"
                        value={globalLowStockThreshold}
                        onChange={(event) => setGlobalLowStockThreshold(event.target.value)}
                        className="solaris-input mt-2 w-full"
                    />

                    <p className="mt-2 text-sm solaris-subtle">
                        Products without a custom threshold will use this value to determine low stock status.
                    </p>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
                    <h2 className="text-xl font-semibold">Security Settings</h2>

                    <div className="mt-6">
                        <label className="text-sm solaris-muted">
                            Admin Access Password
                        </label>

                        <input
                            type="password"
                            value={adminAccessPassword}
                            onChange={(event) => setAdminAccessPassword(event.target.value)}
                            placeholder={
                                settings?.hasAdminAccessPassword
                                    ? 'Leave empty to keep current password'
                                    : 'Set admin access password'
                            }
                            className="solaris-input mt-2 w-full"
                        />

                        <p className="mt-2 text-sm solaris-subtle">
                            This password will be required for sensitive actions such as opening or closing cash register sessions.
                        </p>

                        <div className="mt-3">
                            {settings?.hasAdminAccessPassword ? (
                                <span className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500 dark:text-green-300">
                  Password configured
                </span>
                            ) : (
                                <span className="rounded-lg bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-600 dark:text-yellow-300">
                  No password configured
                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
                    <h2 className="text-xl font-semibold">Cash Register Settings</h2>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm solaris-muted">
                                Business Timezone
                            </label>

                            <input
                                list="business-timezones"
                                value={businessTimezone}
                                onChange={(event) => setBusinessTimezone(event.target.value)}
                                placeholder="Search timezone, e.g. Europe/Madrid"
                                className="solaris-input mt-2 w-full"
                            />

                            <datalist id="business-timezones">
                                {timezones.map((timezone) => (
                                    <option key={timezone} value={timezone}>
                                        {timezone}
                                    </option>
                                ))}
                            </datalist>
                        </div>

                        <div>
                            <label className="text-sm solaris-muted">
                                Auto Close Time
                            </label>

                            <input
                                type="time"
                                value={cashRegisterAutoCloseTime}
                                onChange={(event) => setCashRegisterAutoCloseTime(event.target.value)}
                                className="solaris-input mt-2 w-full"
                            />

                            <p className="mt-2 text-sm solaris-subtle">
                                Open cash registers will be closed automatically at this business time.
                            </p>
                        </div>
                    </div>
                </div>

                {settings && (
                    <p className="mt-6 text-sm solaris-subtle">
                        Last updated: {new Date(settings.updatedAt).toLocaleString()}
                    </p>
                )}

                <button
                    disabled={saving}
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </div>
    )
}

function AdminSettingsSkeleton() {
    return (
        <div>
            <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 h-5 w-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="solaris-panel mt-8 max-w-2xl">
                <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />

                <div className="mt-6">
                    <div className="h-4 w-44 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-2 h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-2 h-4 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="mt-8 h-px bg-slate-200 dark:bg-slate-800" />

                <div className="mt-6">
                    <div className="h-6 w-44 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-6 h-4 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-2 h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="mt-6 h-12 w-36 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
        </div>
    )
}

export default AdminSettingsPage