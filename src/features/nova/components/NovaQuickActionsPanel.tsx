import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface NovaQuickActionsPanelProps {
    onSelectAction: (message: string) => void
    onClose: () => void
}

export function NovaQuickActionsPanel({
                                          onSelectAction,
                                          onClose,
                                      }: NovaQuickActionsPanelProps) {
    const { t } = useTranslation()

    const groups = [
        {
            title: t('nova.quickActions.groups.products'),
            actions: [
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
            ],
        },
        {
            title: t('nova.quickActions.groups.suppliers'),
            actions: [
                {
                    label: t('nova.quickActions.searchSupplier'),
                    message: t('nova.quickActions.searchSupplierHelp'),
                },
                {
                    label: t('nova.quickActions.createSupplier'),
                    message: t('nova.quickActions.createSupplierHelp'),
                },
                {
                    label: t('nova.quickActions.updateSupplier'),
                    message: t('nova.quickActions.updateSupplierHelp'),
                },
            ],
        },
        {
            title: t('nova.quickActions.groups.dashboard'),
            actions: [
                {
                    label: t('nova.quickActions.dashboard'),
                    message: t('nova.quickActions.dashboardHelp'),
                },
                {
                    label: t('nova.quickActions.lowStock'),
                    message: t('nova.quickActions.lowStockHelp'),
                },
            ],
        },
        {
            title: t('nova.quickActions.groups.sales'),
            actions: [
                {
                    label: t('nova.quickActions.listSales'),
                    message: t('nova.quickActions.listSalesHelp'),
                },
                {
                    label: t('nova.quickActions.showSale'),
                    message: t('nova.quickActions.showSaleHelp'),
                },
                {
                    label: t('nova.quickActions.dailySalesSummary'),
                    message: t('nova.quickActions.dailySalesSummaryHelp'),
                },
                {
                    label: t('nova.quickActions.createSale'),
                    message: t('nova.quickActions.createSaleHelp'),
                },
                {
                    label: t('nova.quickActions.emitInvoice'),
                    message: t('nova.quickActions.emitInvoiceHelp'),
                },
            ],
        },
        {
            title: t('nova.quickActions.groups.customersFiscal'),
            actions: [
                {
                    label: t('nova.quickActions.searchCustomer'),
                    message: t('nova.quickActions.searchCustomerHelp'),
                },
                {
                    label: t('nova.quickActions.showCustomer'),
                    message: t('nova.quickActions.showCustomerHelp'),
                },
                {
                    label: t('nova.quickActions.listFiscalDocuments'),
                    message: t('nova.quickActions.listFiscalDocumentsHelp'),
                },
                {
                    label: t('nova.quickActions.showFiscalDocument'),
                    message: t('nova.quickActions.showFiscalDocumentHelp'),
                },
            ],
        },
    ]

    return (
        <div className="absolute right-full top-0 mr-3 flex h-full w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wide solaris-muted">
                    {t('nova.quickActions.title')}
                </p>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1 solaris-muted hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                    <X size={14} />
                </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {groups.map((group) => (
                    <section key={group.title}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {group.title}
                        </p>

                        <div className="space-y-2">
                            {group.actions.map((action) => (
                                <button
                                    key={action.label}
                                    type="button"
                                    onClick={() => {
                                        onSelectAction(action.message)
                                        onClose()
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}