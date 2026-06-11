import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
    changeCurrentUserPassword,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    type UserProfile,
} from '../api/userService'
import PasswordInput from '../components/PasswordInput'
import LoadingScreen from '../components/LoadingScreen'

function ProfilePage() {
    const { t } = useTranslation()

    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [loading, setLoading] = useState(true)
    const [savingProfile, setSavingProfile] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true)

                const data = await getCurrentUserProfile()

                setProfile(data)
                setFirstname(data.firstname)
                setLastname(data.lastname)
            } catch {
                toast.error(t('profile.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [t])

    async function handleProfileSubmit(event: React.FormEvent) {
        event.preventDefault()
        setSavingProfile(true)

        try {
            const data = await updateCurrentUserProfile({
                firstname,
                lastname,
            })

            setProfile(data)
            toast.success(t('profile.updateSuccess'))
        } catch {
            toast.error(t('profile.updateError'))
        } finally {
            setSavingProfile(false)
        }
    }

    async function handlePasswordSubmit(event: React.FormEvent) {
        event.preventDefault()
        setChangingPassword(true)

        try {
            await changeCurrentUserPassword({
                currentPassword,
                newPassword,
            })

            setCurrentPassword('')
            setNewPassword('')
            toast.success(t('profile.passwordSuccess'))
        } catch {
            toast.error(t('profile.passwordError'))
        } finally {
            setChangingPassword(false)
        }
    }

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">
                {t('profile.title')}
            </h1>

            <p className="mt-2 solaris-muted">
                {t('profile.description')}
            </p>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <form onSubmit={handleProfileSubmit} className="solaris-panel">
                    <h2 className="text-xl font-semibold">
                        {t('profile.accountDetails')}
                    </h2>

                    <div className="mt-6">
                        <label className="text-sm solaris-muted">
                            {t('profile.firstname')}
                        </label>

                        <input
                            required
                            value={firstname}
                            onChange={(event) => setFirstname(event.target.value)}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="text-sm solaris-muted">
                            {t('profile.lastname')}
                        </label>

                        <input
                            required
                            value={lastname}
                            onChange={(event) => setLastname(event.target.value)}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="text-sm solaris-muted">
                            {t('profile.email')}
                        </label>

                        <input
                            disabled
                            value={profile?.email ?? ''}
                            className="solaris-input mt-2 w-full cursor-not-allowed opacity-70"
                        />

                        <p className="mt-2 text-sm solaris-subtle">
                            {t('profile.emailReadonly')}
                        </p>
                    </div>

                    <button
                        disabled={savingProfile}
                        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                        {savingProfile
                            ? t('profile.savingProfile')
                            : t('profile.saveProfile')}
                    </button>
                </form>

                <form onSubmit={handlePasswordSubmit} className="solaris-panel">
                    <h2 className="text-xl font-semibold">
                        {t('profile.changePassword')}
                    </h2>

                    <div className="mt-6">
                        <label className="text-sm solaris-muted">
                            {t('profile.currentPassword')}
                        </label>

                        <PasswordInput
                            required
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="text-sm solaris-muted">
                            {t('profile.newPassword')}
                        </label>

                        <PasswordInput
                            required
                            value={newPassword}
                            onChange={setNewPassword}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <button
                        disabled={changingPassword}
                        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                        {changingPassword
                            ? t('profile.updatingPassword')
                            : t('profile.updatePassword')}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ProfilePage