import { useEffect, useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { Box, Typography, Button, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid, InputAdornment, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, FormGroup, FormControlLabel, Chip, IconButton, Tooltip, Autocomplete } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, CloudDownload as DownloadIcon, Star as StarIcon, StarBorder as StarBorderIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [selectedFilterCategories, setSelectedFilterCategories] = useState<any[]>([]);

    // Automatic tag inheritance from selected services
    useEffect(() => {
        const fetchServiceTags = async () => {
            const allServiceTags = new Set<number>();
            for (const { serviceId } of selectedServicesInForm) {
                const tagsRes = await window.electronApi.getTagsForService(serviceId);
                if (tagsRes.success) {
                    tagsRes.data.forEach(tag => tag.id && allServiceTags.add(tag.id));
                }
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


    const { showNotification } = useNotification();

    const loadData = async () => {
        const productsRes = await window.electronApi.getProducts();
        if (!productsRes.success) {
            showNotification(productsRes.error || t('products.messages.loadError'), productsRes.code);
            return;
        }
        const rawProducts = productsRes.data;
        
        // Fetch tags and services (for categories) for each product
        const productsWithDetails = await Promise.all(rawProducts.map(async (product: any) => {
            const [tagsRes, servicesRes] = await Promise.all([
                window.electronApi.getTagsForProduct(product.id),
                window.electronApi.getServicesForProduct(product.id)
            ]);

            const tags = tagsRes.success ? tagsRes.data : [];
            const services = servicesRes.success ? servicesRes.data : [];
            
            // Extract unique categories from services
            const productCategories = new Map();
            services.forEach((s: any) => {
                if (s.category_id && s.category_name) {
                    productCategories.set(s.category_id, { id: s.category_id, name: s.category_name });
                }
            });
            
            const categories = Array.from(productCategories.values());

            return { 
                ...product, 
                tags,
                categories
            };
        }));

        setProducts(productsWithDetails);
        const sRes = await window.electronApi.getServices(); // Fetch all services
        if (sRes.success) setAllServices(sRes.data);
        
        const tagsRes = await window.electronApi.getTags(); // Fetch all tags
        if (tagsRes.success) setAllTags(tagsRes.data);

        const categoriesResponse = await window.electronApi.getCategories();
        if (categoriesResponse.success) {
            setAllCategories(categoriesResponse.data);
        }
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
        const servicesRes = await window.electronApi.getServicesForProduct(product.id);
        if (servicesRes.success) {
            setSelectedServicesInForm(servicesRes.data.map((s: any) => ({ serviceId: s.service_id, quantity: s.quantity })));
        }
        
        // Load associated tags
        const tagsRes = await window.electronApi.getTagsForProduct(product.id);
        if (tagsRes.success) {
            setSelectedTagsInForm(tagsRes.data.map((t: any) => t.id));
        }
        
        setOpenDialog(true);
    };

    const handleSaveProduct = async () => {
        let savedProduct;
        let res;
        if (editingProductId) {
             res = await window.electronApi.updateProduct(editingProductId, newProduct);
             if (!res.success) { showNotification(res.error || t('products.messages.updateError'), res.code); return; }
             savedProduct = res.data;
             
             const currentServicesRes = await window.electronApi.getServicesForProduct(editingProductId);
             const currentServices = currentServicesRes.success ? currentServicesRes.data : [];

             for(const s of currentServices) {
                 if(!selectedServicesInForm.find(newS => newS.serviceId === s.service_id)) {
                     await window.electronApi.removeServiceFromProduct(editingProductId, s.service_id);
                 }
             }
             
             // Update tag associations
             const currentTagsRes = await window.electronApi.getTagsForProduct(editingProductId);
             const currentTags = currentTagsRes.success ? currentTagsRes.data : [];
             
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
             res = await window.electronApi.createProduct(newProduct);
             if (!res.success) { showNotification(res.error || t('products.messages.createError'), res.code); return; }
             savedProduct = res.data;
        }

        const productId = savedProduct ? savedProduct.id : editingProductId;

        // Link selected services to the product
        for (const selectedService of selectedServicesInForm) {
            // Check if already linked if editing? 
            // The logic above removes only deleted ones. For existing ones, addServiceToProduct might duplicate or update?
            // Assuming addServiceToProduct handles update or ignore.
            await window.electronApi.addServiceToProduct(productId!, selectedService.serviceId, selectedService.quantity);
        }
        
        // Add tags to new product
        if (savedProduct && savedProduct.id && !editingProductId) {
            for (const tagId of selectedTagsInForm) {
                await window.electronApi.addTagToProduct(savedProduct.id, tagId);
            }
        }
        
        showNotification(editingProductId ? t('products.messages.updated') : t('products.messages.created'), res.code);

        setNewProduct({ name: '', description: '', target_segment: '', is_in_carousel: false, is_top_product: false, price: 0, payment_type: 'one_time' }); // Reset form
        setSelectedServicesInForm([]); // Reset selected services
        setSelectedTagsInForm([]); // Reset selected tags
        setEditingProductId(null);
        setOpenDialog(false);
        loadData();
    };

    const handleDeleteProduct = async (id: number) => {
        const res = await window.electronApi.deleteProduct(id);
        if (res.success) {
            showNotification(t('products.messages.deleted'), res.code);
            loadData();
        } else {
            showNotification(res.error || t('products.messages.deleteError'), res.code);
        }
    };

    const handleToggleTopProduct = async (product: any) => {
        const updatedProduct = { 
            ...product, 
            is_top_product: !product.is_top_product,
            // Ensure boolean fields are properly typed/converted if necessary, though direct spread works for known structure
        };
        // The backend expects boolean for is_top_product, handled by updateProduct
        const res = await window.electronApi.updateProduct(product.id, updatedProduct);
        if (res.success) loadData();
        else showNotification(res.error || t('products.messages.updateError'), res.code);
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
            sortable: true,
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
        { id: 'name', label: t('common.name'), sortable: true },
        { id: 'description', label: t('common.description'), sortable: true },
        { id: 'price', label: t('common.price'), render: (row) => `${row.price} €`, sortable: true },
        { id: 'payment_type', label: t('common.paymentType'), format: (value) => value === 'monthly' ? t('products.paymentTypes.monthly') : t('products.paymentTypes.oneTime'), sortable: true },
        // { id: 'description', label: t('common.description') }, // Optional
        {
            id: 'categories',
            label: t('common.categories') || 'Catégories',
                sortable: true,
            render: (row) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {row.categories && row.categories.map((cat: any) => (
                        <Chip key={cat.id} label={cat.name} size="small" variant="outlined" color="primary" />
                    ))}
                </Box>
            )
        }
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
        const matchesCategories = selectedFilterCategories.length === 0 ||
            selectedFilterCategories.some(filterCat => product.categories && product.categories.some((c: any) => c.id === filterCat.id));
        
        return matchesSearch && matchesTags && matchesCategories;
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
                    selectedCategories={selectedFilterCategories}
                    onCategoriesChange={setSelectedFilterCategories}
                    allCategories={allCategories}
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
                        <Box sx={{ mb: 2 }}>
                            <Autocomplete
                                options={allServices.filter(s => !selectedServicesInForm.some(selected => selected.serviceId === s.id))}
                                getOptionLabel={(option) => `${option.name}`}
                                value={null}
                                onChange={(_, newValue) => {
                                    if (newValue) {
                                        handleServiceSelection(newValue.id, true);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={t('products.addService')}
                                        placeholder={t('products.searchService')}
                                    />
                                )}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {selectedServicesInForm.map((selected) => {
                                const service = allServices.find(s => s.id === selected.serviceId);
                                if (!service) return null;
                                return (
                                    <Paper key={selected.serviceId} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="body1" sx={{ flexGrow: 1 }}>
                                            {service.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TextField
                                                type="number"
                                                label={t('common.quantity')}
                                                value={selected.quantity}
                                                onChange={(e) => handleServiceQuantityChange(selected.serviceId, parseInt(e.target.value, 10))}
                                                size="small"
                                                sx={{ width: 100 }}
                                                InputProps={{ inputProps: { min: 1 } }}
                                            />
                                            <IconButton onClick={() => handleServiceSelection(selected.serviceId, false)} color="error" size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Paper>
                                );
                            })}
                        </Box>

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