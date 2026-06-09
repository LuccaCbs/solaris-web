import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type PasswordInputProps = {
    value: string
    onChange: (value: string) => void
    required?: boolean
    placeholder?: string
    className?: string
    autoFocus?: boolean
}

function PasswordInput({
                           value,
                           onChange,
                           required = false,
                           placeholder,
                           className = '',
                           autoFocus = false,
                       }: PasswordInputProps) {
    const [visible, setVisible] = useState(false)

    return (
        <div className="relative">
            <input
                required={required}
                autoFocus={autoFocus}
                type={visible ? 'text' : 'password'}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className={`pr-12 ${className}`}
            />

            <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label={visible ? 'Hide password' : 'Show password'}
            >
                {visible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
    )
}

export default PasswordInput