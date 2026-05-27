import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createSupplier } from '../api/supplierService'

function NewSupplierPage() {
    const navigate = useNavigate()

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

            toast.success('Supplier created successfully')
            navigate('/suppliers')
        } catch {
            toast.error('Could not create supplier')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">New Supplier</h1>

            <p className="mt-2 solaris-muted">
                Create a supplier for future purchases and orders.
            </p>

            <form onSubmit={handleSubmit} className="solaris-panel mt-8 max-w-3xl">
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="text-sm solaris-muted">Supplier Name</label>
                        <input
                            required
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <div>
                        <label className="text-sm solaris-muted">Contact Name</label>
                        <input
                            value={contactName}
                            onChange={(event) => setContactName(event.target.value)}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <div>
                        <label className="text-sm solaris-muted">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <div>
                        <label className="text-sm solaris-muted">Phone</label>
                        <input
                            value={phone}
                            onChange={(event) => setPhone(event.target.value.replace(/\s/g, ''))}
                            placeholder="+5492611234567"
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm solaris-muted">Address</label>
                        <input
                            value={address}
                            onChange={(event) => setAddress(event.target.value)}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm solaris-muted">Notes</label>
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
                        <span className="text-sm solaris-muted">Active supplier</span>
                    </label>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        disabled={saving}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Create Supplier'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/suppliers')}
                        className="rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default NewSupplierPage