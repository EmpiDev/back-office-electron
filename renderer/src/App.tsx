import './App.css'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import DebugPage from '@/modules/debug/pages/DebugPage'
import ProductsPage from '@/modules/products/pages/ProductsPage'
import ServicesPage from '@/modules/services/pages/ServicesPage'
import UsersPage from '@/modules/users/pages/UsersPage'
import appConfig from '@/config/appConfig'

function HomePage() {
  const { t } = useTranslation()
  const [count, setCount] = useState(0)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          {t('home.title')}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {t('home.description')}
        </Typography>
      </Box>
    </Box>
  )
}

function App() {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr'
    i18n.changeLanguage(newLang)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
      }}
    >
      <AppBar position="static" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {appConfig.name}
          </Typography>
          <Button color="inherit" component={Link} to="/">
            {t('app.nav.home')}
          </Button>
          <Button color="inherit" component={Link} to="/products">
            {t('app.nav.products')}
          </Button>
          <Button color="inherit" component={Link} to="/services">
            {t('app.nav.services')}
          </Button>
          <Button color="inherit" component={Link} to="/users">
            {t('app.nav.users')}
          </Button>
          <Button color="inherit" component={Link} to="/debug">
            Debug DB
          </Button>
          <Button color="inherit" onClick={toggleLanguage} sx={{ ml: 2, border: '1px solid rgba(255,255,255,0.3)' }}>
            {i18n.language === 'fr' ? 'EN' : 'FR'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          overflow: 'auto',
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/debug" element={<DebugPage />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App