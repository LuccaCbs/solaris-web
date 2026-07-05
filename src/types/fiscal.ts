export type FiscalProviderType = 'MOCK' | 'TUSFACTURAS'

export type FiscalJurisdiction = 'AR_AFIP' | 'ES_VERIFACTU'

export type CountryCode = 'AR' | 'ES'

export type TipoComprobante = 'FACTURA_B' | 'FACTURA_C'

export type FiscalDocumentStatus = 'PENDING' | 'AUTHORIZED' | 'REJECTED'

export type CondicionIva =
    | 'RESPONSABLE_INSCRIPTO'
    | 'MONOTRIBUTO'
    | 'EXENTO'
    | 'CONSUMIDOR_FINAL'
    | 'NO_CATEGORIZADO'

export type FiscalConfig = {
    cuit: string | null
    razonSocial: string
    condicionIva: CondicionIva
    fiscalPuntoVenta: number | null
    fiscalProvider: FiscalProviderType
    hasFiscalApiKey: boolean
    countryCode?: CountryCode
    fiscalJurisdiction?: FiscalJurisdiction
}

export type FiscalConfigRequest = {
    cuit?: string
    razonSocial?: string
    condicionIva?: CondicionIva
    fiscalPuntoVenta?: number | null
    fiscalProvider?: FiscalProviderType
    fiscalApiKey?: string
}

export type FiscalDocument = {
    id: number
    organizationId: number
    storeId: number | null
    saleId: number | null
    customerId: number | null
    customerRazonSocial: string
    tipoComprobante: TipoComprobante
    puntoVenta: number
    numeroComprobante: number
    cae: string | null
    caeVencimiento: string | null
    importeNeto: number
    importeIva: number
    importeTotal: number
    status: FiscalDocumentStatus
    rejectionReason?: string | null
    pdfUrl: string | null
    createdAt: string
}

export type EmitInvoiceRequest = {
    customerId?: number | null
}
