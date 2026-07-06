import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { createCustomer } from '../api/customerService'
import { CustomerDocumentsEditor } from '../components/CustomerDocumentsEditor'
import type { CondicionIva } from '../types/customer'
import { createEmptyCustomerDocument } from '../utils/fiscalUtils'

const CONDICIONES_IVA: CondicionIva[] = [
    'RESPONSABLE_INSCRIPTO',
    'MONOTRIBUTO',
    'EXENTO',
    'CONSUMIDOR_FINAL',
    'NO_CATEGORIZADO',
]

function NewCustomerPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [documents, setDocuments] = useState([createEmptyCustomerDocument(true)])
    const [razonSocial, setRazonSocial] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [condicionIva, setCondicionIva] = useState<CondicionIva>('CONSUMIDOR_FINAL')
    const [saving, setSaving] = useState(false)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setSaving(true)

        try {
            await createCustomer({
                documents,
                razonSocial,
                email: email || undefined,
                phone: phone || undefined,
                address: address || undefined,
                condicionIva,
            })

            toast.success(t('customerForm.createSuccess'))
            navigate('/customers')
        } catch {
            toast.error(t('customerForm.createError'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">
                {t('customerForm.newTitle')}
            </h1>

            <p className="mt-2 solaris-muted">
                {t('customerForm.newDescription')}
            </p>

            <form onSubmit={handleSubmit} className="solaris-panel mt-8 max-w-3xl">
                <div className="grid gap-5 md:grid-cols-2">
                    <CustomerDocumentsEditor
                        documents={documents}
                        onChange={setDocuments}
                    />

                    <div className="md:col-span-2">
                        <Input
                            required
                            label={t('customerForm.razonSocialRequired')}
                            value={razonSocial}
                            onChange={setRazonSocial}
                        />
                    </div>

                    <Input
                        type="email"
                        label={t('customerForm.email')}
                        value={email}
                        onChange={setEmail}
                    />

                    <Input
                        label={t('customerForm.phone')}
                        value={phone}
                        onChange={(value) => setPhone(value.replace(/\s/g, ''))}
                        placeholder="+5492611234567"
                    />

                    <div className="md:col-span-2">
                        <Input
                            label={t('customerForm.address')}
                            value={address}
                            onChange={setAddress}
                        />
                    </div>

                    <Select
                        required
                        label={t('customerForm.condicionIvaRequired')}
                        value={condicionIva}
                        onChange={(value) => setCondicionIva(value as CondicionIva)}
                        options={CONDICIONES_IVA.map((value) => ({
                            value,
                            label: t(`customers.condicionesIva.${value}`),
                        }))}
                    />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        disabled={saving}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                        {saving
                            ? t('common.saving')
                            : t('customerForm.createCustomer')}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/customers')}
                        className="rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </form>
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

export default NewCustomerPage
