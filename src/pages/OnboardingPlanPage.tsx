import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { ExternalLink, RefreshCw } from 'lucide-react'
import AuthPageLayout, { AUTH_FORM_CLASS } from '../components/AuthPageLayout'
import LoadingScreen from '../components/LoadingScreen'
import { getOnboardingStatus } from '../api/onboardingService'
import { getBillingSessionToken } from '../api/subscriptionService'
import { buildBillingPortalUrl } from '../config/billing'
import { useAuth } from '../context/AuthContext'
import { resolvePostLoginPath } from '../utils/onboardingNavigation'
import { useNavigate } from 'react-router-dom'

function OnboardingPlanPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { orgId, logout } = useAuth()

    const [portalUrl, setPortalUrl] = useState<string | null>(null)
    const [organizationName, setOrganizationName] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    async function loadPortalUrl() {
        if (!orgId) {
            setLoading(false)
            return
        }

        try {
            const [status, tokenResponse] = await Promise.all([
                getOnboardingStatus(),
                getBillingSessionToken(orgId),
            ])

            setOrganizationName(status.organizationName ?? null)
            setPortalUrl(buildBillingPortalUrl(tokenResponse.billingToken))
        } catch {
            toast.error(t('onboarding.plan.loadError'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadPortalUrl()
    }, [orgId])

    async function handleRefresh() {
        setRefreshing(true)

        try {
            const status = await getOnboardingStatus()

            if (!status.needsPlanSelection) {
                const token = localStorage.getItem('solaris_token')

                if (token) {
                    navigate(await resolvePostLoginPath(token), { replace: true })
                    return
                }

                navigate('/', { replace: true })
                return
            }

            toast.error(t('onboarding.plan.stillPending'))
        } catch {
            toast.error(t('onboarding.plan.loadError'))
        } finally {
            setRefreshing(false)
        }
    }

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <AuthPageLayout>
            <div className={`${AUTH_FORM_CLASS} px-8 pb-8 pt-6`}>
                <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
                    {t('onboarding.plan.title')}
                </h1>
                <p className="mt-2 text-sm solaris-muted">{t('onboarding.plan.description')}</p>

                {organizationName && (
                    <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
                        {t('onboarding.plan.organization', { name: organizationName })}
                    </p>
                )}

                <ul className="mt-5 space-y-2 text-sm solaris-muted">
                    <li>{t('onboarding.plan.step1')}</li>
                    <li>{t('onboarding.plan.step2')}</li>
                    <li>{t('onboarding.plan.step3')}</li>
                </ul>

                {portalUrl ? (
                    <a
                        href={portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500"
                    >
                        {t('onboarding.plan.openPortal')}
                        <ExternalLink size={18} />
                    </a>
                ) : (
                    <p className="mt-6 text-sm text-red-600 dark:text-red-400">
                        {t('onboarding.plan.loadError')}
                    </p>
                )}

                <button
                    type="button"
                    onClick={() => void handleRefresh()}
                    disabled={refreshing}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? t('onboarding.plan.refreshing') : t('onboarding.plan.refresh')}
                </button>

                <button
                    type="button"
                    onClick={logout}
                    className="mt-4 w-full text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                    {t('onboarding.plan.logout')}
                </button>
            </div>
        </AuthPageLayout>
    )
}

export default OnboardingPlanPage
