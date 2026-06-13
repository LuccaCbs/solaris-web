import axios from 'axios'

export type OCRProductItem = {
    name: string
    sku: string
    price: number
    stockQuantity: number
    category: string
    description: string
}

export type OCRProductExtractionResponse = {
    items: OCRProductItem[]
}

const OCR_AGENT_URL =
    import.meta.env.VITE_OCR_AGENT_URL ||
    'https://solaris-ocr-agent.onrender.com/api/v1'

export async function extractProductsFromImage(
    image: File
): Promise<OCRProductExtractionResponse> {
    const formData = new FormData()
    formData.append('file', image)

    const response = await axios.post<OCRProductExtractionResponse>(
        `${OCR_AGENT_URL}/products/extract-from-image`,
        formData
    )

    return response.data
}

export async function exportProductsToExcel(
    items: OCRProductItem[]
): Promise<File> {
    const response = await axios.post(
        `${OCR_AGENT_URL}/products/export`,
        { items },
        {
            responseType: 'blob',
        }
    )

    return new File(
        [response.data],
        'products-import.xlsx',
        {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
    )
}