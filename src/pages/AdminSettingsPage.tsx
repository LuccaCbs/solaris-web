import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getSystemSettings, updateSystemSettings } from '../api/systemSettingsService'
import type { SystemSettings } from '../types/systemSettings'
import PasswordInput from '../components/PasswordInput'
import LoadingScreen from '../components/LoadingScreen'

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
    const { t } = useTranslation()

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
            } catch {
                toast.error(t('adminSettings.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadSettings()
    }, [t])

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
            toast.success(t('adminSettings.updateSuccess'))
        } catch {
            toast.error(t('adminSettings.updateError'))
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
                {t('adminSettings.title')}
            </h1>

            <p className="mt-2 solaris-muted">
                {t('adminSettings.description')}
            </p>

            <form onSubmit={handleSubmit} className="solaris-panel mt-8 max-w-2xl">
                <h2 className="text-xl font-semibold">
                    {t('adminSettings.inventory.title')}
                </h2>

                <div className="mt-6">
                    <label className="text-sm solaris-muted">
                        {t('adminSettings.inventory.globalLowStockThreshold')}
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
                        {t('adminSettings.inventory.globalLowStockHelp')}
                    </p>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
                    <h2 className="text-xl font-semibold">
                        {t('adminSettings.security.title')}
                    </h2>

                    <div className="mt-6">
                        <label className="text-sm solaris-muted">
                            {t('adminSettings.security.adminAccessPassword')}
                        </label>

                        <PasswordInput
                            value={adminAccessPassword}
                            onChange={setAdminAccessPassword}
                            placeholder={
                                settings?.hasAdminAccessPassword
                                    ? t('adminSettings.security.keepCurrentPasswordPlaceholder')
                                    : t('adminSettings.security.setPasswordPlaceholder')
                            }
                            className="solaris-input mt-2 w-full"
                        />

                        <p className="mt-2 text-sm solaris-subtle">
                            {t('adminSettings.security.adminAccessPasswordHelp')}
                        </p>

                        <div className="mt-3">
                            {settings?.hasAdminAccessPassword ? (
                                <span className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500 dark:text-green-300">
                                    {t('adminSettings.security.passwordConfigured')}
                                </span>
                            ) : (
                                <span className="rounded-lg bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-600 dark:text-yellow-300">
                                    {t('adminSettings.security.noPasswordConfigured')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
                    <h2 className="text-xl font-semibold">
                        {t('adminSettings.cashRegister.title')}
                    </h2>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm solaris-muted">
                                {t('adminSettings.cashRegister.businessTimezone')}
                            </label>

                            <input
                                list="business-timezones"
                                value={businessTimezone}
                                onChange={(event) => setBusinessTimezone(event.target.value)}
                                placeholder={t('adminSettings.cashRegister.timezonePlaceholder')}
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
                                {t('adminSettings.cashRegister.autoCloseTime')}
                            </label>

                            <input
                                type="time"
                                value={cashRegisterAutoCloseTime}
                                onChange={(event) => setCashRegisterAutoCloseTime(event.target.value)}
                                className="solaris-input mt-2 w-full"
                            />

                            <p className="mt-2 text-sm solaris-subtle">
                                {t('adminSettings.cashRegister.autoCloseTimeHelp')}
                            </p>
                        </div>
                    </div>
                </div>

                {settings && (
                    <p className="mt-6 text-sm solaris-subtle">
                        {t('adminSettings.lastUpdated', {
                            date: new Date(settings.updatedAt).toLocaleString(),
                        })}
                    </p>
                )}

                <button
                    disabled={saving}
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                    {saving
                        ? t('common.saving')
                        : t('adminSettings.saveSettings')}
                </button>
            </form>
        </div>
    )
}

export default AdminSettingsPage