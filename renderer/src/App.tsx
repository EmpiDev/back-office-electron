import './App.css'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import DashboardPage from '@/modules/dashboard/pages/DashboardPage'
import ProductsPage from '@/modules/products/pages/ProductsPage'
import ServicesPage from '@/modules/services/pages/ServicesPage'
import UsersPage from '@/modules/users/pages/UsersPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
    </Routes>
  )
}

export default App