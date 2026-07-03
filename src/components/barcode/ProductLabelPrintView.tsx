import type { Product } from '../../types/product'
import type { LabelSize } from '../../utils/barcodeUtils'
import { labelSizeClassName } from '../../utils/barcodeUtils'
import { BarcodeSvg } from './BarcodeSvg'

type ProductLabelPrintViewProps = {
    products: Product[]
    copies: number
    labelSize: LabelSize
    showPrice: boolean
}

export function ProductLabelPrintView({
    products,
    copies,
    labelSize,
    showPrice,
}: ProductLabelPrintViewProps) {
    const labels = products.flatMap((product) =>
        Array.from({ length: copies }, (_, index) => ({
            key: `${product.id}-${index}`,
            product,
        })),
    )

    return (
        <div className={`barcode-print-root ${labelSizeClassName(labelSize)}`}>
            {labels.map(({ key, product }) => (
                <article key={key} className="barcode-label">
                    <p className="barcode-label-name">{product.name}</p>
                    {showPrice && (
                        <p className="barcode-label-price">${product.price.toFixed(2)}</p>
                    )}
                    <BarcodeSvg
                        value={product.barcode}
                        format={product.barcodeFormat}
                        className="barcode-label-svg"
                    />
                    <p className="barcode-label-code">{product.barcode}</p>
                </article>
            ))}
        </div>
    )
}
