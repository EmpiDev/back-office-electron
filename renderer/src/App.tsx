import './App.css'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import DashboardPage from '@/modules/dashboard/pages/DashboardPage'
import ProductsPage from '@/modules/products/pages/ProductsPage'
import ShowcasePage from '@/modules/products/pages/ShowcasePage'
import ServicesPage from '@/modules/services/pages/ServicesPage'
import CategoriesPage from '@/modules/services/pages/CategoriesPage'
import UsersPage from '@/modules/users/pages/UsersPage'
import TagsPage from '@/modules/tags/pages/TagsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="showcase" element={<ShowcasePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="tags" element={<TagsPage />} />
      </Route>
    </Routes>
  )
}

export default App