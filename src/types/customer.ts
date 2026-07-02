export type DocumentType = 'CUIT' | 'CUIL' | 'DNI'

export type CondicionIva =
    | 'RESPONSABLE_INSCRIPTO'
    | 'MONOTRIBUTO'
    | 'EXENTO'
    | 'CONSUMIDOR_FINAL'
    | 'NO_CATEGORIZADO'

export type Customer = {
    id: number
    documentType: DocumentType
    documentNumber: string
    razonSocial: string
    email: string | null
    phone: string | null
    address: string | null
    condicionIva: CondicionIva
    createdAt: string
    updatedAt: string
}

export type CustomerRequest = {
    documentType: DocumentType
    documentNumber: string
    razonSocial: string
    email?: string
    phone?: string
    address?: string
    condicionIva: CondicionIva
}
