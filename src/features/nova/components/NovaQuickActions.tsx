import { useTranslation } from 'react-i18next'

interface NovaQuickActionsProps {
    onSelectAction: (message: string) => void
}

export function NovaQuickActions({
                                     onSelectAction,
                                 }: NovaQuickActionsProps) {
    const { t } = useTranslation()

    const actions = [
        {
            label: t('nova.quickActions.searchProduct'),
            message: t('nova.quickActions.searchProductHelp'),
        },
        {
            label: t('nova.quickActions.createProduct'),
            message: t('nova.quickActions.createProductHelp'),
        },
        {
            label: t('nova.quickActions.updateProduct'),
            message: t('nova.quickActions.updateProductHelp'),
        },
        {
            label: t('nova.quickActions.deactivateProduct'),
            message: t('nova.quickActions.deactivateProductHelp'),
        },
        {
            label: t('nova.quickActions.updateStock'),
            message: t('nova.quickActions.updateStockHelp'),
        },
        {
            label: t('nova.quickActions.dashboard'),
            message: t('nova.quickActions.dashboardHelp'),
        },
        {
            label: t('nova.quickActions.lowStock'),
            message: t('nova.quickActions.lowStockHelp'),
        },
        {
            label: t('nova.quickActions.createSupplier'),
            message: t('nova.quickActions.createSupplierHelp'),
        },
        {
            label: t('nova.quickActions.searchSupplier'),
            message: t('nova.quickActions.searchSupplierHelp'),
        },
        {
            label: t('nova.quickActions.updateSupplier'),
            message: t('nova.quickActions.updateSupplierHelp'),
        },
        {
            label: t('nova.quickActions.deleteSupplier'),
            message: t('nova.quickActions.deleteSupplierHelp'),
        }
    ]

    return (
        <div className="mt-4 grid gap-2">
            {actions.map((action) => (
                <button
                    key={action.label}
                    type="button"
                    onClick={() => onSelectAction(action.message)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                    {action.label}
                </button>
            ))}
        </div>
    )
}