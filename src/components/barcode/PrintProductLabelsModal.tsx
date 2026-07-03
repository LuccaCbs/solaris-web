import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, X } from 'lucide-react'
import type { Product } from '../../types/product'
import type { LabelSize } from '../../utils/barcodeUtils'
import { ProductLabelPrintView } from './ProductLabelPrintView'

type PrintProductLabelsModalProps = {
    products: Product[]
    onClose: () => void
}

export function PrintProductLabelsModal({
    products,
    onClose,
}: PrintProductLabelsModalProps) {
    const { t } = useTranslation()
    const [copies, setCopies] = useState(1)
    const [labelSize, setLabelSize] = useState<LabelSize>('thermal58')
    const [showPrice, setShowPrice] = useState(true)

    function handlePrint() {
        window.print()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                            {t('barcode.print.title')}
                        </h2>
                        <p className="text-sm solaris-muted">
                            {t('barcode.print.subtitle', { count: products.length })}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 solaris-muted hover:bg-slate-100 dark:hover:bg-slate-900"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 px-5 py-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <label className="text-sm">
                            <span className="mb-1 block font-medium">{t('barcode.print.copies')}</span>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={copies}
                                onChange={(event) => setCopies(Number(event.target.value) || 1)}
                                className="solaris-input w-full"
                            />
                        </label>

                        <label className="text-sm sm:col-span-2">
                            <span className="mb-1 block font-medium">{t('barcode.print.labelSize')}</span>
                            <select
                                value={labelSize}
                                onChange={(event) => setLabelSize(event.target.value as LabelSize)}
                                className="solaris-input w-full"
                            >
                                <option value="thermal58">{t('barcode.print.sizes.thermal58')}</option>
                                <option value="thermal80">{t('barcode.print.sizes.thermal80')}</option>
                                <option value="sheet">{t('barcode.print.sizes.sheet')}</option>
                            </select>
                        </label>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={showPrice}
                            onChange={(event) => setShowPrice(event.target.checked)}
                        />
                        {t('barcode.print.showPrice')}
                    </label>

                    <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                        <ProductLabelPrintView
                            products={products}
                            copies={1}
                            labelSize={labelSize}
                            showPrice={showPrice}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="solaris-button-secondary">
                        {t('common.cancel')}
                    </button>
                    <button type="button" onClick={handlePrint} className="solaris-button-primary inline-flex items-center gap-2">
                        <Printer size={16} />
                        {t('barcode.print.action')}
                    </button>
                </div>
            </div>

            <div className="hidden print:block">
                <ProductLabelPrintView
                    products={products}
                    copies={copies}
                    labelSize={labelSize}
                    showPrice={showPrice}
                />
            </div>
        </div>
    )
}
