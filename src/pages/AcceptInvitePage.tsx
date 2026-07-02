import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'
import {
    acceptOrganizationInvite,
    previewOrganizationInvite,
    type OrganizationInvitePreview,
} from '../api/organizationService'

function AcceptInvitePage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { t } = useTranslation()
    const { login, isAuthenticated, user } = useAuth()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [preview, setPreview] = useState<OrganizationInvitePreview | null>(null)
    const [error, setError] = useState('')
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [password, setPassword] = useState('')

    const token = searchParams.get('token')

    useEffect(() => {
        async function loadPreview() {
            if (!token) {
                setError(t('team.accept.missingToken'))
                setLoading(false)
                return
            }

            try {
                const data = await previewOrganizationInvite(token)
                setPreview(data)

                if (data.expired) {
                    setError(t('team.accept.expired'))
                }
            } catch {
                setError(t('team.accept.invalidToken'))
            } finally {
                setLoading(false)
            }
        }

        void loadPreview()
    }, [token, t])

    async function handleAccept(event?: React.FormEvent) {
        event?.preventDefault()

        if (!token || !preview || preview.expired) return

        setSubmitting(true)
        setError('')

        try {
            const response = await acceptOrganizationInvite({
                token,
                password: preview.existingUser ? password : password,
                firstname: preview.existingUser ? undefined : firstname,
                lastname: preview.existingUser ? undefined : lastname,
            })

            login(response.token)
            toast.success(t('team.accept.success'))
            navigate('/')
        } catch {
            setError(t('team.accept.error'))
            toast.error(t('team.accept.error'))
        } finally {
            setSubmitting(false)
        }
    }

    async function handleAcceptAsLoggedInUser() {
        if (!token) return

        setSubmitting(true)
        setError('')

        try {
            const response = await acceptOrganizationInvite({ token })
            login(response.token)
            toast.success(t('team.accept.success'))
            navigate('/')
        } catch {
            setError(t('team.accept.error'))
            toast.error(t('team.accept.error'))
        } finally {
            setSubmitting(false)
        }
    }

    const canAcceptAsCurrentUser =
        isAuthenticated &&
        preview &&
        user?.email.toLowerCase() === preview.email.toLowerCase()

    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
                <h1 className="text-3xl font-bold">{t('team.accept.title')}</h1>

                {loading && (
                    <p className="mt-4 text-sm text-slate-400">
                        {t('team.accept.loading')}
                    </p>
                )}

                {error && !loading && (
                    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {preview && !preview.expired && !loading && (
                    <>
                        <p className="mt-4 text-sm text-slate-400">
                            {t('team.accept.description', {
                                organization: preview.organizationName,
                                role: t(`auth.roles.${preview.role}`),
                            })}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">{preview.email}</p>

                        {canAcceptAsCurrentUser ? (
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => void handleAcceptAsLoggedInUser()}
                                className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
                            >
                                {submitting
                                    ? t('team.accept.accepting')
                                    : t('team.accept.acceptButton')}
                            </button>
                        ) : (
                            <form
                                onSubmit={(event) => void handleAccept(event)}
                                className="mt-6 space-y-4"
                            >
                                {!preview.existingUser && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="text-sm text-slate-400">
                                                {t('auth.register.firstname')}
                                            </label>
                                            <input
                                                required
                                                value={firstname}
                                                onChange={(event) =>
                                                    setFirstname(event.target.value)
                                                }
                                                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm text-slate-400">
                                                {t('auth.register.lastname')}
                                            </label>
                                            <input
                                                required
                                                value={lastname}
                                                onChange={(event) =>
                                                    setLastname(event.target.value)
                                                }
                                                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm text-slate-400">
                                        {preview.existingUser
                                            ? t('auth.login.password')
                                            : t('auth.register.password')}
                                    </label>
                                    <PasswordInput
                                        required
                                        value={password}
                                        onChange={setPassword}
                                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                                    />
                                </div>

                                <button
                                    disabled={submitting}
                                    className="w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"
                                >
                                    {submitting
                                        ? t('team.accept.accepting')
                                        : t('team.accept.acceptButton')}
                                </button>
                            </form>
                        )}
                    </>
                )}

                <Link
                    to="/login"
                    className="mt-6 inline-block text-sm font-semibold text-blue-400 hover:text-blue-300"
                >
                    {t('team.accept.backToLogin')}
                </Link>
            </div>
        </main>
    )
}

export default AcceptInvitePage
