import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Building2, CreditCard, Plus, Store } from 'lucide-react'

import { getOrganizationStores } from '../api/organizationService'
import {
    createOrganizationStore,
    getOrganizationSubscription,
    initiateStoreAddonCheckout,
    purchaseStoreAddonMock,
} from '../api/subscriptionService'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../context/AuthContext'
import type { OrganizationStore } from '../api/organizationService'
import type { OrganizationSubscription, StoreAddonCheckout } from '../types/subscription'

function getApiErrorMessage(error: unknown) {
    const apiError = error as {
        response?: {
            data?: {
                message?: string
            }
            status?: number
        }
    }

    return apiError.response?.data?.message || ''
}

function formatDate(value?: string | null) {
    if (!value) {
        return '—'
    }

    return new Date(value).toLocaleDateString()
}

function formatCurrency(value?: number | null) {
    if (value == null) {
        return '—'
    }

    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
    }).format(value)
}

function BillingPage() {
    const { t } = useTranslation()
    const { orgId, hasMinimumRole } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()

    const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null)
    const [stores, setStores] = useState<OrganizationStore[]>([])
    const [checkout, setCheckout] = useState<StoreAddonCheckout | null>(null)
    const [loading, setLoading] = useState(true)
    const [creatingStore, setCreatingStore] = useState(false)
    const [purchasingAddon, setPurchasingAddon] = useState(false)

    const [storeName, setStoreName] = useState('')
    const [storeAddress, setStoreAddress] = useState('')
    const [storeAfipPuntoVenta, setStoreAfipPuntoVenta] = useState('')

    const canManageBilling = hasMinimumRole('ADMIN')
    const canViewBilling = hasMinimumRole('ADMIN')

    async function loadBilling() {
        if (!orgId) {
            setLoading(false)
            return
        }

        try {
            const [subscriptionData, storesData] = await Promise.all([
                getOrganizationSubscription(orgId),
                getOrganizationStores(orgId),
            ])

            setSubscription(subscriptionData)
            setStores(storesData)
        } catch {
            toast.error(t('billing.loadError'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadBilling()
    }, [orgId])

    useEffect(() => {
        const paymentStatus = searchParams.get('status')

        if (!paymentStatus) {
            return
        }

        if (paymentStatus === 'success') {
            toast.success(t('billing.paymentSuccess'))
            void loadBilling()
        } else if (paymentStatus === 'pending') {
            toast(t('billing.paymentPending'))
            void loadBilling()
        } else if (paymentStatus === 'failure') {
            toast.error(t('billing.paymentFailure'))
        }

        const nextParams = new URLSearchParams(searchParams)
        nextParams.delete('status')
        nextParams.delete('payment_id')
        nextParams.delete('preference_id')
        nextParams.delete('external_reference')
        nextParams.delete('collection_id')
        nextParams.delete('collection_status')
        setSearchParams(nextParams, { replace: true })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function handleCreateStore(event: React.FormEvent) {
        event.preventDefault()

        if (!orgId || !subscription?.canAddStore) {
            return
        }

        setCreatingStore(true)

        try {
            await createOrganizationStore(orgId, {
                name: storeName.trim(),
                address: storeAddress.trim() || undefined,
                afipPuntoVenta: storeAfipPuntoVenta ? Number(storeAfipPuntoVenta) : undefined,
            })

            toast.success(t('billing.createStoreSuccess'))
            setStoreName('')
            setStoreAddress('')
            setStoreAfipPuntoVenta('')
            await loadBilling()
        } catch (error) {
            const message = getApiErrorMessage(error)
            toast.error(message || t('billing.createStoreError'))
        } finally {
            setCreatingStore(false)
        }
    }

    async function handleUpgrade() {
        if (!orgId) {
            return
        }

        setPurchasingAddon(true)

        try {
            const checkoutData = await initiateStoreAddonCheckout(orgId, 1)

            if (checkoutData.checkoutUrl) {
                window.location.href = checkoutData.checkoutUrl
                return
            }

            setCheckout(checkoutData)

            if (checkoutData.mockPurchaseAvailable) {
                toast(t('billing.mockCheckoutHint'))
            } else {
                toast.error(checkoutData.message || t('billing.checkoutPending'))
            }
        } catch (error) {
            const status = (error as { response?: { status?: number } }).response?.status
            const message = getApiErrorMessage(error)

            if (status === 403) {
                toast.error(message || t('billing.forbidden'))
            } else {
                toast.error(message || t('billing.upgradeError'))
            }
        } finally {
            setPurchasingAddon(false)
        }
    }

    async function handleMockPurchase() {
        if (!orgId) {
            return
        }

        setPurchasingAddon(true)

        try {
            const updatedSubscription = await purchaseStoreAddonMock(orgId, 1)
            setSubscription(updatedSubscription)
            setCheckout(null)
            toast.success(t('billing.mockPurchaseSuccess'))
            await loadBilling()
        } catch {
            toast.error(t('billing.upgradeError'))
        } finally {
            setPurchasingAddon(false)
        }
    }

    if (!canViewBilling) {
        return (
            <div className="mx-auto max-w-4xl">
                <p className="text-slate-600 dark:text-slate-300">{t('billing.noAccess')}</p>
            </div>
        )
    }

    if (loading || !subscription) {
        return <LoadingScreen />
    }

    const storeLimitReached = subscription.activeStoreCount >= subscription.allowedStores

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{t('billing.title')}</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{t('billing.description')}</p>
            </div>

            <section className="solaris-card p-6">
                <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                        <CreditCard className="text-slate-700 dark:text-slate-200" size={24} />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                            {t('billing.planTitle')}
                        </h2>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">{t('billing.plan')}</p>
                                <p className="mt-1 font-medium text-slate-950 dark:text-white">
                                    {subscription.planDisplayName
                                        || t(`billing.plans.${subscription.planCode}`, {
                                            defaultValue: subscription.planCode,
                                        })}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">{t('billing.status')}</p>
                                <p className="mt-1 font-medium text-slate-950 dark:text-white">
                                    {t(`billing.statuses.${subscription.status}`)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">{t('billing.storesUsage')}</p>
                                <p className="mt-1 font-medium text-slate-950 dark:text-white">
                                    {subscription.activeStoreCount} / {subscription.allowedStores}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">{t('billing.periodEnd')}</p>
                                <p className="mt-1 font-medium text-slate-950 dark:text-white">
                                    {formatDate(subscription.currentPeriodEnd || subscription.trialEndsAt)}
                                </p>
                            </div>
                        </div>

                        {subscription.extraStoresPurchased > 0 && (
                            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                                {t('billing.extraStores', { count: subscription.extraStoresPurchased })}
                            </p>
                        )}

                        {(subscription.activeModules?.length ?? 0) > 0 && (
                            <div className="mt-6">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    {t('billing.modulesTitle')}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {subscription.activeModules.map((moduleCode) => (
                                        <span
                                            key={moduleCode}
                                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                        >
                                            {t(`billing.modules.${moduleCode}`, { defaultValue: moduleCode })}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {storeLimitReached && canManageBilling && (
                            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                                <p className="text-sm text-amber-900 dark:text-amber-100">
                                    {t('billing.storeLimitReached')}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => void handleUpgrade()}
                                    disabled={purchasingAddon}
                                    className="solaris-button-primary mt-4"
                                >
                                    {purchasingAddon ? t('billing.upgrading') : t('billing.upgradeCtaMercadoPago')}
                                </button>

                                {checkout?.checkoutUrl && (
                                    <a
                                        href={checkout.checkoutUrl}
                                        className="solaris-button-primary mt-4 inline-flex"
                                    >
                                        {t('billing.payWithMercadoPago')}
                                    </a>
                                )}

                                {checkout?.mockPurchaseAvailable && (
                                    <div className="mt-4 space-y-2">
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            {t('billing.mockCheckoutDescription', {
                                                price: formatCurrency(checkout.unitPriceArs ?? null),
                                            })}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => void handleMockPurchase()}
                                            disabled={purchasingAddon}
                                            className="solaris-button-secondary"
                                        >
                                            {purchasingAddon
                                                ? t('billing.upgrading')
                                                : t('billing.mockPurchaseCta')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="solaris-card p-6">
                <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                        <Store className="text-slate-700 dark:text-slate-200" size={24} />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                            {t('billing.storesTitle')}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {t('billing.storesDescription')}
                        </p>

                        {stores.length === 0 ? (
                            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                                {t('billing.noStores')}
                            </p>
                        ) : (
                            <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
                                {stores.map((store) => (
                                    <li key={store.id} className="flex items-start gap-3 py-3">
                                        <Building2 size={18} className="mt-0.5 text-slate-500" />
                                        <div>
                                            <p className="font-medium text-slate-950 dark:text-white">{store.name}</p>
                                            {store.address && (
                                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                                    {store.address}
                                                </p>
                                            )}
                                            {store.afipPuntoVenta != null && (
                                                <p className="text-xs text-slate-500">
                                                    {t('billing.afipPuntoVenta', { value: store.afipPuntoVenta })}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {subscription.canAddStore ? (
                            <form onSubmit={handleCreateStore} className="mt-6 space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
                                <h3 className="font-medium text-slate-950 dark:text-white">
                                    {t('billing.createStoreTitle')}
                                </h3>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                            {t('billing.storeName')}
                                        </span>
                                        <input
                                            type="text"
                                            value={storeName}
                                            onChange={(event) => setStoreName(event.target.value)}
                                            className="solaris-input mt-1 w-full"
                                            required
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                            {t('billing.storeAddress')}
                                        </span>
                                        <input
                                            type="text"
                                            value={storeAddress}
                                            onChange={(event) => setStoreAddress(event.target.value)}
                                            className="solaris-input mt-1 w-full"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                            {t('billing.storeAfipPuntoVenta')}
                                        </span>
                                        <input
                                            type="number"
                                            min={1}
                                            value={storeAfipPuntoVenta}
                                            onChange={(event) => setStoreAfipPuntoVenta(event.target.value)}
                                            className="solaris-input mt-1 w-full"
                                        />
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={creatingStore || !storeName.trim()}
                                    className="solaris-button-primary inline-flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    {creatingStore ? t('billing.creatingStore') : t('billing.createStore')}
                                </button>
                            </form>
                        ) : (
                            !storeLimitReached && (
                                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                                    {t('billing.subscriptionInactive')}
                                </p>
                            )
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default BillingPage
