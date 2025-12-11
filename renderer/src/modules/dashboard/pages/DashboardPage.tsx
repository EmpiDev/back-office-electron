import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { Inventory, People, MonetizationOn, TrendingUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
    const { t } = useTranslation();
    const [statsData, setStatsData] = React.useState({
        totalProducts: 0,
        totalUsers: 0,
        totalServices: 0,
        recentProducts: [] as any[]
    });

    React.useEffect(() => {
        const loadStats = async () => {
            try {
                // @ts-ignore
                const res = await window.electronApi.getDashboardStats();
                if (res.success && res.data) {
                    setStatsData(res.data);
                } else {
                    console.error("Dashboard error:", res.error);
                }
            } catch (error) {
                console.error("Failed to load dashboard stats:", error);
            }
        };
        loadStats();
    }, []);

    const stats = [
        { title: t('dashboard.totalProducts') || 'Produits', value: statsData.totalProducts, icon: <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />, color: '#e3f2fd' },
        { title: t('dashboard.totalUsers') || 'Utilisateurs', value: statsData.totalUsers, icon: <People sx={{ fontSize: 40, color: 'secondary.main' }} />, color: '#fce4ec' },
        { title: t('dashboard.totalServices') || 'Services', value: statsData.totalServices, icon: <MonetizationOn sx={{ fontSize: 40, color: 'success.main' }} />, color: '#e8f5e9' },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                {t('app.nav.dashboard') || 'Tableau de bord'}
            </Typography>
            
            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                borderRadius: 3,
                                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px 0 rgba(0,0,0,0.1)',
                                }
                            }}
                        >
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                                    {stat.title.toUpperCase()}
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {stat.value}
                                </Typography>
                            </Box>
                            <Box 
                                sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    bgcolor: stat.color 
                                }}
                            >
                                {stat.icon}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, minHeight: 400 }}>
                         <Typography variant="h6" gutterBottom>Derniers produits ajoutés</Typography>
                         <Box sx={{ mt: 2 }}>
                             {!Array.isArray(statsData?.recentProducts) || statsData.recentProducts.length === 0 ? (
                                 <Typography color="text.secondary">Aucun produit récent.</Typography>
                             ) : (
                                 statsData.recentProducts.map((product) => (
                                     <Box key={product.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                                         <Box>
                                             <Typography variant="body2" fontWeight="bold">{product.name}</Typography>
                                             <Typography variant="caption" color="text.secondary">Ajouté le {new Date(product.created_at).toLocaleDateString()}</Typography>
                                         </Box>
                                         <Typography variant="body2" fontWeight="bold">
                                             {product.price ? `${product.price} €` : 'N/A'}
                                         </Typography>
                                     </Box>
                                 ))
                             )}
                         </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
