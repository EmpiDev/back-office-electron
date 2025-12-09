import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import appConfig from '@/config/appConfig';

export default function MainLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const navItems = [
    { label: t('app.nav.home') || 'Home', path: '/' },
    { label: t('app.nav.products') || 'Products', path: '/products' },
    { label: t('app.nav.services') || 'Services', path: '/services' },
    { label: t('app.nav.users') || 'Users', path: '/users' },
    { label: 'Tags', path: '/tags' },
  ];

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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

      <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, p: 3, mt: 2 }}>
        <Outlet />
      </Container>
    </Box>
  );
}