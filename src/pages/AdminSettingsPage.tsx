import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getSystemSettings, updateSystemSettings } from '../api/systemSettingsService'
import { getFiscalConfig, getVerifactuFiscalPreviewHtml, updateFiscalConfig } from '../api/fiscalService'
import { useAuth } from '../context/AuthContext'
import { useEntitlements } from '../hooks/useEntitlements'
import type { FiscalJurisdiction, FiscalProviderType, CondicionIva, VerifactuSoftwareDeclaration } from '../types/fiscal'
import type { SystemSettings } from '../types/systemSettings'
import PasswordInput from '../components/PasswordInput'
import LoadingScreen from '../components/LoadingScreen'
import {
    formatCuitForDisplay,
    isValidSpanishTaxId,
    normalizeCuit,
    normalizeSpanishTaxId,
    parseTusFacturasCredentials,
    buildVerifactuCredentialsJson,
    readFileAsBase64,
} from '../utils/fiscalUtils'
import { isSpainFiscalJurisdiction } from '../utils/fiscalJurisdiction'

function getApiErrorMessage(error: unknown) {
    const apiError = error as {
        response?: {
            data?: {
                message?: string
            }
        }
    }

    return apiError.response?.data?.message || ''
}

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
    const { orgId } = useAuth()
    const { hasModule, isLoading: entitlementsLoading } = useEntitlements()
    const hasFiscalModule = hasModule('FISCAL')

    const [settings, setSettings] = useState<SystemSettings | null>(null)
    const [settingsLoadError, setSettingsLoadError] = useState('')
    const [globalLowStockThreshold, setGlobalLowStockThreshold] = useState('')
    const [adminAccessPassword, setAdminAccessPassword] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [businessTimezone, setBusinessTimezone] = useState('')
    const [cashRegisterAutoCloseTime, setCashRegisterAutoCloseTime] = useState('')

    const [fiscalCuit, setFiscalCuit] = useState('')
    const [fiscalRazonSocial, setFiscalRazonSocial] = useState('')
    const [fiscalCondicionIva, setFiscalCondicionIva] = useState<CondicionIva>('RESPONSABLE_INSCRIPTO')
    const [fiscalPuntoVenta, setFiscalPuntoVenta] = useState('')
    const [fiscalProvider, setFiscalProvider] = useState<FiscalProviderType>('MOCK')
    const [fiscalApiKey, setFiscalApiKey] = useState('')
    const [hasFiscalApiKey, setHasFiscalApiKey] = useState(false)
    const [editingFiscalApiKey, setEditingFiscalApiKey] = useState(false)
    const [savingFiscal, setSavingFiscal] = useState(false)
    const [fiscalJurisdiction, setFiscalJurisdiction] = useState<FiscalJurisdiction | null>(null)
    const [verifactuCertPassword, setVerifactuCertPassword] = useState('')
    const [verifactuSoftwareDeclaration, setVerifactuSoftwareDeclaration] =
        useState<VerifactuSoftwareDeclaration | null>(null)
    const [previewingVerifactu, setPreviewingVerifactu] = useState(false)

    useEffect(() => {
        if (entitlementsLoading) {
            return
        }

        async function loadSettings() {
            setSettingsLoadError('')

            try {
                const data = await getSystemSettings()

                setSettings(data)
                setGlobalLowStockThreshold(String(data.globalLowStockThreshold))
                setBusinessTimezone(data.businessTimezone)
                setCashRegisterAutoCloseTime(
                    data.cashRegisterAutoCloseTime
                        ? data.cashRegisterAutoCloseTime.slice(0, 5)
                        : '00:00'
                )
            } catch {
                setSettingsLoadError(t('adminSettings.loadError'))
                setGlobalLowStockThreshold('5')
                setBusinessTimezone('America/Argentina/Buenos_Aires')
                setCashRegisterAutoCloseTime('00:00')
            }

            if (orgId && hasFiscalModule) {
                try {
                    const fiscal = await getFiscalConfig(orgId)
                    setFiscalJurisdiction(fiscal.fiscalJurisdiction ?? 'AR_AFIP')
                    setFiscalCuit(
                        isSpainFiscalJurisdiction(fiscal.fiscalJurisdiction)
                            ? (fiscal.cuit ?? '')
                            : formatCuitForDisplay(fiscal.cuit)
                    )
                    setFiscalRazonSocial(fiscal.razonSocial ?? '')
                    setFiscalCondicionIva(fiscal.condicionIva)
                    setFiscalPuntoVenta(
                        fiscal.fiscalPuntoVenta != null ? String(fiscal.fiscalPuntoVenta) : ''
                    )
                    setFiscalProvider(fiscal.fiscalProvider ?? 'MOCK')
                    setHasFiscalApiKey(fiscal.hasFiscalApiKey)
                    setEditingFiscalApiKey(!fiscal.hasFiscalApiKey)
                    setFiscalApiKey('')
                    setVerifactuSoftwareDeclaration(fiscal.verifactuSoftwareDeclaration ?? null)
                    setVerifactuCertPassword('')
                } catch {
                    toast.error(t('adminSettings.fiscal.loadError'))
                }
            }

            setLoading(false)
        }

        setLoading(true)
        void loadSettings()
    }, [t, orgId, hasFiscalModule, entitlementsLoading])

    const isSpainFiscal = isSpainFiscalJurisdiction(fiscalJurisdiction)

    async function handleVerifactuPreview() {
        if (!orgId) {
            return
        }

        setPreviewingVerifactu(true)

        try {
            const html = await getVerifactuFiscalPreviewHtml(orgId)
            const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank', 'noopener,noreferrer')
            window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
        } catch (error) {
            toast.error(getApiErrorMessage(error) || t('adminSettings.fiscal.es.previewError'))
        } finally {
            setPreviewingVerifactu(false)
        }
    }

    async function handleFiscalSubmit(event: React.FormEvent) {
        event.preventDefault()

        if (!orgId) {
            toast.error(t('adminSettings.fiscal.noOrganization'))
            return
        }

        if (isSpainFiscal) {
            if (!fiscalCuit.trim()) {
                toast.error(t('adminSettings.fiscal.es.nifRequired'))
                return
            }

            const normalizedNif = normalizeSpanishTaxId(fiscalCuit)

            if (!isValidSpanishTaxId(normalizedNif)) {
                toast.error(t('adminSettings.fiscal.es.nifInvalid'))
                return
            }

            if (!fiscalRazonSocial.trim()) {
                toast.error(t('adminSettings.fiscal.es.razonSocialRequired'))
                return
            }

            const needsVerifactuCredentials =
                fiscalProvider === 'VERIFACTU_NATIVE' &&
                editingFiscalApiKey &&
                (verifactuCertPassword.trim().length > 0 ||
                    (document.getElementById('verifactu-cert-file') as HTMLInputElement | null)?.files?.[0] !=
                        null)

            if (needsVerifactuCredentials) {
                const certInput = document.getElementById('verifactu-cert-file') as HTMLInputElement | null
                const certFile = certInput?.files?.[0]

                if (!certFile) {
                    toast.error(t('adminSettings.fiscal.es.certRequired'))
                    return
                }

                if (!verifactuCertPassword.trim()) {
                    toast.error(t('adminSettings.fiscal.es.certPasswordRequired'))
                    return
                }
            }

            setSavingFiscal(true)

            try {
                let fiscalApiKey: string | undefined

                if (needsVerifactuCredentials) {
                    const certInput = document.getElementById('verifactu-cert-file') as HTMLInputElement | null
                    const certFile = certInput?.files?.[0]!

                    const certBase64 = await readFileAsBase64(certFile)
                    fiscalApiKey = buildVerifactuCredentialsJson({
                        nif: normalizedNif,
                        serie: fiscalPuntoVenta ? Number(fiscalPuntoVenta) : 1,
                        certBase64,
                        certPassword: verifactuCertPassword,
                    })
                }

                const updated = await updateFiscalConfig(
                    orgId,
                    {
                        cuit: normalizedNif,
                        razonSocial: fiscalRazonSocial.trim(),
                        fiscalPuntoVenta: fiscalPuntoVenta ? Number(fiscalPuntoVenta) : null,
                        fiscalProvider,
                        fiscalApiKey,
                    },
                    { isSpain: true }
                )

                setFiscalJurisdiction(updated.fiscalJurisdiction ?? 'ES_VERIFACTU')
                setFiscalCuit(updated.cuit ?? '')
                setFiscalRazonSocial(updated.razonSocial ?? '')
                setFiscalPuntoVenta(
                    updated.fiscalPuntoVenta != null ? String(updated.fiscalPuntoVenta) : ''
                )
                setFiscalProvider(updated.fiscalProvider ?? 'MOCK')
                setHasFiscalApiKey(updated.hasFiscalApiKey)
                setEditingFiscalApiKey(!updated.hasFiscalApiKey)
                setVerifactuSoftwareDeclaration(updated.verifactuSoftwareDeclaration ?? null)
                setVerifactuCertPassword('')
                toast.success(t('adminSettings.fiscal.updateSuccess'))
            } catch (error) {
                toast.error(getApiErrorMessage(error) || t('adminSettings.fiscal.updateError'))
            } finally {
                setSavingFiscal(false)
            }

            return
        }

        if (!fiscalCuit.trim()) {
            toast.error(t('adminSettings.fiscal.cuitRequired'))
            return
        }

        const normalizedCuit = normalizeCuit(fiscalCuit)

        if (normalizedCuit.length !== 11) {
            toast.error(t('adminSettings.fiscal.cuitInvalid'))
            return
        }

        const trimmedApiKey = fiscalApiKey.trim()

        if (trimmedApiKey && fiscalProvider === 'TUSFACTURAS' && !parseTusFacturasCredentials(trimmedApiKey)) {
            toast.error(t('adminSettings.fiscal.credentialsInvalid'))
            return
        }

        setSavingFiscal(true)

        try {
            const updated = await updateFiscalConfig(orgId, {
                cuit: normalizedCuit,
                razonSocial: fiscalRazonSocial.trim() || undefined,
                condicionIva: fiscalCondicionIva,
                fiscalPuntoVenta: fiscalPuntoVenta ? Number(fiscalPuntoVenta) : null,
                fiscalProvider,
                fiscalApiKey: trimmedApiKey || undefined,
            })

            setHasFiscalApiKey(updated.hasFiscalApiKey)
            setFiscalCuit(formatCuitForDisplay(updated.cuit))
            setFiscalRazonSocial(updated.razonSocial ?? '')
            setFiscalCondicionIva(updated.condicionIva)
            setFiscalPuntoVenta(
                updated.fiscalPuntoVenta != null ? String(updated.fiscalPuntoVenta) : ''
            )
            setFiscalProvider(updated.fiscalProvider ?? 'MOCK')
            setFiscalApiKey('')
            setEditingFiscalApiKey(!updated.hasFiscalApiKey)
            toast.success(t('adminSettings.fiscal.updateSuccess'))
        } catch (error) {
            toast.error(getApiErrorMessage(error) || t('adminSettings.fiscal.updateError'))
        } finally {
            setSavingFiscal(false)
        }
    }

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

    if (loading || entitlementsLoading) {
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

            {settingsLoadError && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                    {settingsLoadError}
                </p>
            )}

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

            {orgId && hasFiscalModule && (
                <form onSubmit={handleFiscalSubmit} className="solaris-panel mt-8 max-w-2xl">
                    <h2 className="text-xl font-semibold">
                        {isSpainFiscal
                            ? t('adminSettings.fiscal.es.title')
                            : t('adminSettings.fiscal.title')}
                    </h2>

                    <p className="mt-2 text-sm solaris-subtle">
                        {isSpainFiscal
                            ? t('adminSettings.fiscal.es.description')
                            : t('adminSettings.fiscal.description')}
                    </p>

                    {isSpainFiscal ? (
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm solaris-muted">
                                    {t('adminSettings.fiscal.es.nif')}
                                </label>
                                <input
                                    required
                                    value={fiscalCuit}
                                    onChange={(event) => setFiscalCuit(event.target.value.toUpperCase())}
                                    placeholder="B12345678"
                                    className="solaris-input mt-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="text-sm solaris-muted">
                                    {t('adminSettings.fiscal.razonSocial')}
                                </label>
                                <input
                                    required
                                    value={fiscalRazonSocial}
                                    onChange={(event) => setFiscalRazonSocial(event.target.value)}
                                    className="solaris-input mt-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="text-sm solaris-muted">
                                    {t('adminSettings.fiscal.es.series')}
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={fiscalPuntoVenta}
                                    onChange={(event) => setFiscalPuntoVenta(event.target.value)}
                                    className="solaris-input mt-2 w-full"
                                />
                                <p className="mt-2 text-sm solaris-subtle">
                                    {t('adminSettings.fiscal.es.seriesHelp')}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm solaris-muted">
                                    {t('adminSettings.fiscal.provider')}
                                </label>
                                <select
                                    value={fiscalProvider}
                                    onChange={(event) =>
                                        setFiscalProvider(event.target.value as FiscalProviderType)
                                    }
                                    className="solaris-input mt-2 w-full"
                                >
                                    <option value="MOCK">
                                        {t('adminSettings.fiscal.providerMock')}
                                    </option>
                                    <option value="VERIFACTU_NATIVE">
                                        {t('adminSettings.fiscal.es.providerVerifactu')}
                                    </option>
                                </select>
                                <p className="mt-2 text-sm solaris-subtle">
                                    {fiscalProvider === 'VERIFACTU_NATIVE'
                                        ? t('adminSettings.fiscal.es.providerVerifactuHelp')
                                        : t('adminSettings.fiscal.es.providerMockHelp')}
                                </p>
                            </div>

                            <div className="md:col-span-2 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    disabled={previewingVerifactu}
                                    onClick={() => void handleVerifactuPreview()}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                                >
                                    {previewingVerifactu
                                        ? t('adminSettings.fiscal.es.previewLoading')
                                        : t('adminSettings.fiscal.es.previewButton')}
                                </button>
                                <p className="self-center text-sm solaris-subtle">
                                    {t('adminSettings.fiscal.es.previewNoCertHint')}
                                </p>
                            </div>

                            {fiscalProvider === 'VERIFACTU_NATIVE' && (
                                <div className="md:col-span-2 space-y-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <div>
                                        <label className="text-sm solaris-muted">
                                            {t('adminSettings.fiscal.es.certFile')}
                                        </label>

                                        {hasFiscalApiKey && !editingFiscalApiKey ? (
                                            <div className="mt-2 space-y-3">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500 dark:text-green-300">
                                                        {t('adminSettings.fiscal.credentialsConfigured')}
                                                    </span>
                                                    <span className="text-sm solaris-subtle">
                                                        {t('adminSettings.fiscal.es.certSavedHint')}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingFiscalApiKey(true)
                                                        setVerifactuCertPassword('')
                                                    }}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                                >
                                                    {t('adminSettings.fiscal.replaceCredentials')}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="mt-2 space-y-2">
                                                <input
                                                    id="verifactu-cert-file"
                                                    type="file"
                                                    accept=".p12,.pfx,application/x-pkcs12"
                                                    className="solaris-input w-full text-sm"
                                                />
                                                <p className="text-sm solaris-subtle">
                                                    {t('adminSettings.fiscal.es.certHelp')}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {(editingFiscalApiKey || !hasFiscalApiKey) && (
                                        <div>
                                            <label className="text-sm solaris-muted">
                                                {t('adminSettings.fiscal.es.certPassword')}
                                            </label>
                                            <PasswordInput
                                                value={verifactuCertPassword}
                                                onChange={setVerifactuCertPassword}
                                                className="solaris-input mt-2 w-full"
                                            />
                                        </div>
                                    )}

                                    {hasFiscalApiKey && editingFiscalApiKey && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingFiscalApiKey(false)
                                                setVerifactuCertPassword('')
                                            }}
                                            className="text-sm font-medium text-slate-500 hover:text-slate-300"
                                        >
                                            {t('adminSettings.fiscal.cancelReplaceCredentials')}
                                        </button>
                                    )}

                                </div>
                            )}

                            {verifactuSoftwareDeclaration && fiscalProvider === 'VERIFACTU_NATIVE' && (
                                <div className="md:col-span-2 rounded-xl border border-slate-200 px-4 py-4 text-sm dark:border-slate-800">
                                    <h3 className="font-semibold">
                                        {t('adminSettings.fiscal.es.declarationTitle')}
                                    </h3>
                                    <p className="mt-2 whitespace-pre-wrap solaris-subtle">
                                        {verifactuSoftwareDeclaration.declarationText}
                                    </p>
                                    {verifactuSoftwareDeclaration.declarationUrl && (
                                        <a
                                            href={verifactuSoftwareDeclaration.declarationUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                        >
                                            {t('adminSettings.fiscal.es.declarationDocument')}
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm solaris-muted">
                                {t('adminSettings.fiscal.cuit')}
                            </label>
                            <input
                                required
                                value={fiscalCuit}
                                onChange={(event) => setFiscalCuit(event.target.value)}
                                placeholder="20-12345678-9"
                                className="solaris-input mt-2 w-full"
                            />
                        </div>

                        <div>
                            <label className="text-sm solaris-muted">
                                {t('adminSettings.fiscal.razonSocial')}
                            </label>
                            <input
                                value={fiscalRazonSocial}
                                onChange={(event) => setFiscalRazonSocial(event.target.value)}
                                className="solaris-input mt-2 w-full"
                            />
                        </div>

                        <div>
                            <label className="text-sm solaris-muted">
                                {t('adminSettings.fiscal.condicionIva')}
                            </label>
                            <select
                                value={fiscalCondicionIva}
                                onChange={(event) =>
                                    setFiscalCondicionIva(event.target.value as CondicionIva)
                                }
                                className="solaris-input mt-2 w-full"
                            >
                                <option value="RESPONSABLE_INSCRIPTO">
                                    {t('adminSettings.fiscal.condicion.responsableInscripto')}
                                </option>
                                <option value="MONOTRIBUTO">
                                    {t('adminSettings.fiscal.condicion.monotributo')}
                                </option>
                                <option value="EXENTO">
                                    {t('adminSettings.fiscal.condicion.exento')}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm solaris-muted">
                                {t('fiscal.puntoVenta')}
                            </label>
                            <input
                                required
                                type="number"
                                min={1}
                                value={fiscalPuntoVenta}
                                onChange={(event) => setFiscalPuntoVenta(event.target.value)}
                                className="solaris-input mt-2 w-full"
                            />
                        </div>

                        <div>
                            <label className="text-sm solaris-muted">
                                {t('adminSettings.fiscal.provider')}
                            </label>
                            <select
                                value={fiscalProvider}
                                onChange={(event) =>
                                    setFiscalProvider(event.target.value as FiscalProviderType)
                                }
                                className="solaris-input mt-2 w-full"
                            >
                                <option value="MOCK">
                                    {t('adminSettings.fiscal.providerMock')}
                                </option>
                                <option value="TUSFACTURAS">
                                    {t('adminSettings.fiscal.providerTusFacturas')}
                                </option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm solaris-muted">
                                {t('adminSettings.fiscal.apiKey')}
                            </label>

                            {hasFiscalApiKey && !editingFiscalApiKey ? (
                                <div className="mt-2 space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500 dark:text-green-300">
                                            {t('adminSettings.fiscal.credentialsConfigured')}
                                        </span>
                                        <span className="text-sm solaris-subtle">
                                            {t('adminSettings.fiscal.credentialsSavedHint')}
                                        </span>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm tracking-widest text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                                        ••••••••••
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingFiscalApiKey(true)
                                            setFiscalApiKey('')
                                        }}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                    >
                                        {t('adminSettings.fiscal.replaceCredentials')}
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-2 space-y-2">
                                    <textarea
                                        value={fiscalApiKey}
                                        onChange={(event) => setFiscalApiKey(event.target.value)}
                                        rows={4}
                                        spellCheck={false}
                                        placeholder={t('adminSettings.fiscal.setApiKeyPlaceholder')}
                                        className="solaris-input w-full font-mono text-sm"
                                    />

                                    <p className="text-sm solaris-subtle">
                                        {hasFiscalApiKey
                                            ? t('adminSettings.fiscal.keepApiKeyPlaceholder')
                                            : t('adminSettings.fiscal.apiKeyHelp')}
                                    </p>

                                    {hasFiscalApiKey && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingFiscalApiKey(false)
                                                setFiscalApiKey('')
                                            }}
                                            className="text-sm font-medium text-slate-500 hover:text-slate-300"
                                        >
                                            {t('adminSettings.fiscal.cancelReplaceCredentials')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    )}

                    <button
                        type="submit"
                        disabled={savingFiscal}
                        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                        {savingFiscal
                            ? t('common.saving')
                            : t('adminSettings.fiscal.save')}
                    </button>
                </form>
            )}
        </div>
    )
}

export default AdminSettingsPage