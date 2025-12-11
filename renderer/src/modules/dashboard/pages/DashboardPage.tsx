import { Grid, Typography, Box } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
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
            icon: <InventoryIcon fontSize="large" color="primary" />, 
            color: '#e3f2fd' 
        },
        { 
            title: t('dashboard.totalUsers') || 'Utilisateurs', 
            value: statsData.totalUsers, 
            icon: <PeopleIcon fontSize="large" color="secondary" />, 
            color: '#fce4ec' 
        },
        { 
            title: t('dashboard.totalServices') || 'Services', 
            value: statsData.totalServices, 
            icon: <MonetizationOnIcon fontSize="large" color="success" />, 
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
