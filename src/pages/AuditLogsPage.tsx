import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getAuditLogs } from '../api/auditLogService'
import type { AuditAction, AuditEntityType, AuditLog } from '../types/auditLog'
import LoadingScreen from '../components/LoadingScreen'

type ActionFilter = 'ALL' | AuditAction
type EntityTypeFilter = 'ALL' | AuditEntityType

const pageSize = 15

function AuditLogsPage() {
    const { t } = useTranslation()

    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [actionFilter, setActionFilter] = useState<ActionFilter>('ALL')
    const [entityTypeFilter, setEntityTypeFilter] = useState<EntityTypeFilter>('ALL')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        async function loadAuditLogs() {
            try {
                setLoading(true)

                const data = await getAuditLogs()
                setAuditLogs(data)
            } catch {
                toast.error(t('auditLogs.loadError'))
            } finally {
                setLoading(false)
            }
        }

        loadAuditLogs()
    }, [t])

    const filteredLogs = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim()

        return auditLogs.filter((log) => {
            const searchableText = [
                log.description,
                log.entityName,
                log.userName,
                log.userEmail,
                log.action,
                log.entityType,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()

            const matchesSearch =
                !normalizedSearch || searchableText.includes(normalizedSearch)

            const matchesAction =
                actionFilter === 'ALL' || log.action === actionFilter

            const matchesEntityType =
                entityTypeFilter === 'ALL' || log.entityType === entityTypeFilter

            const createdAt = new Date(log.createdAt)

            const matchesFrom =
                !fromDate || createdAt >= new Date(`${fromDate}T00:00:00`)

            const matchesTo =
                !toDate || createdAt <= new Date(`${toDate}T23:59:59`)

            return (
                matchesSearch &&
                matchesAction &&
                matchesEntityType &&
                matchesFrom &&
                matchesTo
            )
        })
    }, [auditLogs, search, actionFilter, entityTypeFilter, fromDate, toDate])

    const totalPages = Math.ceil(filteredLogs.length / pageSize)

    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    function clearFilters() {
        setSearch('')
        setActionFilter('ALL')
        setEntityTypeFilter('ALL')
        setFromDate('')
        setToDate('')
        setCurrentPage(1)
    }

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div>
            <div>
                <h1 className="text-4xl font-bold">
                    {t('auditLogs.title')}
                </h1>

                <p className="mt-2 solaris-muted">
                    {t('auditLogs.description')}
                </p>
            </div>

            <section className="solaris-panel mt-8">
                <div className="grid gap-4 lg:grid-cols-5">
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder={t('auditLogs.searchPlaceholder')}
                        className="solaris-input lg:col-span-2"
                    />

                    <select
                        value={actionFilter}
                        onChange={(event) => {
                            setActionFilter(event.target.value as ActionFilter)
                            setCurrentPage(1)
                        }}
                        className="solaris-input"
                    >
                        <option value="ALL">
                            {t('auditLogs.filters.allActions')}
                        </option>

                        {auditActions.map((action) => (
                            <option key={action} value={action}>
                                {t(`auditLogs.actions.${action}`)}
                            </option>
                        ))}
                    </select>

                    <select
                        value={entityTypeFilter}
                        onChange={(event) => {
                            setEntityTypeFilter(event.target.value as EntityTypeFilter)
                            setCurrentPage(1)
                        }}
                        className="solaris-input"
                    >
                        <option value="ALL">
                            {t('auditLogs.filters.allEntities')}
                        </option>

                        {auditEntityTypes.map((entityType) => (
                            <option key={entityType} value={entityType}>
                                {t(`auditLogs.entities.${entityType}`)}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        {t('common.clearFilters')}
                    </button>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="text-sm solaris-muted">
                            {t('common.from')}
                        </label>

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(event) => {
                                setFromDate(event.target.value)
                                setCurrentPage(1)
                            }}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <div>
                        <label className="text-sm solaris-muted">
                            {t('common.to')}
                        </label>

                        <input
                            type="date"
                            value={toDate}
                            onChange={(event) => {
                                setToDate(event.target.value)
                                setCurrentPage(1)
                            }}
                            className="solaris-input mt-2 w-full"
                        />
                    </div>

                    <div className="flex items-end lg:col-span-2">
                        <p className="text-sm solaris-muted">
                            {t('auditLogs.results', { count: filteredLogs.length })}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mt-8 space-y-4 lg:hidden">
                {paginatedLogs.map((log) => (
                    <article key={log.id} className="solaris-panel">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-semibold text-slate-950 dark:text-white">
                                    {t(`auditLogs.actions.${log.action}`)}
                                </p>

                                <p className="mt-1 text-sm solaris-muted">
                                    {log.entityName || t(`auditLogs.entities.${log.entityType}`)}
                                </p>
                            </div>

                            <EntityBadge entityType={log.entityType} />
                        </div>

                        <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">
                            {log.description}
                        </p>

                        <div className="mt-4 grid gap-3 text-sm">
                            <InfoRow
                                label={t('auditLogs.table.user')}
                                value={log.userName || log.userEmail || t('auditLogs.systemUser')}
                            />

                            <InfoRow
                                label={t('common.date')}
                                value={new Date(log.createdAt).toLocaleString()}
                            />
                        </div>
                    </article>
                ))}

                {paginatedLogs.length === 0 && (
                    <div className="solaris-panel text-center solaris-muted">
                        {t('auditLogs.empty')}
                    </div>
                )}
            </section>

            <section className="solaris-card mt-8 hidden overflow-hidden lg:block">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm solaris-muted">
                            {t('common.date')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm solaris-muted">
                            {t('auditLogs.table.user')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm solaris-muted">
                            {t('auditLogs.table.action')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm solaris-muted">
                            {t('auditLogs.table.entity')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm solaris-muted">
                            {t('auditLogs.table.entityName')}
                        </th>

                        <th className="px-6 py-4 text-left text-sm solaris-muted">
                            {t('common.description')}
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {paginatedLogs.map((log) => (
                        <tr
                            key={log.id}
                            className="border-t border-slate-200 dark:border-slate-800"
                        >
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                {new Date(log.createdAt).toLocaleString()}
                            </td>

                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-medium text-slate-950 dark:text-white">
                                        {log.userName || t('auditLogs.systemUser')}
                                    </p>

                                    {log.userEmail && (
                                        <p className="text-sm solaris-muted">
                                            {log.userEmail}
                                        </p>
                                    )}
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <ActionBadge action={log.action} />
                            </td>

                            <td className="px-6 py-4">
                                <EntityBadge entityType={log.entityType} />
                            </td>

                            <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                                {log.entityName || '-'}
                            </td>

                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                {log.description}
                            </td>
                        </tr>
                    ))}

                    {paginatedLogs.length === 0 && (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-6 py-10 text-center solaris-muted"
                            >
                                {t('auditLogs.empty')}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </section>

            {totalPages > 1 && (
                <div className="solaris-panel mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm solaris-muted">
                        {t('auditLogs.pagination', {
                            currentPage,
                            totalPages,
                            count: filteredLogs.length,
                        })}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {t('common.previous')}
                        </button>

                        {Array.from({ length: totalPages }).map((_, index) => {
                            const page = index + 1

                            return (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        })}

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((page) => page + 1)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {t('common.next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="solaris-muted">
                {label}
            </span>

            <span className="font-medium text-slate-950 dark:text-white">
                {value}
            </span>
        </div>
    )
}

function ActionBadge({ action }: { action: AuditAction }) {
    const { t } = useTranslation()

    return (
        <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-500 dark:text-blue-300">
            {t(`auditLogs.actions.${action}`)}
        </span>
    )
}

function EntityBadge({ entityType }: { entityType: AuditEntityType }) {
    const { t } = useTranslation()

    return (
        <span className="rounded-lg bg-slate-500/10 px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            {t(`auditLogs.entities.${entityType}`)}
        </span>
    )
}

const auditActions: AuditAction[] = [
    'CREATE',
    'UPDATE',
    'DELETE',
    'REGISTER_USER',
    'LOGIN',
    'LOGOUT',
    'OPEN_CASH_REGISTER',
    'CLOSE_CASH_REGISTER',
    'REOPEN_CASH_REGISTER',
    'CREATE_SALE',
    'CREATE_SUPPLIER_ORDER',
    'COMPLETE_SUPPLIER_ORDER',
    'CANCEL_SUPPLIER_ORDER',
    'UPDATE_SETTINGS',
]

const auditEntityTypes: AuditEntityType[] = [
    'PRODUCT',
    'CATEGORY',
    'SUPPLIER',
    'SALE',
    'CASH_REGISTER',
    'SUPPLIER_ORDER',
    'SYSTEM_SETTINGS',
    'USER',
]

export default AuditLogsPage