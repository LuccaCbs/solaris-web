import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProductsPage from '../pages/ProductsPage'
import CategoriesPage from '../pages/CategoriesPage'
import StockMovementsPage from '../pages/StockMovementsPage'
import ProtectedRoute from './ProtectedRoute'
import OnboardingGate from './OnboardingGate'
import OnboardingSetupPage from '../pages/OnboardingSetupPage'
import OnboardingPlanPage from '../pages/OnboardingPlanPage'
import RoleProtectedRoute from './RoleProtectedRoute'
import NewProductPage from '../pages/NewProductPage'
import EditProductPage from '../pages/EditProductPage'
import ImportProductsPage from '../pages/ImportProductsPage'
import NewCategoryPage from '../pages/NewCategoryPage'
import EditCategoryPage from '../pages/EditCategoryPage'
import AdminSettingsPage from '../pages/AdminSettingsPage'
import SalesPage from '../pages/SalesPage'
import DailySalesPage from '../pages/DailySalesPage'
import NewSalePage from '../pages/NewSalePage'
import SaleDetailPage from '../pages/SaleDetailPage'
import SuppliersPage from '../pages/SuppliersPage'
import NewSupplierPage from '../pages/NewSupplierPage'
import EditSupplierPage from '../pages/EditSupplierPage'
import CustomersPage from '../pages/CustomersPage'
import NewCustomerPage from '../pages/NewCustomerPage'
import EditCustomerPage from '../pages/EditCustomerPage'
import SupplierOrdersPage from '../pages/SupplierOrdersPage'
import NewSupplierOrderPage from '../pages/NewSupplierOrderPage'
import EditSupplierOrderPage from '../pages/EditSupplierOrderPage'
import SupplierOrderDetailPage from '../pages/SupplierOrderDetailPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import VerifyEmailPage from '../pages/VerifyEmailPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProfilePage from '../pages/ProfilePage'
import AuditLogsPage from '../pages/AuditLogsPage'
import RestockProductPage from '../pages/RestockProductPage'
import QuickRestockPage from '../pages/QuickRestockPage'
import TeamPage from '../pages/TeamPage'
import AcceptInvitePage from '../pages/AcceptInvitePage'
import FiscalDocumentsPage from '../pages/FiscalDocumentsPage'
import FiscalDocumentDetailPage from '../pages/FiscalDocumentDetailPage'
import BillingPage from '../pages/BillingPage'
import OrganizationPage from '../pages/OrganizationPage'

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/accept-invite" element={<AcceptInvitePage />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<OnboardingGate />}>
                        <Route path="/onboarding/setup" element={<OnboardingSetupPage />} />
                        <Route path="/onboarding/plan" element={<OnboardingPlanPage />} />

                        <Route element={<AppLayout />}>
                            <Route element={<RoleProtectedRoute />}>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/products/new" element={<NewProductPage />} />
                            <Route path="/products/:id/edit" element={<EditProductPage />} />
                            <Route path="/products/import" element={<ImportProductsPage />} />

                            <Route path="/suppliers" element={<SuppliersPage />} />
                            <Route path="/suppliers/new" element={<NewSupplierPage />} />
                            <Route path="/suppliers/:id/edit" element={<EditSupplierPage />} />

                            <Route path="/customers" element={<CustomersPage />} />
                            <Route path="/customers/new" element={<NewCustomerPage />} />
                            <Route path="/customers/:id/edit" element={<EditCustomerPage />} />

                            <Route path="/supplier-orders" element={<SupplierOrdersPage />} />
                            <Route path="/supplier-orders/new" element={<NewSupplierOrderPage />} />
                            <Route path="/supplier-orders/:id/edit" element={<EditSupplierOrderPage />} />
                            <Route path="/supplier-orders/:id" element={<SupplierOrderDetailPage />} />

                            <Route path="/categories" element={<CategoriesPage />} />
                            <Route path="/categories/new" element={<NewCategoryPage />} />
                            <Route path="/categories/:id/edit" element={<EditCategoryPage />} />

                            <Route path="/stock-movements" element={<StockMovementsPage />} />
                            <Route path="/stock/restock" element={<QuickRestockPage />} />
                            <Route path="/audit-logs" element={<AuditLogsPage />} />

                            <Route path="/sales" element={<SalesPage />} />
                            <Route path="/sales/daily" element={<DailySalesPage />} />
                            <Route path="/sales/new" element={<NewSalePage />} />
                            <Route path="/sales/:id" element={<SaleDetailPage />} />
                            <Route path="/fiscal-documents" element={<FiscalDocumentsPage />} />
                            <Route path="/fiscal-documents/:id" element={<FiscalDocumentDetailPage />} />

                            <Route path="/admin/settings" element={<AdminSettingsPage />} />
                            <Route path="/admin/billing" element={<BillingPage />} />
                            <Route path="/admin/organization" element={<OrganizationPage />} />
                            <Route path="/team" element={<TeamPage />} />
                            <Route path="/profile" element={<ProfilePage />} />

                            <Route path="/products/:id/restock" element={<RestockProductPage />} />
                            </Route>
                        </Route>
                    </Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Routes>

        </BrowserRouter>
    )
}

export default AppRouter