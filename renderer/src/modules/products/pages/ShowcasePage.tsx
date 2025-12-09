import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardActions, Button, Switch, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StarIcon from '@mui/icons-material/Star';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';

export default function ShowcasePage() {
    const { t } = useTranslation();
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const p = await window.electronApi.getProducts();
        setProducts(p);
    };

    const toggleCarousel = async (product: any) => {
        const updatedProduct = { ...product, is_in_carousel: !product.is_in_carousel };
        await window.electronApi.updateProduct(product.id, updatedProduct);
        loadData();
    };

    const toggleTopProduct = async (product: any) => {
        const updatedProduct = { ...product, is_top_product: !product.is_top_product };
        await window.electronApi.updateProduct(product.id, updatedProduct);
        loadData();
    };

    const carouselProducts = products.filter(p => p.is_in_carousel);
    const topProducts = products.filter(p => p.is_top_product);
    const otherProducts = products.filter(p => !p.is_in_carousel && !p.is_top_product);

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>{t('showcase.title') || 'Mise en avant'}</Typography>

            <Grid container spacing={3}>
                {/* Carousel Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2, borderRadius: 2, height: '100%', bgcolor: '#f5f5f5' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ViewCarouselIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">{t('showcase.carousel') || 'Carrousel'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {carouselProducts.length === 0 && <Typography variant="body2" color="text.secondary">Aucun produit dans le carrousel.</Typography>}
                            {carouselProducts.map(product => (
                                <Card key={product.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                                    <Box sx={{ px: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{product.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{product.tag}</Typography>
                                    </Box>
                                    <FormControlLabel
                                        control={<Switch checked={!!product.is_in_carousel} onChange={() => toggleCarousel(product)} />}
                                        label=""
                                    />
                                </Card>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Top Products Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2, borderRadius: 2, height: '100%', bgcolor: '#fffbf0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <StarIcon color="warning" sx={{ mr: 1 }} />
                            <Typography variant="h6">{t('showcase.topProducts') || 'Top Produits'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                             {topProducts.length === 0 && <Typography variant="body2" color="text.secondary">Aucun produit en Top Produit.</Typography>}
                            {topProducts.map(product => (
                                <Card key={product.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                                    <Box sx={{ px: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{product.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{product.tag}</Typography>
                                    </Box>
                                    <FormControlLabel
                                        control={<Switch checked={!!product.is_top_product} color="warning" onChange={() => toggleTopProduct(product)} />}
                                        label=""
                                    />
                                </Card>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* All Other Products Section */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2, borderRadius: 2, mt: 2 }}>
                         <Typography variant="h6" sx={{ mb: 2 }}>{t('showcase.availableProducts') || 'Produits disponibles'}</Typography>
                         <Grid container spacing={2}>
                            {otherProducts.map(product => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                                    <Card variant="outlined">
                                        <CardContent sx={{ pb: 1 }}>
                                            <Typography variant="h6" component="div">
                                                {product.name}
                                            </Typography>
                                            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                                {product.tag}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <FormControlLabel
                                                control={<Switch checked={!!product.is_in_carousel} onChange={() => toggleCarousel(product)} size="small" />}
                                                label={<Typography variant="caption">Carrousel</Typography>}
                                            />
                                            <FormControlLabel
                                                control={<Switch checked={!!product.is_top_product} onChange={() => toggleTopProduct(product)} color="warning" size="small" />}
                                                label={<Typography variant="caption">Top</Typography>}
                                            />
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                         </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
