import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProductsPage from '../pages/ProductsPage'
import CategoriesPage from '../pages/CategoriesPage'
import StockMovementsPage from '../pages/StockMovementsPage'
import ProtectedRoute from './ProtectedRoute'
import NewProductPage from '../pages/NewProductPage'
import EditProductPage from '../pages/EditProductPage'
import ImportProductsPage from '../pages/ImportProductsPage'
import NewCategoryPage from '../pages/NewCategoryPage'
import EditCategoryPage from '../pages/EditCategoryPage'
import NewStockMovementPage from '../pages/NewStockMovementPage'
import AdminSettingsPage from '../pages/AdminSettingsPage'
import SalesPage from '../pages/SalesPage'
import NewSalePage from '../pages/NewSalePage'
import SaleDetailPage from '../pages/SaleDetailPage'
import SuppliersPage from '../pages/SuppliersPage'
import NewSupplierPage from '../pages/NewSupplierPage'
import EditSupplierPage from '../pages/EditSupplierPage'
import SupplierOrdersPage from '../pages/SupplierOrdersPage'
import NewSupplierOrderPage from '../pages/NewSupplierOrderPage'
import SupplierOrderDetailPage from '../pages/SupplierOrderDetailPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import VerifyEmailPage from '../pages/VerifyEmailPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProfilePage from '../pages/ProfilePage'

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/new" element={<NewProductPage />} />
                        <Route path="/products/:id/edit" element={<EditProductPage />} />
                        <Route path="/products/import" element={<ImportProductsPage />} />

                        <Route path="/suppliers" element={<SuppliersPage />} />
                        <Route path="/suppliers/new" element={<NewSupplierPage />} />
                        <Route path="/suppliers/:id/edit" element={<EditSupplierPage />} />

                        <Route path="/supplier-orders" element={<SupplierOrdersPage />} />
                        <Route path="/supplier-orders/new" element={<NewSupplierOrderPage />} />
                        <Route path="/supplier-orders/:id" element={<SupplierOrderDetailPage />} />

                        <Route path="/categories" element={<CategoriesPage />} />
                        <Route path="/categories/new" element={<NewCategoryPage />} />
                        <Route path="/categories/:id/edit" element={<EditCategoryPage />} />

                        <Route path="/stock-movements" element={<StockMovementsPage />} />
                        <Route path="/stock-movements/new" element={<NewStockMovementPage />} />

                        <Route path="/sales" element={<SalesPage />} />
                        <Route path="/sales/new" element={<NewSalePage />} />
                        <Route path="/sales/:id" element={<SaleDetailPage />} />

                        <Route path="/admin/settings" element={<AdminSettingsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Routes>

        </BrowserRouter>
    )
}

export default AppRouter