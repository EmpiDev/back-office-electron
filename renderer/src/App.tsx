import './App.css'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import JokesPage from '@/modules/jokes/pages/JokesPage'
import DebugPage from '@/modules/debug/pages/DebugPage'
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
  const { t } = useTranslation()

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
          <Button color="inherit" component={Link} to="/jokes">
            {t('app.nav.jokes')}
          </Button>
          <Button color="inherit" component={Link} to="/debug">
            Debug DB
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
          <Route path="/jokes" element={<JokesPage />} />
          <Route path="/debug" element={<DebugPage />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
