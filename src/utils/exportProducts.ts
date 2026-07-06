import * as XLSX from 'xlsx'
import type { Product } from '../types/product'

function buildProductRows(products: Product[]) {
    return products.map((product) => ({
        Id: product.id,
        Name: product.name,
        Barcode: product.barcode,
        Category: product.categoryName ?? '',
        Stock: product.stockQuantity,
        Price: product.price,
        LowStockThreshold: product.lowStockThreshold ?? '',
        LowStock: product.lowStock ? 'Yes' : 'No',
        Active: product.active === false ? 'No' : 'Yes',
        Description: product.description ?? '',
    }))
}

export function buildProductsExportFilename() {
    const today = new Date().toISOString().split('T')[0]

    return `productos-${today}.xlsx`
}

export function buildProductsExportBlob(products: Product[]) {
    const worksheet = XLSX.utils.json_to_sheet(buildProductRows(products))
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos')

    const arrayBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
    }) as ArrayBuffer

    return {
        blob: new Blob([arrayBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        filename: buildProductsExportFilename(),
    }
}

export function createProductsExportDownloadUrl(products: Product[]) {
    const { blob, filename } = buildProductsExportBlob(products)

    return {
        url: URL.createObjectURL(blob),
        filename,
    }
}
