import { Grid, Typography, Box } from '@mui/material';
import { Inventory, People, MonetizationOn } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDashboardStats } from '../hooks/useDashboardStats';
import StatCard from '../components/StatCard';
import RecentProducts from '../components/RecentProducts';

export default function DashboardPage() {
    const { t } = useTranslation();
    const { statsData } = useDashboardStats();

    const stats = [
        { 
            title: t('dashboard.totalProducts') || 'Produits', 
            value: statsData.totalProducts, 
            icon: <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />, 
            color: '#e3f2fd' 
        },
        { 
            title: t('dashboard.totalUsers') || 'Utilisateurs', 
            value: statsData.totalUsers, 
            icon: <People sx={{ fontSize: 40, color: 'secondary.main' }} />, 
            color: '#fce4ec' 
        },
        { 
            title: t('dashboard.totalServices') || 'Services', 
            value: statsData.totalServices, 
            icon: <MonetizationOn sx={{ fontSize: 40, color: 'success.main' }} />, 
            color: '#e8f5e9' 
        },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                {t('app.nav.dashboard') || 'Tableau de bord'}
            </Typography>
            
            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <RecentProducts products={statsData.recentProducts} />
                </Grid>
            </Grid>
        </Box>
    );
}
