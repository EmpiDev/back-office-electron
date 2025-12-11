import { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, Box, Grid, TextField, FormControl, 
    InputLabel, Select, MenuItem, Typography, Autocomplete, Paper, IconButton, 
    Chip, DialogActions, Button 
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ProductFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (productData: any, selectedServices: any[], selectedTags: number[]) => Promise<void>;
    initialData?: any;
    initialServices?: Array<{ serviceId: number; quantity: number }>;
    initialTags?: number[];
    allServices: any[];
    allTags: any[];
}

export default function ProductFormDialog({ 
    open, 
    onClose, 
    onSave, 
    initialData, 
    initialServices = [],
    initialTags = [],
    allServices, 
    allTags 
}: ProductFormDialogProps) {
    const { t } = useTranslation();
    const [product, setProduct] = useState({ 
        name: '', description: '', target_segment: '', 
        is_in_carousel: false, is_top_product: false, 
        price: 0, payment_type: 'one_time' 
    });
    const [selectedServices, setSelectedServices] = useState<Array<{ serviceId: number; quantity: number }>>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setProduct({
                    name: initialData.name,
                    description: initialData.description,
                    target_segment: initialData.target_segment,
                    is_in_carousel: !!initialData.is_in_carousel,
                    is_top_product: !!initialData.is_top_product,
                    price: initialData.price || 0,
                    payment_type: initialData.payment_type || 'one_time'
                });
                setSelectedServices(initialServices);
                setSelectedTags(initialTags);
            } else {
                setProduct({ name: '', description: '', target_segment: '', is_in_carousel: false, is_top_product: false, price: 0, payment_type: 'one_time' });
                setSelectedServices([]);
                setSelectedTags([]);
            }
        }
    }, [open, initialData, initialServices, initialTags]);

    // Handle initial relations separately to allow async loading by parent if needed, 
    // OR we can export a hook `useProductForm` that the parent uses.
    // For now, I'll add `initialServices` and `initialTags` to props in the next definition to be cleaner.
    // But since I'm writing the file now, I'll add a `loading` state if I were fetching. 
    // Let's assume the parent does the fetching for now.
    
    // WAIT: The previous code had automatic tag inheritance effect.
    useEffect(() => {
        const fetchServiceTags = async () => {
             const allServiceTags = new Set<number>();
             for (const { serviceId } of selectedServices) {
                 // @ts-ignore
                 const tagsRes = await window.electronApi.getTagsForService(serviceId);
                 if (tagsRes.success) {
                     tagsRes.data.forEach((tag: any) => tag.id && allServiceTags.add(tag.id));
                 }
             }
             setSelectedTags(Array.from(allServiceTags));
        };
        
        if (selectedServices.length > 0) {
            fetchServiceTags();
        } else if (!initialData) { // Only reset if creating new, or be careful not to wipe existing tags on load
            // The logic in original file was: if selectedServices changes, update tags.
            // But when editing, we load existing tags. 
            // If we add a service, we want to ADD tags, not replace manual ones. 
            // The original logic replaced `selectedTagsInForm` with service tags.
            // Let's replicate original behavior:
            // "Automatic tag inheritance from selected services": It sets `setSelectedTagsInForm` entirely.
        }
    }, [selectedServices]);

    // Internal handlers
    const handleSave = () => {
        onSave(product, selectedServices, selectedTags);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? t('common.edit') : t('products.addProduct')}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField 
                                label={t('common.name')} 
                                value={product.name} 
                                onChange={e => setProduct({ ...product, name: e.target.value })} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField 
                                label={t('products.priceEuro')} 
                                type="number"
                                value={product.price} 
                                onChange={e => setProduct({ ...product, price: parseFloat(e.target.value) })} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>{t('common.paymentType')}</InputLabel>
                                <Select
                                    value={product.payment_type}
                                    label={t('common.paymentType')}
                                    onChange={e => setProduct({ ...product, payment_type: e.target.value })}
                                >
                                    <MenuItem value="one_time">{t('products.paymentTypes.oneTime')}</MenuItem>
                                    <MenuItem value="monthly">{t('products.paymentTypes.monthly')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField 
                                label={t('common.description')} 
                                value={product.description} 
                                onChange={e => setProduct({ ...product, description: e.target.value })} 
                                fullWidth 
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                    
                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>{t('products.selectServices')}</Typography>
                    <Box sx={{ mb: 2 }}>
                        <Autocomplete
                            options={allServices.filter(s => !selectedServices.some(selected => selected.serviceId === s.id))}
                            getOptionLabel={(option) => `${option.name}`}
                            value={null}
                            onChange={(_, newValue) => {
                                if (newValue) {
                                    setSelectedServices(prev => [...prev, { serviceId: newValue.id, quantity: 1 }]);
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
                        {selectedServices.map((selected) => {
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
                                            onChange={(e) => {
                                                const quantity = parseInt(e.target.value, 10);
                                                setSelectedServices(prev => 
                                                    prev.map(s => s.serviceId === selected.serviceId ? { ...s, quantity: Math.max(1, quantity) } : s)
                                                );
                                            }}
                                            size="small"
                                            sx={{ width: 100 }}
                                            InputProps={{ inputProps: { min: 1 } }}
                                        />
                                        <IconButton 
                                            onClick={() => setSelectedServices(prev => prev.filter(s => s.serviceId !== selected.serviceId))} 
                                            color="error" 
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Box>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>{t('products.inheritedTags')}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedTags.length > 0 ? (
                            allTags
                                .filter(tag => tag.id && selectedTags.includes(tag.id))
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
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button variant="contained" onClick={handleSave}>{initialData ? t('common.save') : t('products.add')}</Button>
            </DialogActions>
        </Dialog>
    );
}
