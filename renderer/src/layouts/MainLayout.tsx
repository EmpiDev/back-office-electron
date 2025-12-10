import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import appConfig from '@/config/appConfig';

export default function MainLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const navItems = [
    { label: t('app.nav.home') || 'Home', path: '/' },
    { label: t('app.nav.showcase') || 'Mise en avant', path: '/showcase' },
    { label: t('app.nav.products') || 'Produits', path: '/products' },
    { label: t('app.nav.services') || 'Services', path: '/services' },
    { label: 'Tags', path: '/tags' },
    { label: t('app.nav.categories') || 'Catégories', path: '/categories' },
    { label: t('app.nav.users') || 'Users', path: '/users' },
  ];

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {appConfig.name}
          </Typography>
          <Box>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                component={Link}
                to={item.path}
                sx={{
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                    borderRadius: 0,
                    mx: 1
                }}
              >
                {item.label}
              </Button>
            ))}
            <Button color="inherit" onClick={toggleLanguage} sx={{ ml: 2, border: '1px solid rgba(255,255,255,0.3)' }}>
               {i18n.language === 'fr' ? 'EN' : 'FR'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        <Container maxWidth="xl">
            <Outlet />
        </Container>
      </Box>
    </Box>
  );
}