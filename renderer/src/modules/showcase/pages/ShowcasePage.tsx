import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardActions, Button, Switch, FormControlLabel, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StarIcon from '@mui/icons-material/Star';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import SearchIcon from '@mui/icons-material/Search';
import SearchFilterBar from '../../shared/components/SearchFilterBar';
import { Tag } from '../../../types/electron-api';

const CAROUSEL_LIMIT = 5;

export default function ShowcasePage() {
    const { t } = useTranslation();
    const [products, setProducts] = useState<any[]>([]);
    const [allTags, setAllTags] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterTags, setSelectedFilterTags] = useState<Tag[]>([]);
    const [sortBy, setSortBy] = useState('name'); // 'name', 'price'

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const p = await window.electronApi.getProducts();
        
        const tags = await window.electronApi.getTags();

        const productsWithTags = await Promise.all(p.map(async (product: any) => {
             const productTags = await window.electronApi.getTagsForProduct(product.id);
             return { ...product, tags: productTags };
        }));

        setProducts(productsWithTags);
        setAllTags(tags);
    };

    const toggleCarousel = async (product: any) => {
        if (!product.is_in_carousel) {
             const currentCount = products.filter(p => p.is_in_carousel).length;
             if (currentCount >= CAROUSEL_LIMIT) {
                 alert(t('showcase.carouselLimitReached', { limit: CAROUSEL_LIMIT }) || `Limite de ${CAROUSEL_LIMIT} produits atteinte pour le carrousel.`);
                 return;
             }
        }
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
    
    const otherProducts = products
        .filter(p => !p.is_in_carousel && !p.is_top_product)
        .filter(p => {
             const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
             const matchesTags = selectedFilterTags.length === 0 || 
                 selectedFilterTags.some(filterTag => p.tags && p.tags.some((t: any) => t.id === filterTag.id));
             return matchesSearch && matchesTags;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
            return 0;
        });

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>{t('showcase.title') || 'Mise en avant'}</Typography>

            <Grid container spacing={3}>
                {/* Carousel Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2, borderRadius: 2, height: '100%', bgcolor: '#f5f5f5' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ViewCarouselIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">{t('showcase.carousel') || 'Carrousel'}</Typography>
                            </Box>
                            <Typography variant="subtitle2" color={carouselProducts.length >= CAROUSEL_LIMIT ? 'error' : 'text.secondary'}>
                                {carouselProducts.length} / {CAROUSEL_LIMIT}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {carouselProducts.length === 0 && <Typography variant="body2" color="text.secondary">Aucun produit dans le carrousel.</Typography>}
                            {carouselProducts.map(product => (
                                <Card key={product.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                                    <Box sx={{ px: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{product.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{product.price} €</Typography>
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
                                        <Typography variant="caption" color="text.secondary">{product.price} €</Typography>
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

                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2, borderRadius: 2, mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                 <Typography variant="h6" sx={{ mb: 2 }}>{t('showcase.availableProducts') || 'Produits disponibles'}</Typography>
                                 <SearchFilterBar 
                                    searchText={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    selectedTags={selectedFilterTags}
                                    onTagsChange={setSelectedFilterTags}
                                    allTags={allTags}
                                    placeholder={t('common.search') || 'Rechercher'} 
                                />
                            </Box>
                            <Box sx={{ mt: 5 }}> 
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <Select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        displayEmpty
                                    >
                                        <MenuItem value="name">{t('common.sortByName') || 'Nom'}</MenuItem>
                                        <MenuItem value="price">{t('common.sortByPrice') || 'Prix'}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                         </Box>
                         <Grid container spacing={2}>
                            {otherProducts.map(product => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                                    <Card variant="outlined">
                                        <CardContent sx={{ pb: 1 }}>
                                            <Typography variant="h6" component="div">
                                                {product.name}
                                            </Typography>
                                            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                                {product.target_segment} - {product.price} €
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
