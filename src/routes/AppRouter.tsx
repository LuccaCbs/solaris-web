import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import ProductsPage from '../pages/ProductsPage'
import CategoriesPage from '../pages/CategoriesPage'
import StockMovementsPage from '../pages/StockMovementsPage'
import ProtectedRoute from './ProtectedRoute'
import NewProductPage from '../pages/NewProductPage'
import EditProductPage from '../pages/EditProductPage'
import NewCategoryPage from '../pages/NewCategoryPage'
import EditCategoryPage from '../pages/EditCategoryPage'
import NewStockMovementPage from '../pages/NewStockMovementPage'
import AdminSettingsPage from '../pages/AdminSettingsPage'
import SalesPage from '../pages/SalesPage'
import NewSalePage from '../pages/NewSalePage'
import SaleDetailPage from '../pages/SaleDetailPage'


function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/new" element={<NewProductPage />} />
                        <Route path="/products/:id/edit" element={<EditProductPage />} />

                        <Route path="/categories" element={<CategoriesPage />} />
                        <Route path="/categories/new" element={<NewCategoryPage />} />
                        <Route path="/categories/:id/edit" element={<EditCategoryPage />} />

                        <Route path="/stock-movements" element={<StockMovementsPage />} />
                        <Route path="/stock-movements/new" element={<NewStockMovementPage />} />

                        <Route path="/sales" element={<SalesPage />} />
                        <Route path="/sales/new" element={<NewSalePage />} />
                        <Route path="/sales/:id" element={<SaleDetailPage />} />

                        <Route path="/admin/settings" element={<AdminSettingsPage />} />
                    </Route>
                </Route>
            </Routes>

        </BrowserRouter>
    )
}

export default AppRouter