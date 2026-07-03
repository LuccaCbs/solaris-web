import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEntitlements } from '../hooks/useEntitlements'
import { getDefaultRouteForRole } from '../utils/roleAccess'
import { canAccessRouteByModule } from '../utils/moduleAccess'

function RoleProtectedRoute() {
    const location = useLocation()
    const { canAccessRoute, role } = useAuth()
    const { activeModules, isLoading } = useEntitlements()

    if (!canAccessRoute(location.pathname)) {
        return <Navigate to={getDefaultRouteForRole(role)} replace />
    }

    if (!isLoading && !canAccessRouteByModule(location.pathname, activeModules)) {
        return <Navigate to={getDefaultRouteForRole(role)} replace />
    }

    return <Outlet />
}

export default RoleProtectedRoute
