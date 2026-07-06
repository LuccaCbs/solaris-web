import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { UserPlus, X } from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import {
    createOrganizationInvite,
    getOrganizationMembers,
    getOrganizationStores,
    revokeOrganizationInvite,
    updateOrganizationMemberRole,
    type OrganizationMember,
    type OrganizationStore,
} from '../api/organizationService'
import type { OrganizationRole } from '../types/auth'
import LoadingScreen from '../components/LoadingScreen'

const INVITE_ROLES: OrganizationRole[] = ['ADMIN', 'MANAGER', 'REPOSITOR', 'CASHIER']

function TeamPage() {
    const { t } = useTranslation()
    const { orgId, hasMinimumRole, role: currentRole } = useAuth()

    const [members, setMembers] = useState<OrganizationMember[]>([])
    const [stores, setStores] = useState<OrganizationStore[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [email, setEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<OrganizationRole>('MANAGER')
    const [storeId, setStoreId] = useState('')
    const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null)

    const canInvite = hasMinimumRole('ADMIN')

    async function loadTeam() {
        if (!orgId) {
            setLoading(false)
            return
        }

        try {
            const [membersData, storesData] = await Promise.all([
                getOrganizationMembers(orgId),
                getOrganizationStores(orgId),
            ])

            setMembers(membersData)
            setStores(storesData)
        } catch {
            toast.error(t('team.loadError'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadTeam()
    }, [orgId])

    async function handleInvite(event: React.FormEvent) {
        event.preventDefault()

        if (!orgId) return

        setSubmitting(true)

        try {
            await createOrganizationInvite(orgId, {
                email: email.trim(),
                role: inviteRole,
                storeId: storeId ? Number(storeId) : null,
            })

            toast.success(t('team.inviteSuccess'))
            setEmail('')
            setStoreId('')
            await loadTeam()
        } catch {
            toast.error(t('team.inviteError'))
        } finally {
            setSubmitting(false)
        }
    }

    async function handleRevokeInvite(inviteId: number) {
        if (!orgId) return

        const confirmed = window.confirm(t('team.revokeConfirm'))

        if (!confirmed) return

        try {
            await revokeOrganizationInvite(orgId, inviteId)
            toast.success(t('team.revokeSuccess'))
            await loadTeam()
        } catch {
            toast.error(t('team.revokeError'))
        }
    }

    function availableRoles(): OrganizationRole[] {
        if (currentRole === 'OWNER') {
            return INVITE_ROLES
        }

        return INVITE_ROLES.filter((role) => role !== 'ADMIN')
    }

    function editableRolesForMember(member: OrganizationMember): OrganizationRole[] {
        if (member.pendingInvite || member.role === 'OWNER') {
            return []
        }

        if (currentRole === 'OWNER') {
            return ['ADMIN', 'MANAGER', 'REPOSITOR', 'CASHIER']
        }

        if (currentRole === 'ADMIN') {
            if (member.role === 'ADMIN') {
                return []
            }

            return ['MANAGER', 'REPOSITOR', 'CASHIER']
        }

        return []
    }

    function canEditMemberRole(member: OrganizationMember): boolean {
        return editableRolesForMember(member).length > 0
    }

    async function handleRoleChange(member: OrganizationMember, role: OrganizationRole) {
        if (!orgId || role === member.role) {
            return
        }

        setUpdatingMemberId(member.id)

        try {
            await updateOrganizationMemberRole(orgId, member.id, {
                role,
                storeId: member.storeId ?? null,
            })

            toast.success(t('team.roleUpdateSuccess'))
            await loadTeam()
        } catch (error) {
            const apiError = error as { response?: { data?: { message?: string } } }
            toast.error(apiError.response?.data?.message || t('team.roleUpdateError'))
        } finally {
            setUpdatingMemberId(null)
        }
    }

    if (!canInvite) {
        return (
            <div className="solaris-panel">
                <p className="solaris-muted">{t('team.noAccess')}</p>
            </div>
        )
    }

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div>
            <div>
                <h1 className="text-4xl font-bold">{t('team.title')}</h1>
                <p className="mt-2 solaris-muted">{t('team.description')}</p>
            </div>

            <form onSubmit={handleInvite} className="solaris-panel mt-8">
                <h2 className="text-xl font-semibold">{t('team.inviteTitle')}</h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <label className="text-sm solaris-muted">
                            {t('common.email')} *
                        </label>
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="solaris-input mt-2 w-full"
                            placeholder={t('team.emailPlaceholder')}
                        />
                    </div>

                    <div>
                        <label className="text-sm solaris-muted">
                            {t('team.role')} *
                        </label>
                        <select
                            value={inviteRole}
                            onChange={(event) =>
                                setInviteRole(event.target.value as OrganizationRole)
                            }
                            className="solaris-input mt-2 w-full"
                        >
                            {availableRoles().map((role) => (
                                <option key={role} value={role}>
                                    {t(`auth.roles.${role}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm solaris-muted">
                            {t('team.store')}{' '}
                            <span className="solaris-subtle">
                                {t('common.optional')}
                            </span>
                        </label>
                        <select
                            value={storeId}
                            onChange={(event) => setStoreId(event.target.value)}
                            className="solaris-input mt-2 w-full"
                        >
                            <option value="">{t('team.allStores')}</option>
                            {stores.map((store) => (
                                <option key={store.id} value={store.id}>
                                    {store.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            disabled={submitting}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                        >
                            <UserPlus size={18} />
                            {submitting ? t('team.inviting') : t('team.sendInvite')}
                        </button>
                    </div>
                </div>
            </form>

            <div className="solaris-card mt-8 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm">
                                {t('common.email')}
                            </th>
                            <th className="px-6 py-4 text-left text-sm">
                                {t('common.name')}
                            </th>
                            <th className="px-6 py-4 text-left text-sm">
                                {t('team.role')}
                            </th>
                            <th className="px-6 py-4 text-left text-sm">
                                {t('common.status')}
                            </th>
                            <th className="px-6 py-4 text-right text-sm">
                                {t('common.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => (
                            <tr
                                key={`${member.pendingInvite ? 'invite' : 'member'}-${member.id}`}
                                className="border-t border-slate-200 dark:border-slate-800"
                            >
                                <td className="px-6 py-4">{member.email}</td>
                                <td className="px-6 py-4">
                                    {member.firstname && member.lastname
                                        ? `${member.firstname} ${member.lastname}`
                                        : '—'}
                                </td>
                                <td className="px-6 py-4">
                                    {canEditMemberRole(member) ? (
                                        <select
                                            value={member.role}
                                            disabled={updatingMemberId === member.id}
                                            onChange={(event) =>
                                                void handleRoleChange(
                                                    member,
                                                    event.target.value as OrganizationRole
                                                )
                                            }
                                            className="solaris-input"
                                        >
                                            {editableRolesForMember(member).map((role) => (
                                                <option key={role} value={role}>
                                                    {t(`auth.roles.${role}`)}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        t(`auth.roles.${member.role}`)
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={
                                            member.pendingInvite
                                                ? 'rounded-lg bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-500'
                                                : 'rounded-lg bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-500'
                                        }
                                    >
                                        {member.pendingInvite
                                            ? t('team.status.pending')
                                            : t(`team.status.${member.status}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {member.pendingInvite && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRevokeInvite(member.id)
                                            }
                                            className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 dark:border-red-800"
                                        >
                                            <X size={16} />
                                            {t('team.revokeInvite')}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {members.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-10 text-center solaris-muted"
                                >
                                    {t('team.empty')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TeamPage
