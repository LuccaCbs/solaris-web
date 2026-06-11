import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { createSupplier } from '../api/supplierService'

function NewSupplierPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [contactName, setContactName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [notes, setNotes] = useState('')
    const [active, setActive] = useState(true)
    const [saving, setSaving] = useState(false)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setSaving(true)

        try {
            await createSupplier({
                name,
                contactName: contactName || undefined,
                email: email || undefined,
                phone: phone || undefined,
                address: address || undefined,
                notes: notes || undefined,
                active,
            })

            toast.success(t('supplierForm.createSuccess'))
            navigate('/suppliers')
        } catch {
            toast.error(t('supplierForm.createError'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">
                {t('supplierForm.newTitle')}
            </h1>

            <p className="mt-2 solaris-muted">
                {t('supplierForm.newDescription')}
            </p>

            <form onSubmit={handleSubmit} className="solaris-panel mt-8 max-w-3xl">
                <div className="grid gap-5 md:grid-cols-2">
                    <Input
                        required
                        label={t('supplierForm.supplierNameRequired')}
                        value={name}
                        onChange={setName}
                    />

                    <Input
                        label={t('supplierForm.contactName')}
                        value={contactName}
                        onChange={setContactName}
                    />

                    <Input
                        type="email"
                        label={t('supplierForm.email')}
                        value={email}
                        onChange={setEmail}
                    />

                    <Input
                        label={t('supplierForm.phone')}
                        value={phone}
                        onChange={(value) => setPhone(value.replace(/\s/g, ''))}
                        placeholder="+5492611234567"
                    />

                    <div className="md:col-span-2">
                        <Input
                            label={t('supplierForm.address')}
                            value={address}
                            onChange={setAddress}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm solaris-muted">
                            {t('supplierForm.notes')}
                        </label>

                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            className="solaris-input mt-2 min-h-28 w-full resize-none"
                        />
                    </div>

                    <label className="flex items-center gap-3 md:col-span-2">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(event) => setActive(event.target.checked)}
                            className="h-4 w-4"
                        />

                        <span className="text-sm solaris-muted">
                            {t('supplierForm.activeSupplier')}
                        </span>
                    </label>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        disabled={saving}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                        {saving
                            ? t('common.saving')
                            : t('supplierForm.createSupplier')}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/suppliers')}
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

export default NewSupplierPage