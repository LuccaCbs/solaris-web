import axiosClient from './axiosClient'
import type {
    EmitInvoiceRequest,
    FiscalConfig,
    FiscalConfigRequest,
    FiscalDocument,
} from '../types/fiscal'
import { buildFiscalConfigPayload } from '../utils/fiscalUtils'
export async function getFiscalConfig(orgId: number): Promise<FiscalConfig> {
    const response = await axiosClient.get<FiscalConfig>(`/organizations/${orgId}/fiscal-config`)
    return response.data
}

export async function updateFiscalConfig(
    orgId: number,
    data: FiscalConfigRequest,
    options?: { isSpain?: boolean }
): Promise<FiscalConfig> {
    const response = await axiosClient.put<FiscalConfig>(
        `/organizations/${orgId}/fiscal-config`,
        buildFiscalConfigPayload(data, options)
    )

    return response.data
}

export async function getVerifactuFiscalPreviewHtml(orgId: number): Promise<string> {
    const response = await axiosClient.get<string>(
        `/organizations/${orgId}/fiscal/verifactu/preview`,
        { responseType: 'text' }
    )

    return response.data
}

export async function getFiscalDocuments(): Promise<FiscalDocument[]> {
    const response = await axiosClient.get<FiscalDocument[]>('/fiscal-documents')
    return response.data
}

export async function getFiscalDocumentById(id: number): Promise<FiscalDocument> {
    const response = await axiosClient.get<FiscalDocument>(`/fiscal-documents/${id}`)
    return response.data
}

export async function getFiscalDocumentBySaleId(saleId: number): Promise<FiscalDocument> {
    const response = await axiosClient.get<FiscalDocument>(`/fiscal-documents/by-sale/${saleId}`)
    return response.data
}

export async function emitInvoiceForSale(
    saleId: number,
    data?: EmitInvoiceRequest
): Promise<FiscalDocument> {
    const response = await axiosClient.post<FiscalDocument>(`/sales/${saleId}/invoice`, data ?? {})
    return response.data
}
