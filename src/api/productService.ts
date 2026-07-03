import axiosClient from './axiosClient'
import type { BarcodeFormat, Product, ProductIvaRate } from '../types/product'

export type CreateProductRequest = {
    name: string
    description: string
    barcode: string
    barcodeFormat?: BarcodeFormat
    price: number
    stockQuantity: number
    categoryId: number
    lowStockThreshold: number | null
    ivaRate?: ProductIvaRate
}

export type UpdateProductRequest = {
    name: string
    description: string
    barcode: string
    barcodeFormat?: BarcodeFormat
    price: number
    categoryId: number
    lowStockThreshold: number | null
    ivaRate?: ProductIvaRate
}

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getProducts(active?: boolean): Promise<Product[]> {
    const response = await axiosClient.get<Product[]>('/products', {
        headers: getAuthHeaders(),
        params: active === undefined ? undefined : { active },
    })

    return response.data
}

export async function createProduct(data: {
    name: string;
    description: string;
    barcode: string | null;
    barcodeFormat?: BarcodeFormat;
    price: number;
    stockQuantity: number;
    categoryId: number | null;
    lowStockThreshold: number | null;
    ivaRate?: ProductIvaRate;
}): Promise<Product> {
    const response = await axiosClient.post<Product>('/products', data, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function deactivateProduct(id: number): Promise<Product> {
    const response = await axiosClient.patch<Product>(
        `/products/${id}/deactivate`,
        {},
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function activateProduct(id: number): Promise<Product> {
    const response = await axiosClient.patch<Product>(
        `/products/${id}/activate`,
        {},
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function getProductById(id: number): Promise<Product> {
    const response = await axiosClient.get<Product>(`/products/${id}`, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function getProductByBarcode(barcode: string): Promise<Product> {
    const response = await axiosClient.get<Product>(`/products/by-barcode/${encodeURIComponent(barcode)}`, {
        headers: getAuthHeaders(),
    })

    return response.data
}

export async function updateProduct(
    id: number,
    data: {
        name: string;
        description: string;
        barcode: string;
        barcodeFormat?: BarcodeFormat;
        price: number;
        categoryId: number | null;
        lowStockThreshold: number | null;
        ivaRate?: ProductIvaRate;
    }
): Promise<Product> {
    const response = await axiosClient.put<Product>(`/products/${id}`, data, {
        headers: getAuthHeaders(),
    })

    return response.data
}
export type ProductImportMode = 'CREATE_ONLY' | 'CREATE_OR_UPDATE'

export type ProductImportResponse = {
    createdCount: number
    updatedCount: number
    failedCount: number
    errors: string[]
}
export async function importProducts(
    file: File,
    mode: ProductImportMode
): Promise<ProductImportResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('solaris_token')

    const response = await axiosClient.post<ProductImportResponse>(
        `/products/import?mode=${mode}`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )

    return response.data
}

export async function downloadProductImportTemplate() {
    const response = await axiosClient.get('/products/import/template', {
        responseType: 'blob',
    })

    const url = window.URL.createObjectURL(response.data)
    const link = document.createElement('a')

    link.href = url
    link.download = 'products-import-template.xlsx'
    document.body.appendChild(link)
    link.click()

    link.remove()
    window.URL.revokeObjectURL(url)
}