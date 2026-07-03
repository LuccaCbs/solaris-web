import { useTranslation } from 'react-i18next'
import { ScanLine } from 'lucide-react'
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner'

type BarcodeScanInputProps = {
    onScan: (barcode: string) => void
}

export function BarcodeScanInput({ onScan }: BarcodeScanInputProps) {
    const { t } = useTranslation()
    const { bindScannerInput } = useBarcodeScanner({
        enabled: false,
        onScan,
    })

    return (
        <div className="relative">
            <ScanLine
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
            />

            <input
                data-barcode-scanner="true"
                type="text"
                autoComplete="off"
                placeholder={t('barcode.scan.inputPlaceholder')}
                onKeyDown={bindScannerInput}
                className="solaris-input w-full pl-10"
            />
        </div>
    )
}
