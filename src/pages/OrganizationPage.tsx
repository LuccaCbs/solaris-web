import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Building2, Save, Store } from 'lucide-react'

import {
    getOrganization,
    getOrganizationStores,
    updateOrganization,
    updateOrganizationStore,
    type OrganizationProfile,
    type OrganizationStore,
} from '../api/organizationService'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/AuthContext'

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

function OrganizationPage() {
    const { t } = useTranslation()
    const { orgId, hasMinimumRole, setOrgName } = useAuth()

    const [organization, setOrganization] = useState<OrganizationProfile | null>(null)
    const [stores, setStores] = useState<OrganizationStore[]>([])
    const [loading, setLoading] = useState(true)
    const [savingOrg, setSavingOrg] = useState(false)
    const [savingStoreId, setSavingStoreId] = useState<number | null>(null)

    const [displayName, setDisplayName] = useState('')
    const [storeNames, setStoreNames] = useState<Record<number, string>>({})

    const canManage = hasMinimumRole('ADMIN')

    async function loadOrganization() {
        if (!orgId) {
            setLoading(false)
            return
        }

        try {
            const [organizationData, storesData] = await Promise.all([
                getOrganization(orgId),
                getOrganizationStores(orgId),
            ])

            setOrganization(organizationData)
            setDisplayName(organizationData.displayName)
            setStores(storesData)
            setStoreNames(Object.fromEntries(storesData.map((store) => [store.id, store.name])))
            setOrgName(organizationData.displayName)
        } catch {
            toast.error(t('organization.loadError'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadOrganization()
    }, [orgId])

    async function handleSaveOrganization(event: React.FormEvent) {
        event.preventDefault()

        if (!orgId || !displayName.trim()) {
            return
        }

        setSavingOrg(true)

        try {
            const updated = await updateOrganization(orgId, {
                displayName: displayName.trim(),
            })

            setOrganization(updated)
            setOrgName(updated.displayName)
            toast.success(t('organization.saveSuccess'))
        } catch (error) {
            toast.error(getApiErrorMessage(error) || t('organization.saveError'))
        } finally {
            setSavingOrg(false)
        }
    }

    async function handleSaveStore(store: OrganizationStore) {
        if (!orgId) {
            return
        }

        const nextName = storeNames[store.id]?.trim()

        if (!nextName) {
            return
        }

        setSavingStoreId(store.id)

        try {
            const updated = await updateOrganizationStore(orgId, store.id, {
                name: nextName,
                address: store.address ?? undefined,
                afipPuntoVenta: store.afipPuntoVenta ?? undefined,
            })

            setStores((current) =>
                current.map((item) => (item.id === store.id ? updated : item))
            )
            toast.success(t('organization.storeSaveSuccess'))
        } catch (error) {
            toast.error(getApiErrorMessage(error) || t('organization.storeSaveError'))
        } finally {
            setSavingStoreId(null)
        }
    }

    if (!canManage) {
        return (
            <div className="mx-auto max-w-4xl">
                <p className="text-slate-600 dark:text-slate-300">{t('organization.noAccess')}</p>
            </div>
        )
    }

    if (loading || !organization) {
        return <LoadingScreen />
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
                    {t('organization.title')}
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                    {t('organization.description')}
                </p>
            </div>

            <section className="solaris-card p-6">
                <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                        <Building2 className="text-slate-700 dark:text-slate-200" size={24} />
                    </div>

                    <form onSubmit={handleSaveOrganization} className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                                {t('organization.profileTitle')}
                            </h2>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                {t('organization.profileDescription')}
                            </p>
                        </div>

                        <label className="block">
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                {t('organization.displayName')}
                            </span>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(event) => setDisplayName(event.target.value)}
                                className="solaris-input mt-1 w-full max-w-xl"
                                required
                            />
                        </label>

                        <p className="text-xs text-slate-500">
                            {t('organization.fiscalHint')}
                        </p>

                        <button
                            type="submit"
                            disabled={savingOrg || !displayName.trim()}
                            className="solaris-button-primary inline-flex items-center gap-2"
                        >
                            <Save size={16} />
                            {savingOrg ? t('common.saving') : t('common.save')}
                        </button>
                    </form>
                </div>
            </section>

            <section className="solaris-card p-6">
                <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                        <Store className="text-slate-700 dark:text-slate-200" size={24} />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                            {t('organization.storesTitle')}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {t('organization.storesDescription')}
                        </p>

                        {stores.length === 0 ? (
                            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                                {t('organization.noStores')}
                            </p>
                        ) : (
                            <ul className="mt-4 space-y-4">
                                {stores.map((store) => (
                                    <li
                                        key={store.id}
                                        className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                                    >
                                        <label className="block">
                                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                                {t('organization.storeName')}
                                            </span>
                                            <input
                                                type="text"
                                                value={storeNames[store.id] ?? ''}
                                                onChange={(event) =>
                                                    setStoreNames((current) => ({
                                                        ...current,
                                                        [store.id]: event.target.value,
                                                    }))
                                                }
                                                className="solaris-input mt-1 w-full max-w-xl"
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => void handleSaveStore(store)}
                                            disabled={
                                                savingStoreId === store.id ||
                                                !storeNames[store.id]?.trim() ||
                                                storeNames[store.id]?.trim() === store.name
                                            }
                                            className="solaris-button-secondary mt-3 inline-flex items-center gap-2"
                                        >
                                            <Save size={16} />
                                            {savingStoreId === store.id
                                                ? t('common.saving')
                                                : t('organization.saveStore')}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default OrganizationPage
