import { getOnboardingStatus } from '../api/onboardingService'
import { persistAuthSession, buildAuthSession } from './jwtUtils'
import { getDefaultRouteForRole } from './roleAccess'

export async function resolvePostLoginPath(token: string): Promise<string> {
    const session = buildAuthSession(token)

    if (!session) {
        return '/login'
    }

    persistAuthSession(session)

    try {
        const status = await getOnboardingStatus()

        if (!status.emailVerified) {
            return '/login'
        }

        if (status.needsOrganizationSetup) {
            return '/onboarding/setup'
        }

        if (status.needsPlanSelection) {
            return '/onboarding/plan'
        }
    } catch {
        if (!session.orgId) {
            return '/onboarding/setup'
        }
    }

    return getDefaultRouteForRole(session.role)
}
