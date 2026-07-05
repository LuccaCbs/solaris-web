import { describe, expect, it } from 'vitest'
import { canAccessRouteByModule, hasModuleAccess } from './moduleAccess'

const CORE_INVENTORY: ['CORE', 'INVENTORY'] = ['CORE', 'INVENTORY']

describe('hasModuleAccess', () => {
    it('grants access when moduleCode is null, undefined, or CORE', () => {
        expect(hasModuleAccess(CORE_INVENTORY, null)).toBe(true)
        expect(hasModuleAccess(CORE_INVENTORY, undefined)).toBe(true)
        expect(hasModuleAccess(CORE_INVENTORY, 'CORE')).toBe(true)
    })

    it('grants access only when the module is explicitly active', () => {
        expect(hasModuleAccess(CORE_INVENTORY, 'INVENTORY')).toBe(true)
        expect(hasModuleAccess(CORE_INVENTORY, 'FISCAL')).toBe(false)
        expect(hasModuleAccess(CORE_INVENTORY, 'AUDIT')).toBe(false)
        expect(hasModuleAccess(CORE_INVENTORY, 'TEAM')).toBe(false)
        expect(hasModuleAccess(CORE_INVENTORY, 'CUSTOMERS')).toBe(false)
    })

    it('does not treat CORE as a wildcard for other modules', () => {
        expect(hasModuleAccess(['CORE'], 'INVENTORY')).toBe(false)
        expect(hasModuleAccess(['CORE'], 'FISCAL')).toBe(false)
    })
})

describe('canAccessRouteByModule', () => {
    it('allows core routes for freemium CORE + INVENTORY subscriptions', () => {
        expect(canAccessRouteByModule('/', CORE_INVENTORY)).toBe(true)
        expect(canAccessRouteByModule('/sales', CORE_INVENTORY)).toBe(true)
        expect(canAccessRouteByModule('/products', CORE_INVENTORY)).toBe(true)
        expect(canAccessRouteByModule('/supplier-orders', CORE_INVENTORY)).toBe(true)
    })

    it('blocks module-gated routes without the required module', () => {
        expect(canAccessRouteByModule('/customers', CORE_INVENTORY)).toBe(false)
        expect(canAccessRouteByModule('/audit-logs', CORE_INVENTORY)).toBe(false)
        expect(canAccessRouteByModule('/team', CORE_INVENTORY)).toBe(false)
        expect(canAccessRouteByModule('/fiscal-documents', CORE_INVENTORY)).toBe(false)
    })
})
