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
    const [loadedForPath, setLoadedForPath] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        setLoading(true)
        setLoadedForPath(null)

        async function loadStatus() {
            try {
                const nextStatus = await getOnboardingStatus()
                if (!active) {
                    return
                }
                setStatus(nextStatus)
                setLoadedForPath(location.pathname)
            } catch {
                if (active) {
                    setStatus(null)
                    setLoadedForPath(location.pathname)
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

    const isReady = !loading && loadedForPath === location.pathname

    if (!isReady) {
        return <LoadingScreen />
    }

    const onOnboardingRoute = isOnboardingRoute(location.pathname)

    if (status?.needsOrganizationSetup && location.pathname !== '/onboarding/setup') {
        return <Navigate to="/onboarding/setup" replace />
    }

    if (status?.needsPlanSelection && location.pathname !== '/onboarding/plan') {
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
