import type { ModuleCode } from '../types/subscription'

export type ModuleNavRequirement = ModuleCode | null

export const NAV_MODULE_REQUIREMENTS: Record<string, ModuleNavRequirement> = {
    '/': null,
    '/sales': null,
    '/supplier-orders': 'INVENTORY',
    '/products': 'INVENTORY',
    '/stock/restock': 'INVENTORY',
    '/categories': 'INVENTORY',
    '/suppliers': 'INVENTORY',
    '/customers': 'CUSTOMERS',
    '/stock-movements': 'INVENTORY',
    '/audit-logs': 'AUDIT',
    '/team': 'TEAM',
    '/fiscal-documents': 'FISCAL',
    '/admin/settings': null,
    '/admin/billing': null,
    '/admin/organization': null,
    '/profile': null,
}

export function hasModuleAccess(
    activeModules: ModuleCode[],
    moduleCode: ModuleCode | null | undefined
): boolean {
    if (!moduleCode || moduleCode === 'CORE') {
        return true
    }

    return activeModules.includes(moduleCode) || activeModules.includes('CORE')
}

export function canAccessRouteByModule(
    pathname: string,
    activeModules: ModuleCode[]
): boolean {
    const normalizedPath = pathname.replace(/\/+$/, '') || '/'
    const requiredModule = NAV_MODULE_REQUIREMENTS[normalizedPath]

    if (requiredModule !== undefined) {
        return hasModuleAccess(activeModules, requiredModule)
    }

    if (normalizedPath.startsWith('/products')) {
        return hasModuleAccess(activeModules, 'INVENTORY')
    }

    if (normalizedPath.startsWith('/categories')) {
        return hasModuleAccess(activeModules, 'INVENTORY')
    }

    if (normalizedPath.startsWith('/suppliers')) {
        return hasModuleAccess(activeModules, 'INVENTORY')
    }

    if (normalizedPath.startsWith('/customers')) {
        return hasModuleAccess(activeModules, 'CUSTOMERS')
    }

    if (normalizedPath.startsWith('/supplier-orders')) {
        return hasModuleAccess(activeModules, 'INVENTORY')
    }

    if (normalizedPath.startsWith('/stock')) {
        return hasModuleAccess(activeModules, 'INVENTORY')
    }

    if (normalizedPath.startsWith('/fiscal-documents')) {
        return hasModuleAccess(activeModules, 'FISCAL')
    }

    return true
}
