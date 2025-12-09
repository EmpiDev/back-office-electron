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
    const [newProduct, setNewProduct] = useState({ code: '', name: '', description: '', target_segment: '', is_in_carousel: false, is_top_product: false }); // Updated fields
    const [selectedServicesInForm, setSelectedServicesInForm] = useState<Array<{ serviceId: number; quantity: number }>>([]); // New state for selected services
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

    const handleCreateProduct = async () => {
        const createdProduct = await window.electronApi.createProduct(newProduct);
        // Link selected services to the new product
        for (const selectedService of selectedServicesInForm) {
            await window.electronApi.addServiceToProduct(createdProduct.id, selectedService.serviceId, selectedService.quantity);
        }
        setNewProduct({ code: '', name: '', description: '', target_segment: '', is_in_carousel: false, is_top_product: false }); // Reset form
        setSelectedServicesInForm([]); // Reset selected services
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
                        onClick={() => setOpenDialog(true)}
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
                />
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{t('products.addProduct')}</DialogTitle>
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
                    <Button variant="contained" onClick={handleCreateProduct}>{t('products.add')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}