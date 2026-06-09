import { useEffect, useState } from 'react'
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
                toast.error('Could not load profile')
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [])

    async function handleProfileSubmit(event: React.FormEvent) {
        event.preventDefault()
        setSavingProfile(true)

        try {
            const data = await updateCurrentUserProfile({
                firstname,
                lastname,
            })

            setProfile(data)
            toast.success('Profile updated successfully')
        } catch {
            toast.error('Could not update profile')
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
            toast.success('Password updated successfully')
        } catch {
            toast.error('Could not update password')
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
                My Profile
            </h1>

            <p className="mt-2 solaris-muted">
                Manage your account details and password.
            </p>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <form
                    onSubmit={handleProfileSubmit}
                    className="solaris-panel"
                >
                    <h2 className="text-xl font-semibold">
                        Account details
                    </h2>

                    <div className="mt-6">
                        <label className="text-sm solaris-muted">
                            First name
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
                            Last name
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
                            Email
                        </label>

                        <input
                            disabled
                            value={profile?.email ?? ''}
                            className="solaris-input mt-2 w-full cursor-not-allowed opacity-70"
                        />

                        <p className="mt-2 text-sm solaris-subtle">
                            Email cannot be changed from this screen.
                        </p>
                    </div>

                    <button
                        disabled={savingProfile}
                        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                        {savingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>

                <form
                    onSubmit={handlePasswordSubmit}
                    className="solaris-panel"
                >
                    <h2 className="text-xl font-semibold">
                        Change password
                    </h2>

                    <div className="mt-6">
                        <label className="text-sm solaris-muted">
                            Current password
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
                            New password
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
                        {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ProfilePage