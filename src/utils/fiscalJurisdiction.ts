export type FiscalJurisdiction = 'AR_AFIP' | 'ES_VERIFACTU'

export function isSpainFiscalJurisdiction(
    jurisdiction: FiscalJurisdiction | null | undefined
): boolean {
    return jurisdiction === 'ES_VERIFACTU'
}

export function isArgentinaFiscalJurisdiction(
    jurisdiction: FiscalJurisdiction | null | undefined
): boolean {
    return jurisdiction == null || jurisdiction === 'AR_AFIP'
}
