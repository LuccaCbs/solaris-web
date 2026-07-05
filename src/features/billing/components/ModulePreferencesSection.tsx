import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
    getOrganizationModulePreferences,
    updateOrganizationModulePreferences,
} from '../../../api/subscriptionService'
import { useEntitlements } from '../../../hooks/useEntitlements'
import type { ModuleCode, OrganizationModuleOption } from '../../../types/subscription'

type ModulePreferencesSectionProps = {
    orgId: number
    canManage: boolean
    onUpdated?: () => Promise<void> | void
}

export function ModulePreferencesSection({
    orgId,
    canManage,
    onUpdated,
}: ModulePreferencesSectionProps) {
    const { t } = useTranslation()
    const { refreshEntitlements } = useEntitlements()

    const [modules, setModules] = useState<OrganizationModuleOption[]>([])
    const [selectedModules, setSelectedModules] = useState<ModuleCode[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const optionalModules = useMemo(
        () => modules.filter((module: OrganizationModuleOption) => module.requiresOptIn),
        [modules]
    )

    const includedModules = useMemo(
        () => modules.filter((module: OrganizationModuleOption) => !module.requiresOptIn),
        [modules]
    )

    useEffect(() => {
        async function loadPreferences() {
            setLoading(true)

            try {
                const response = await getOrganizationModulePreferences(orgId)
                setModules(response.modules)
                setSelectedModules(
                    response.modules
                        .filter((module: OrganizationModuleOption) => module.enabled)
                        .map((module: OrganizationModuleOption) => module.code)
                )
            } catch {
                setModules([])
            } finally {
                setLoading(false)
            }
        }

        void loadPreferences()
    }, [orgId])

    function toggleModule(moduleCode: ModuleCode) {
        setSelectedModules((current) =>
            current.includes(moduleCode)
                ? current.filter((code) => code !== moduleCode)
                : [...current, moduleCode]
        )
    }

    async function handleSave(event: React.FormEvent) {
        event.preventDefault()

        setSaving(true)

        try {
            const response = await updateOrganizationModulePreferences(orgId, {
                enabledModules: selectedModules,
            })

            setModules(response.modules)
            setSelectedModules(
                response.modules
                    .filter((module: OrganizationModuleOption) => module.enabled)
                    .map((module: OrganizationModuleOption) => module.code)
            )
            await refreshEntitlements()
            await onUpdated?.()
            toast.success(t('billing.modulePreferences.saveSuccess'))
        } catch {
            toast.error(t('billing.modulePreferences.saveError'))
        } finally {
            setSaving(false)
        }
    }

    if (loading || modules.length === 0) {
        return null
    }

    return (
        <section className="solaris-card p-6">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                {t('billing.modulePreferences.title')}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {t('billing.modulePreferences.description')}
            </p>

            {includedModules.length > 0 && (
                <div className="mt-6">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        {t('billing.modulePreferences.includedTitle')}
                    </p>
                    <ul className="mt-3 space-y-2">
                        {includedModules.map((module: OrganizationModuleOption) => (
                            <li
                                key={module.code}
                                className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800"
                            >
                                <p className="font-medium text-slate-950 dark:text-white">
                                    {t(`billing.modules.${module.code}`, {
                                        defaultValue: module.displayName,
                                    })}
                                </p>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                    {t(`billing.moduleDescriptions.${module.code}`, {
                                        defaultValue: module.displayName,
                                    })}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {optionalModules.length > 0 && (
                <form onSubmit={(event) => void handleSave(event)} className="mt-6 space-y-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            {t('billing.modulePreferences.optionalTitle')}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {t('billing.modulePreferences.optionalHint')}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {optionalModules.map((module: OrganizationModuleOption) => (
                            <label
                                key={module.code}
                                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedModules.includes(module.code)}
                                    disabled={!canManage || saving}
                                    onChange={() => toggleModule(module.code)}
                                    className="mt-1"
                                />
                                <span>
                                    <span className="font-medium text-slate-950 dark:text-white">
                                        {t(`billing.modules.${module.code}`, {
                                            defaultValue: module.displayName,
                                        })}
                                    </span>
                                    <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                                        {t(`billing.moduleDescriptions.${module.code}`, {
                                            defaultValue: module.displayName,
                                        })}
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>

                    {canManage && (
                        <button
                            type="submit"
                            disabled={saving}
                            className="solaris-button-primary disabled:opacity-60"
                        >
                            {saving
                                ? t('billing.modulePreferences.saving')
                                : t('billing.modulePreferences.save')}
                        </button>
                    )}
                </form>
            )}
        </section>
    )
}
