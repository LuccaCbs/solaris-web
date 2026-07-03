import type { BarcodeFormat } from '../../types/product'
import { BarcodeSvg } from './BarcodeSvg'

type BarcodePreviewFieldProps = {
    value: string
    format: BarcodeFormat
}

export function BarcodePreviewField({ value, format }: BarcodePreviewFieldProps) {
    if (!value.trim()) {
        return null
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <BarcodeSvg value={value.trim()} format={format} className="mx-auto max-w-full" />
        </div>
    )
}
