import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardActions, Switch, FormControlLabel, FormControl, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StarIcon from '@mui/icons-material/Star';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import SearchFilterBar from '../../shared/components/SearchFilterBar';
import { Tag } from '../../../types/electron-api';
import { useShowcase } from '../hooks/useShowcase';
import { ShowcaseSection } from '../components/ShowcaseSection';

const CAROUSEL_LIMIT = 5;

export default function ShowcasePage() {
    const { t } = useTranslation();
    const { 
        products, allTags, loading, 
        loadData, toggleCarousel, toggleTopProduct 
    } = useShowcase();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterTags, setSelectedFilterTags] = useState<Tag[]>([]);
    const [sortBy, setSortBy] = useState('name');

    useEffect(() => {
        loadData();
    }, [loadData]);

    const carouselProducts = products.filter(p => p.is_in_carousel);
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
                <Grid size={{ xs: 12, md: 6 }}>
                    <ShowcaseSection 
                        title={t('showcase.carousel') || 'Carrousel'}
                        icon={<ViewCarouselIcon color="primary" />}
                        products={carouselProducts}
                        onToggle={toggleCarousel}
                        toggleProp="is_in_carousel"
                        limit={CAROUSEL_LIMIT}
                        emptyMessage="Aucun produit dans le carrousel."
                        switchColor="primary"
                    />
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
