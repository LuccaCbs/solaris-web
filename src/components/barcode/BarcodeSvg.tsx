import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import type { BarcodeFormat } from '../../types/product'
import { mapBarcodeFormatToJsBarcode } from '../../utils/barcodeUtils'

type BarcodeSvgProps = {
    value: string
    format: BarcodeFormat
    className?: string
}

export function BarcodeSvg({ value, format, className }: BarcodeSvgProps) {
    const svgRef = useRef<SVGSVGElement | null>(null)

    useEffect(() => {
        if (!svgRef.current || !value) {
            return
        }

        try {
            JsBarcode(svgRef.current, value, {
                format: mapBarcodeFormatToJsBarcode(format),
                displayValue: true,
                fontSize: 14,
                height: 48,
                margin: 8,
            })
        } catch {
            JsBarcode(svgRef.current, value, {
                format: 'CODE128',
                displayValue: true,
                fontSize: 14,
                height: 48,
                margin: 8,
            })
        }
    }, [format, value])

    return <svg ref={svgRef} className={className} />
}
