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

export function buildFiscalConfigPayload(data: FiscalConfigRequest): FiscalConfigRequest {
    return {
        ...data,
        cuit: data.cuit != null ? normalizeCuit(data.cuit) || undefined : undefined,
        razonSocial: data.razonSocial?.trim() || undefined,
        fiscalApiKey: data.fiscalApiKey?.trim() || undefined,
    }
}
