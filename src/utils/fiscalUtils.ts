import type { CustomerDocument, CustomerRequest, DocumentType } from '../types/customer'
import type { FiscalConfigRequest } from '../types/fiscal'

export function normalizeSpanishTaxId(taxId: string): string {
    return taxId.trim().toUpperCase().replace(/[\s-]/g, '')
}

export function isValidSpanishTaxId(taxId: string): boolean {
    const normalized = normalizeSpanishTaxId(taxId)
    return /^[0-9A-Z]{8,9}$/.test(normalized)
}

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
    const documents = data.documents.map((document) => ({
        documentType: document.documentType,
        documentNumber: normalizeDocumentNumber(document.documentType, document.documentNumber),
        primary: document.primary,
    }))

    return {
        documents,
        razonSocial: data.razonSocial.trim(),
        email: data.email?.trim() || undefined,
        phone: data.phone ? normalizePhone(data.phone) : undefined,
        address: data.address?.trim() || undefined,
        condicionIva: data.condicionIva,
    }
}

export function createEmptyCustomerDocument(primary = false): CustomerDocument {
    return {
        documentType: 'CUIT',
        documentNumber: '',
        primary,
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

export type VerifactuCredentials = {
    provider: 'verifactu_native'
    nif: string
    serie?: number
    certBase64: string
    certPassword: string
}

export function parseVerifactuCredentials(value: string): VerifactuCredentials | null {
    const trimmed = value.trim()

    if (!trimmed.startsWith('{')) {
        return null
    }

    try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>
        const provider = typeof parsed.provider === 'string' ? parsed.provider.trim().toLowerCase() : ''
        const nif = typeof parsed.nif === 'string' ? normalizeSpanishTaxId(parsed.nif) : ''
        const certBase64 = typeof parsed.certBase64 === 'string' ? parsed.certBase64.trim() : ''
        const certPath = typeof parsed.certPath === 'string' ? parsed.certPath.trim() : ''
        const certPassword = typeof parsed.certPassword === 'string' ? parsed.certPassword : ''
        const serie = typeof parsed.serie === 'number' ? parsed.serie : undefined

        if (provider && provider !== 'verifactu_native') {
            return null
        }

        if ((!certBase64 && !certPath) || !certPassword) {
            return null
        }

        return {
            provider: 'verifactu_native',
            nif,
            serie,
            certBase64: certBase64 || certPath,
            certPassword,
        }
    } catch {
        return null
    }
}

export function buildVerifactuCredentialsJson(input: {
    nif: string
    serie?: number
    certBase64: string
    certPassword: string
}): string {
    return JSON.stringify({
        provider: 'verifactu_native',
        nif: normalizeSpanishTaxId(input.nif),
        serie: input.serie ?? 1,
        certBase64: input.certBase64,
        certPassword: input.certPassword,
    })
}

export async function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result
            if (typeof result !== 'string') {
                reject(new Error('Unable to read certificate file'))
                return
            }

            const base64 = result.includes(',') ? result.split(',')[1] : result
            resolve(base64)
        }
        reader.onerror = () => reject(reader.error ?? new Error('Unable to read certificate file'))
        reader.readAsDataURL(file)
    })
}

export function buildFiscalConfigPayload(
    data: FiscalConfigRequest,
    options?: { isSpain?: boolean }
): FiscalConfigRequest {
    const payload: FiscalConfigRequest = {
        ...data,
        razonSocial: data.razonSocial?.trim() || undefined,
    }

    if (data.cuit != null) {
        if (options?.isSpain) {
            payload.cuit = normalizeSpanishTaxId(data.cuit) || undefined
        } else {
            payload.cuit = normalizeCuit(data.cuit) || undefined
        }
    }

    const trimmedApiKey = data.fiscalApiKey?.trim()

    if (trimmedApiKey) {
        payload.fiscalApiKey = trimmedApiKey
    } else {
        delete payload.fiscalApiKey
    }

    return payload
}

export function decodeHtmlEntities(value: string): string {
    if (!value) {
        return value
    }

    const textarea = document.createElement('textarea')
    textarea.innerHTML = value
    return textarea.value
}

export function formatRejectionReason(
    reason: string | null | undefined
): string | undefined {
    if (!reason?.trim()) {
        return undefined
    }

    return decodeHtmlEntities(reason.trim())
}
