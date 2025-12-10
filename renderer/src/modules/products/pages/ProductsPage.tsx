import { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid, InputAdornment, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, FormGroup, FormControlLabel, Chip, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, CloudDownload as DownloadIcon, Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Tag } from '../../../types/electron-api';
import SearchFilterBar from '../../shared/components/SearchFilterBar';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';

export default function ProductsPage() {
    const { t } = useTranslation();
    const [products, setProducts] = useState<any[]>([]);
    const [allServices, setAllServices] = useState<any[]>([]); // New state for all available services
    const [allTags, setAllTags] = useState<any[]>([]); // State for all available tags
    const [openDialog, setOpenDialog] = useState(false);
    const [newProduct, setNewProduct] = useState<any>({ name: '', description: '', target_segment: '', is_in_carousel: false, is_top_product: false, price: 0, payment_type: 'one_time' }); // Updated fields
    const [selectedServicesInForm, setSelectedServicesInForm] = useState<Array<{ serviceId: number; quantity: number }>>([]); // New state for selected services
    const [selectedTagsInForm, setSelectedTagsInForm] = useState<number[]>([]); // State for selected tags (now auto-calculated)
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterTags, setSelectedFilterTags] = useState<Tag[]>([]);

    // Automatic tag inheritance from selected services
    useEffect(() => {
        const fetchServiceTags = async () => {
            const allServiceTags = new Set<number>();
            for (const { serviceId } of selectedServicesInForm) {
                const tags = await window.electronApi.getTagsForService(serviceId);
                tags.forEach(tag => tag.id && allServiceTags.add(tag.id));
            }
            setSelectedTagsInForm(Array.from(allServiceTags));
        };
        
        if (selectedServicesInForm.length > 0) {
            fetchServiceTags();
        } else {
            setSelectedTagsInForm([]);
        }
    }, [selectedServicesInForm]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const rawProducts = await window.electronApi.getProducts();
        
        // Fetch tags for each product
        const productsWithTags = await Promise.all(rawProducts.map(async (product: any) => {
            const tags = await window.electronApi.getTagsForProduct(product.id);
            return { ...product, tags };
        }));

        setProducts(productsWithTags);
        const s = await window.electronApi.getServices(); // Fetch all services
        setAllServices(s);
        const tags = await window.electronApi.getTags(); // Fetch all tags
        setAllTags(tags);
    };

    const handleOpenCreateDialog = () => {
        setEditingProductId(null);
        setNewProduct({ name: '', description: '', target_segment: '', is_in_carousel: false, is_top_product: false, price: 0, payment_type: 'one_time' });
        setSelectedServicesInForm([]);
        setSelectedTagsInForm([]);
        setOpenDialog(true);
    };

    const handleEditProduct = async (product: any) => {
        setEditingProductId(product.id);
        setNewProduct({ 
            name: product.name, 
            description: product.description, 
            target_segment: product.target_segment, 
            is_in_carousel: !!product.is_in_carousel, 
            is_top_product: !!product.is_top_product,
            price: product.price || 0,
            payment_type: product.payment_type || 'one_time'
        });
        
        // Load associated services
        const services = await window.electronApi.getServicesForProduct(product.id);
        setSelectedServicesInForm(services.map(s => ({ serviceId: s.service_id, quantity: s.quantity })));
        
        // Load associated tags
        const tags = await window.electronApi.getTagsForProduct(product.id);
        setSelectedTagsInForm(tags.map((t: any) => t.id));
        
        setOpenDialog(true);
    };

    const handleSaveProduct = async () => {
        let savedProduct;
        if (editingProductId) {
             savedProduct = await window.electronApi.updateProduct(editingProductId, newProduct);
             
             const currentServices = await window.electronApi.getServicesForProduct(editingProductId);
             for(const s of currentServices) {
                 if(!selectedServicesInForm.find(newS => newS.serviceId === s.service_id)) {
                     await window.electronApi.removeServiceFromProduct(editingProductId, s.service_id);
                 }
             }
             
             // Update tag associations
             const currentTags = await window.electronApi.getTagsForProduct(editingProductId);
             
             // Remove tags that are no longer selected
             for (const tag of currentTags) {
                 if (tag.id && !selectedTagsInForm.includes(tag.id)) {
                     await window.electronApi.removeTagFromProduct(editingProductId, tag.id);
                 }
             }
             
             // Add newly selected tags
             for (const tagId of selectedTagsInForm) {
                 if (!currentTags.find((t: any) => t.id === tagId)) {
                     await window.electronApi.addTagToProduct(editingProductId, tagId);
                 }
             }
        } else {
             savedProduct = await window.electronApi.createProduct(newProduct);
        }

        const productId = savedProduct ? savedProduct.id : editingProductId;

        // Link selected services to the product
        for (const selectedService of selectedServicesInForm) {
            await window.electronApi.addServiceToProduct(productId!, selectedService.serviceId, selectedService.quantity);
        }
        
        // Add tags to new product
        if (savedProduct && savedProduct.id) {
            for (const tagId of selectedTagsInForm) {
                await window.electronApi.addTagToProduct(savedProduct.id, tagId);
            }
        }
        
        setNewProduct({ name: '', description: '', target_segment: '', is_in_carousel: false, is_top_product: false, price: 0, payment_type: 'one_time' }); // Reset form
        setSelectedServicesInForm([]); // Reset selected services
        setSelectedTagsInForm([]); // Reset selected tags
        setEditingProductId(null);
        setOpenDialog(false);
        loadData();
    };

    const handleDeleteProduct = async (id: number) => {
        await window.electronApi.deleteProduct(id);
        loadData();
    };

    const handleToggleTopProduct = async (product: any) => {
        const updatedProduct = { 
            ...product, 
            is_top_product: !product.is_top_product,
            // Ensure boolean fields are properly typed/converted if necessary, though direct spread works for known structure
        };
        // The backend expects boolean for is_top_product, handled by updateProduct
        await window.electronApi.updateProduct(product.id, updatedProduct);
        loadData();
    };

    const columns: Column<any>[] = [
        { 
            id: 'tags', 
            label: t('common.tag'),
            render: (row) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {row.tags && row.tags.map((tag: any) => (
                        <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
                    ))}
                </Box>
            )
        },
        {
            id: 'is_top_product',
            label: t('products.topProduct'),
            render: (row) => (
                <Tooltip title={row.is_top_product ? t('products.removeTopProduct') : t('products.addTopProduct')}>
                    <IconButton 
                        onClick={(e) => { e.stopPropagation(); handleToggleTopProduct(row); }}
                        color={row.is_top_product ? "warning" : "default"}
                    >
                        {row.is_top_product ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                </Tooltip>
            )
        },
        { id: 'name', label: t('common.name') },
        { id: 'description', label: t('common.description') },
        { id: 'price', label: t('common.price'), render: (row) => `${row.price} €` },
        { id: 'payment_type', label: t('common.paymentType'), format: (value) => value === 'monthly' ? t('products.paymentTypes.monthly') : t('products.paymentTypes.oneTime') },
        // { id: 'description', label: t('common.description') }, // Optional
    ];

    const handleServiceSelection = (serviceId: number, isChecked: boolean) => {
        if (isChecked) {
            setSelectedServicesInForm(prev => [...prev, { serviceId, quantity: 1 }]); // Default quantity to 1
        } else {
            setSelectedServicesInForm(prev => prev.filter(s => s.serviceId !== serviceId));
        }
    };

    const handleServiceQuantityChange = (serviceId: number, quantity: number) => {
        setSelectedServicesInForm(prev => 
            prev.map(s => s.serviceId === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s)
        );
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTags = selectedFilterTags.length === 0 || 
            selectedFilterTags.some(filterTag => product.tags && product.tags.some((t: any) => t.id === filterTag.id));
        
        return matchesSearch && matchesTags;
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('products.title')}</Typography>
                <Box>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={handleOpenCreateDialog}
                    >
                        {t('products.addProduct')}
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                <SearchFilterBar 
                    searchText={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedTags={selectedFilterTags}
                    onTagsChange={setSelectedFilterTags}
                    allTags={allTags} 
                />
            </Paper>

            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <DataTable 
                    columns={columns}
                    data={filteredProducts}
                    onDelete={handleDeleteProduct}
                    onEdit={handleEditProduct}
                />
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingProductId ? t('common.edit') : t('products.addProduct')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField 
                                    label={t('common.name')} 
                                    value={newProduct.name} 
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} 
                                    fullWidth 
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField 
                                    label={t('products.priceEuro')} 
                                    type="number"
                                    value={newProduct.price} 
                                    onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} 
                                    fullWidth 
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('common.paymentType')}</InputLabel>
                                    <Select
                                        value={newProduct.payment_type}
                                        label={t('common.paymentType')}
                                        onChange={e => setNewProduct({ ...newProduct, payment_type: e.target.value })}
                                    >
                                        <MenuItem value="one_time">{t('products.paymentTypes.oneTime')}</MenuItem>
                                        <MenuItem value="monthly">{t('products.paymentTypes.monthly')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField 
                                    label={t('common.description')} 
                                    value={newProduct.description} 
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} 
                                    fullWidth 
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                        </Grid>
                        
                        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>{t('products.selectServices')}</Typography>
                        <FormGroup>
                            {allServices.map((service) => (
                                <Box key={service.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedServicesInForm.some(s => s.serviceId === service.id)}
                                                onChange={(e) => handleServiceSelection(service.id, e.target.checked)}
                                            />
                                        }
                                        label={`${service.name} (${service.unit || 'unité'})`}
                                    />
                                    {selectedServicesInForm.some(s => s.serviceId === service.id) && (
                                        <TextField
                                            type="number"
                                            label={t('common.quantity')}
                                            value={selectedServicesInForm.find(s => s.serviceId === service.id)?.quantity || 1}
                                            onChange={(e) => handleServiceQuantityChange(service.id, parseInt(e.target.value, 10))}
                                            size="small"
                                            sx={{ ml: 2, width: 80 }}
                                            InputProps={{ inputProps: { min: 1 } }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </FormGroup>

                        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>{t('products.inheritedTags')}</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {selectedTagsInForm.length > 0 ? (
                                allTags
                                    .filter(tag => tag.id && selectedTagsInForm.includes(tag.id))
                                    .map(tag => (
                                        <Chip
                                            key={tag.id}
                                            label={tag.name}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    {t('products.noInheritedTags')}
                                </Typography>
                            )}
                        </Box>

                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialog(false)}>{t('common.cancel')}</Button>
                    <Button variant="contained" onClick={handleSaveProduct}>{editingProductId ? t('common.save') : t('products.add')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}