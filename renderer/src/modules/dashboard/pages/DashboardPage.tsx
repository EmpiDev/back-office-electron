import { Grid, Paper, Typography, Box } from '@mui/material';
import { Inventory, People, MonetizationOn, TrendingUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
    const { t } = useTranslation();

    const stats = [
        { title: t('dashboard.totalProducts') || 'Produits', value: '1,234', icon: <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />, color: '#e3f2fd' },
        { title: t('dashboard.totalUsers') || 'Utilisateurs', value: '56', icon: <People sx={{ fontSize: 40, color: 'secondary.main' }} />, color: '#fce4ec' },
        { title: t('dashboard.totalSales') || 'Ventes (Mois)', value: '12,450 €', icon: <MonetizationOn sx={{ fontSize: 40, color: 'success.main' }} />, color: '#e8f5e9' },
        { title: t('dashboard.growth') || 'Croissance', value: '+12%', icon: <TrendingUp sx={{ fontSize: 40, color: 'warning.main' }} />, color: '#fff3e0' },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                {t('app.nav.home') || 'Tableau de bord'}
            </Typography>
            
            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
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

            {/* Placeholder for Recent Activity or Charts */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
                         <Typography variant="h6" gutterBottom>Aperçu des ventes</Typography>
                         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                             {/* Placeholder for a Chart */}
                             [Graphique des ventes ici]
                         </Box>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                     <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
                         <Typography variant="h6" gutterBottom>Activités récentes</Typography>
                         {/* Placeholder for List */}
                         <Box sx={{ mt: 2 }}>
                             {[1, 2, 3, 4, 5].map((i) => (
                                 <Box key={i} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #f0f0f0' }}>
                                     <Typography variant="body2" fontWeight="bold">Nouvelle commande #10{i}</Typography>
                                     <Typography variant="caption" color="text.secondary">Il y a {i} heures</Typography>
                                 </Box>
                             ))}
                         </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
