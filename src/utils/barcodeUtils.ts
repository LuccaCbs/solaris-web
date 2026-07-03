import type { BarcodeFormat } from '../types/product'

export type LabelSize = 'thermal58' | 'thermal80' | 'sheet'

export function mapBarcodeFormatToJsBarcode(format: BarcodeFormat): string {
    switch (format) {
        case 'EAN_13':
            return 'EAN13'
        case 'UPC_A':
            return 'UPC'
        case 'CODE_39':
            return 'CODE39'
        default:
            return 'CODE128'
    }
}

export function labelSizeClassName(size: LabelSize): string {
    switch (size) {
        case 'thermal58':
            return 'barcode-label-58'
        case 'thermal80':
            return 'barcode-label-80'
        default:
            return 'barcode-label-sheet'
    }
}
