import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import AuthPageLayout, { AUTH_FORM_CLASS } from '../components/AuthPageLayout'
import { setupOrganization } from '../api/onboardingService'
import { useAuth } from '../context/AuthContext'
import type { CountryCode } from '../types/subscription'
import { resolvePostLoginPath } from '../utils/onboardingNavigation'
import { useNavigate } from 'react-router-dom'

const COUNTRY_OPTIONS: Array<{
    code: CountryCode
    flag: string
    currency: string
}> = [
    { code: 'AR', flag: '🇦🇷', currency: 'ARS' },
    { code: 'ES', flag: '🇪🇸', currency: 'EUR' },
]

function OnboardingSetupPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { login } = useAuth()

    const [countryCode, setCountryCode] = useState<CountryCode>('AR')
    const [organizationName, setOrganizationName] = useState('')
    const [storeName, setStoreName] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        if (!organizationName.trim()) {
            toast.error(t('onboarding.setup.organizationRequired'))
            return
        }

        setLoading(true)

        try {
            const response = await setupOrganization({
                countryCode,
                organizationName: organizationName.trim(),
                storeName: storeName.trim() || undefined,
            })

            login(response.token, organizationName.trim())
            const nextPath = await resolvePostLoginPath(response.token)
            navigate(nextPath, { replace: true })
        } catch (error) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message
            toast.error(message || t('onboarding.setup.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthPageLayout>
            <form onSubmit={handleSubmit} className={`${AUTH_FORM_CLASS} px-8 pb-8 pt-6`}>
                <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
                    {t('onboarding.setup.title')}
                </h1>
                <p className="mt-2 text-sm solaris-muted">{t('onboarding.setup.description')}</p>

                <div className="mt-6">
                    <p className="text-sm font-semibold solaris-muted">{t('onboarding.setup.countryLabel')}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {COUNTRY_OPTIONS.map((option) => {
                            const selected = countryCode === option.code

                            return (
                                <button
                                    key={option.code}
                                    type="button"
                                    onClick={() => setCountryCode(option.code)}
                                    className={`rounded-xl border p-4 text-left transition ${
                                        selected
                                            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10'
                                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <div className="text-2xl">{option.flag}</div>
                                    <div className="mt-2 font-semibold text-slate-950 dark:text-white">
                                        {t(`billing.countries.${option.code}`, { defaultValue: option.code })}
                                    </div>
                                    <div className="mt-1 text-xs solaris-muted">
                                        {t('onboarding.setup.countryHint', { currency: option.currency })}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-6">
                    <label className="text-sm solaris-muted">{t('onboarding.setup.organizationLabel')}</label>
                    <input
                        className="solaris-input mt-2 w-full"
                        value={organizationName}
                        onChange={(event) => setOrganizationName(event.target.value)}
                        placeholder={t('onboarding.setup.organizationPlaceholder')}
                        required
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm solaris-muted">{t('onboarding.setup.storeLabel')}</label>
                    <input
                        className="solaris-input mt-2 w-full"
                        value={storeName}
                        onChange={(event) => setStoreName(event.target.value)}
                        placeholder={t('onboarding.setup.storePlaceholder')}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                    {loading ? t('onboarding.setup.submitting') : t('onboarding.setup.submit')}
                </button>
            </form>
        </AuthPageLayout>
    )
}

export default OnboardingSetupPage
