export type DocumentType = 'CUIT' | 'CUIL' | 'DNI'

export type CondicionIva =
    | 'RESPONSABLE_INSCRIPTO'
    | 'MONOTRIBUTO'
    | 'EXENTO'
    | 'CONSUMIDOR_FINAL'
    | 'NO_CATEGORIZADO'

export type CustomerDocument = {
    id?: number
    documentType: DocumentType
    documentNumber: string
    primary?: boolean
}

export type Customer = {
    id: number
    documentType: DocumentType
    documentNumber: string
    documents: CustomerDocument[]
    razonSocial: string
    email: string | null
    phone: string | null
    address: string | null
    condicionIva: CondicionIva
    active?: boolean
    createdAt: string
    updatedAt: string
}

export type CustomerRequest = {
    documents: CustomerDocument[]
    razonSocial: string
    email?: string
    phone?: string
    address?: string
    condicionIva: CondicionIva
}

export function getPrimaryDocument(customer: Pick<Customer, 'documents' | 'documentType' | 'documentNumber'>): CustomerDocument {
    const fromList = customer.documents?.find((document) => document.primary)
        ?? customer.documents?.[0]

    if (fromList) {
        return fromList
    }

    return {
        documentType: customer.documentType,
        documentNumber: customer.documentNumber,
        primary: true,
    }
}

export function formatCustomerDocumentsCompact(customer: Pick<Customer, 'documents' | 'documentType' | 'documentNumber'>): string {
    const primary = getPrimaryDocument(customer)
    const totalDocuments = customer.documents?.length ?? 1
    const extraCount = totalDocuments - 1
    const base = `${primary.documentType} ${primary.documentNumber}`

    return extraCount > 0 ? `${base} (+${extraCount})` : base
}
