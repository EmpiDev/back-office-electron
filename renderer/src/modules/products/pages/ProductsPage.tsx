import { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid, InputAdornment, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, FormGroup, FormControlLabel } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, CloudDownload as DownloadIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';

export default function ProductsPage() {
    const { t } = useTranslation();
    const [products, setProducts] = useState<any[]>([]);
    const [allServices, setAllServices] = useState<any[]>([]); // New state for all available services
    const [openDialog, setOpenDialog] = useState(false);
    const [newProduct, setNewProduct] = useState<any>({ code: '', name: '', description: '', target_segment: '', is_in_carousel: false, is_top_product: false, price: 0, payment_type: 'one_time' }); // Updated fields
    const [selectedServicesInForm, setSelectedServicesInForm] = useState<Array<{ serviceId: number; quantity: number }>>([]); // New state for selected services
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const p = await window.electronApi.getProducts();
        setProducts(p);
        const s = await window.electronApi.getServices(); // Fetch all services
        setAllServices(s);
    };

    const handleOpenCreateDialog = () => {
        setEditingProductId(null);
        setNewProduct({ code: '', name: '', description: '', target_segment: '', is_in_carousel: false, is_top_product: false, price: 0, payment_type: 'one_time' });
        setSelectedServicesInForm([]);
        setOpenDialog(true);
    };

    const handleEditProduct = async (product: any) => {
        setEditingProductId(product.id);
        setNewProduct({ 
            code: product.code, 
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
        
        setOpenDialog(true);
    };

    const handleSaveProduct = async () => {
        let savedProduct;
        if (editingProductId) {
             savedProduct = await window.electronApi.updateProduct(editingProductId, newProduct);
             // For update, we might want to clear existing services and re-add them, or handle diff. 
             // For simplicity, let's assume we clear and re-add or just add (if API supports it).
             // Ideally backend should handle "sync". Here we will just add/replace.
             // To do it cleanly without "sync" logic on backend, we might need to remove all first? 
             // Or we rely on `addServiceToProduct` being an INSERT OR REPLACE or similar?
             // Checking `product.service.js`: `addServiceToProduct` uses `INSERT OR REPLACE`. 
             // However, to remove services that were de-selected, we need explicit removal.
             
             // Simplest approach for now: Get existing, compare, add/remove. 
             // OR: Remove all services for product and re-add.
             // Let's go with: Remove all manually (if we had a removeAll) or just iterate.
             
             // Actually, let's just re-add/update for now. 
             // NOTE: This logic won't remove services if they are unchecked. 
             // TODO: Implement proper sync. For now, let's assume user adds/modifies. 
             // To support removal, we need `removeServiceFromProduct`.
             const currentServices = await window.electronApi.getServicesForProduct(editingProductId);
             for(const s of currentServices) {
                 if(!selectedServicesInForm.find(newS => newS.serviceId === s.service_id)) {
                     await window.electronApi.removeServiceFromProduct(editingProductId, s.service_id);
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
        
        setNewProduct({ code: '', name: '', description: '', target_segment: '', is_in_carousel: false, is_top_product: false, price: 0, payment_type: 'one_time' }); // Reset form
        setSelectedServicesInForm([]); // Reset selected services
        setEditingProductId(null);
        setOpenDialog(false);
        loadData();
    };

    const handleDeleteProduct = async (id: number) => {
        await window.electronApi.deleteProduct(id);
        loadData();
    };

    const columns: Column<any>[] = [
        { id: 'code', label: t('common.code') },
        { id: 'name', label: t('common.name') },
        { id: 'price', label: 'Prix', format: (value, row) => `${value} €` },
        { id: 'payment_type', label: 'Type de paiement', format: (value) => value === 'monthly' ? 'Par mois' : 'En une fois' },
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

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="Rechercher un produit..." 
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
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
                                    label={t('common.code')} 
                                    value={newProduct.code} 
                                    onChange={e => setNewProduct({ ...newProduct, code: e.target.value })} 
                                    fullWidth 
                                />
                            </Grid>
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
                                    label="Prix (€)" 
                                    type="number"
                                    value={newProduct.price} 
                                    onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} 
                                    fullWidth 
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Type de paiement</InputLabel>
                                    <Select
                                        value={newProduct.payment_type}
                                        label="Type de paiement"
                                        onChange={e => setNewProduct({ ...newProduct, payment_type: e.target.value })}
                                    >
                                        <MenuItem value="one_time">En une fois</MenuItem>
                                        <MenuItem value="monthly">Par mois</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField 
                                    label="Description" 
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

                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button variant="contained" onClick={handleSaveProduct}>{editingProductId ? t('common.save') : t('products.add')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}