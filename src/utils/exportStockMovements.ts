import * as XLSX from 'xlsx'
import type { StockMovement } from '../types/stockMovement'

export function exportStockMovements(
    movements: StockMovement[]
) {
    const data = movements.map((movement) => ({
        Product: movement.productName,
        Type: movement.type,
        Quantity: movement.quantity,
        PreviousStock: movement.previousStock,
        CurrentStock: movement.currentStock,
        Reason: movement.reason,
        CreatedAt: new Date(movement.createdAt).toLocaleString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'StockMovements'
    )

    XLSX.writeFile(
        workbook,
        `stock-movements-${new Date().toISOString()}.xlsx`
    )
}