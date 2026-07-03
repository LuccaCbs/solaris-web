import type { CustomerRequest, DocumentType } from '../types/customer'
import type { FiscalConfigRequest } from '../types/fiscal'

export function normalizeCuit(cuit: string): string {
    return cuit.replace(/\D/g, '')
}

export function formatCuitForDisplay(cuit: string | null | undefined): string {
    if (!cuit) {
        return ''
    }

    const digits = normalizeCuit(cuit)

    if (digits.length !== 11) {
        return cuit
    }

    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
}

export function normalizeDocumentNumber(
    documentType: DocumentType,
    documentNumber: string
): string {
    const trimmed = documentNumber.trim()

    if (documentType === 'CUIT' || documentType === 'CUIL') {
        return normalizeCuit(trimmed)
    }

    return trimmed.replace(/\D/g, '')
}

export function normalizePhone(value: string): string | undefined {
    const normalized = value.replace(/\s/g, '').trim()
    return normalized.length > 0 ? normalized : undefined
}

export function buildCustomerPayload(data: CustomerRequest): CustomerRequest {
    return {
        documentType: data.documentType,
        documentNumber: normalizeDocumentNumber(data.documentType, data.documentNumber),
        razonSocial: data.razonSocial.trim(),
        email: data.email?.trim() || undefined,
        phone: data.phone ? normalizePhone(data.phone) : undefined,
        address: data.address?.trim() || undefined,
        condicionIva: data.condicionIva,
    }
}

export type TusFacturasCredentials = {
    apikey: string
    apitoken: string
    usertoken: string
}

export function parseTusFacturasCredentials(
    value: string
): TusFacturasCredentials | null {
    const trimmed = value.trim()

    if (!trimmed.startsWith('{')) {
        return null
    }

    try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>
        const apikey = typeof parsed.apikey === 'string' ? parsed.apikey.trim() : ''
        const apitoken = typeof parsed.apitoken === 'string' ? parsed.apitoken.trim() : ''
        const usertoken = typeof parsed.usertoken === 'string' ? parsed.usertoken.trim() : ''

        if (!apikey || !apitoken || !usertoken) {
            return null
        }

        return { apikey, apitoken, usertoken }
    } catch {
        return null
    }
}

export function buildFiscalConfigPayload(data: FiscalConfigRequest): FiscalConfigRequest {
    const payload: FiscalConfigRequest = {
        ...data,
        cuit: data.cuit != null ? normalizeCuit(data.cuit) || undefined : undefined,
        razonSocial: data.razonSocial?.trim() || undefined,
    }

    const trimmedApiKey = data.fiscalApiKey?.trim()

    if (trimmedApiKey) {
        payload.fiscalApiKey = trimmedApiKey
    } else {
        delete payload.fiscalApiKey
    }

    return payload
}
