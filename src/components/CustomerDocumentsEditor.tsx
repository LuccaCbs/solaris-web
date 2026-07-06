import { useTranslation } from 'react-i18next'
import type { CustomerDocument, DocumentType } from '../types/customer'

const DOCUMENT_TYPES: DocumentType[] = ['CUIT', 'CUIL', 'DNI']

type CustomerDocumentsEditorProps = {
    documents: CustomerDocument[]
    onChange: (documents: CustomerDocument[]) => void
}

export function CustomerDocumentsEditor({
    documents,
    onChange,
}: CustomerDocumentsEditorProps) {
    const { t } = useTranslation()

    function updateDocument(index: number, patch: Partial<CustomerDocument>) {
        onChange(
            documents.map((document, documentIndex) =>
                documentIndex === index ? { ...document, ...patch } : document
            )
        )
    }

    function setPrimary(index: number) {
        onChange(
            documents.map((document, documentIndex) => ({
                ...document,
                primary: documentIndex === index,
            }))
        )
    }

    function removeDocument(index: number) {
        if (documents.length <= 1) {
            return
        }

        const nextDocuments = documents.filter((_, documentIndex) => documentIndex !== index)

        if (!nextDocuments.some((document) => document.primary)) {
            nextDocuments[0] = { ...nextDocuments[0], primary: true }
        }

        onChange(nextDocuments)
    }

    function addDocument() {
        onChange([
            ...documents,
            {
                documentType: 'DNI',
                documentNumber: '',
                primary: false,
            },
        ])
    }

    return (
        <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                    {t('customerForm.documentsTitle')}
                </h2>

                <button
                    type="button"
                    onClick={addDocument}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    {t('customerForm.addDocument')}
                </button>
            </div>

            {documents.map((document, index) => (
                <div
                    key={index}
                    className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-2 dark:border-slate-800"
                >
                    <Select
                        required
                        label={t('customerForm.documentTypeRequired')}
                        value={document.documentType}
                        onChange={(value) =>
                            updateDocument(index, { documentType: value as DocumentType })
                        }
                        options={DOCUMENT_TYPES.map((type) => ({
                            value: type,
                            label: t(`customerForm.documentTypes.${type}`),
                        }))}
                    />

                    <Input
                        required
                        label={t('customerForm.documentNumberRequired')}
                        value={document.documentNumber}
                        onChange={(value) => updateDocument(index, { documentNumber: value })}
                    />

                    <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <input
                                type="radio"
                                name="primaryDocument"
                                checked={Boolean(document.primary)}
                                onChange={() => setPrimary(index)}
                            />
                            {t('customerForm.primaryDocument')}
                        </label>

                        {documents.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeDocument(index)}
                                className="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400"
                            >
                                {t('customerForm.removeDocument')}
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

type InputProps = {
    label: string
    value: string
    onChange: (value: string) => void
    type?: string
    required?: boolean
    placeholder?: string
}

function Input({
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    placeholder,
}: InputProps) {
    return (
        <div>
            <label className="text-sm solaris-muted">
                {label}
            </label>

            <input
                required={required}
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="solaris-input mt-2 w-full"
            />
        </div>
    )
}

type SelectProps = {
    label: string
    value: string
    onChange: (value: string) => void
    options: Array<{ value: string; label: string }>
    required?: boolean
}

function Select({
    label,
    value,
    onChange,
    options,
    required = false,
}: SelectProps) {
    return (
        <div>
            <label className="text-sm solaris-muted">
                {label}
            </label>

            <select
                required={required}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="solaris-input mt-2 w-full"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}
