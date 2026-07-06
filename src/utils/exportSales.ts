import * as XLSX from 'xlsx'
import type { Sale } from '../types/sales'

export const SALES_VOLUME_WARNING_THRESHOLD = 50

function buildSalesRows(sales: Sale[]) {
    return sales.map((sale) => ({
        SaleId: sale.id,
        PaymentMethod: sale.paymentMethod,
        ItemsCount: sale.items.length,
        TotalAmount: sale.totalAmount,
        CreatedAt: new Date(sale.createdAt).toLocaleString(),
        Items: sale.items
            .map((item) => {
                const name =
                    item.productName ?? item.customName ?? 'Custom item'

                return `${name} x${item.quantity} ($${item.subtotal})`
            })
            .join(' | '),
    }))
}

export function buildSalesExportFilename(from: string, to: string) {
    if (from === to) {
        return `ventas-${from}.xlsx`
    }

    return `ventas-${from}_a_${to}.xlsx`
}

export function buildSalesExportBlob(sales: Sale[], from: string, to: string) {
    const worksheet = XLSX.utils.json_to_sheet(buildSalesRows(sales))
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas')

    const arrayBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
    }) as ArrayBuffer

    return {
        blob: new Blob([arrayBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        filename: buildSalesExportFilename(from, to),
    }
}

export function exportSales(sales: Sale[], from?: string, to?: string) {
    const today = new Date().toISOString().split('T')[0]
    const rangeFrom = from ?? today
    const rangeTo = to ?? rangeFrom
    const { blob, filename } = buildSalesExportBlob(sales, rangeFrom, rangeTo)
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = filename
    anchor.click()

    URL.revokeObjectURL(url)
}

export function createSalesExportDownloadUrl(
    sales: Sale[],
    from: string,
    to: string,
) {
    const { blob, filename } = buildSalesExportBlob(sales, from, to)

    return {
        url: URL.createObjectURL(blob),
        filename,
    }
}
