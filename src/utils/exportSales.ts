import * as XLSX from 'xlsx'
import type { Sale } from '../types/sales'

export function exportSales(sales: Sale[]) {
    const data = sales.map((sale) => ({
        SaleId: sale.id,
        PaymentMethod: sale.paymentMethod,
        ItemsCount: sale.items.length,
        TotalAmount: sale.totalAmount,
        CreatedAt: new Date(sale.createdAt).toLocaleString(),
        Items: sale.items
            .map((item) => `${item.productName} x${item.quantity} ($${item.subtotal})`)
            .join(' | '),
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales')

    XLSX.writeFile(
        workbook,
        `sales-${new Date().toISOString()}.xlsx`
    )
}