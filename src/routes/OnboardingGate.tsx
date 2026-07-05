import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getOnboardingStatus, type OnboardingStatus } from '../api/onboardingService'
import LoadingScreen from '../components/LoadingScreen'

const ONBOARDING_ROUTES = ['/onboarding/setup', '/onboarding/plan']

function isOnboardingRoute(pathname: string) {
    return ONBOARDING_ROUTES.some((route) => pathname.startsWith(route))
}

function OnboardingGate() {
    const location = useLocation()
    const [status, setStatus] = useState<OnboardingStatus | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        async function loadStatus() {
            setLoading(true)

            try {
                const nextStatus = await getOnboardingStatus()
                if (active) {
                    setStatus(nextStatus)
                }
            } catch {
                if (active) {
                    setStatus(null)
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        void loadStatus()

        return () => {
            active = false
        }
    }, [location.pathname])

    if (loading) {
        return <LoadingScreen />
    }

    const onOnboardingRoute = isOnboardingRoute(location.pathname)

    if (status?.needsOrganizationSetup && location.pathname !== '/onboarding/setup') {
        return <Navigate to="/onboarding/setup" replace />
    }

    if (status?.needsPlanSelection && !onOnboardingRoute) {
        return <Navigate to="/onboarding/plan" replace />
    }

    if (
        onOnboardingRoute
        && status
        && !status.needsOrganizationSetup
        && !status.needsPlanSelection
    ) {
        return <Navigate to="/" replace />
    }

    return <Outlet context={status} />
}

export default OnboardingGate
