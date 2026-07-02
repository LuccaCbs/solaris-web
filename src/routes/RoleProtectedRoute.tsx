import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDefaultRouteForRole } from '../utils/roleAccess'

function RoleProtectedRoute() {
    const location = useLocation()
    const { canAccessRoute, role } = useAuth()

    if (!canAccessRoute(location.pathname)) {
        return <Navigate to={getDefaultRouteForRole(role)} replace />
    }

    return <Outlet />
}

export default RoleProtectedRoute
