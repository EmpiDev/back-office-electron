import { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, Box, Grid, TextField, 
    Autocomplete, Chip, DialogActions, Button 
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ServiceFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (serviceData: any, selectedTags: number[]) => Promise<void>;
    initialData?: any;
    initialTags?: number[];
    allTags: any[];
    allCategories: any[];
}

export default function ServiceFormDialog({ 
    open, 
    onClose, 
    onSave, 
    initialData, 
    initialTags = [],
    allTags,
    allCategories
}: ServiceFormDialogProps) {
    const { t } = useTranslation();
    const [service, setService] = useState({ name: '', description: '', category_id: null as number | null });
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setService({
                    name: initialData.name,
                    description: initialData.description || '',
                    category_id: initialData.category_id
                });
                setSelectedTags(initialTags);
            } else {
                setService({ name: '', description: '', category_id: null });
                setSelectedTags([]);
            }
        }
    }, [open, initialData, initialTags]);

    const handleSave = () => {
        onSave(service, selectedTags);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? t('common.edit') : t('services.addService')}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField 
                                label={t('common.name')} 
                                value={service.name} 
                                onChange={e => setService({ ...service, name: e.target.value })} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Autocomplete
                                options={allCategories}
                                getOptionLabel={(option) => option.name}
                                value={allCategories.find(c => c.id === service.category_id) || null}
                                onChange={(_, newValue) => {
                                    setService({ ...service, category_id: newValue ? newValue.id : null });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={t('common.category') || 'Category'}
                                        placeholder={t('common.selectCategory') || 'Select a category'}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Autocomplete
                                multiple
                                freeSolo={false}
                                options={allTags}
                                getOptionLabel={(option) => option.name}
                                value={allTags.filter(tag => tag.id && selectedTags.includes(tag.id))}
                                onChange={(_, newValue) => {
                                    setSelectedTags(newValue.map(tag => tag.id).filter((id): id is number => id !== undefined));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={t('services.tagsLabel')}
                                        placeholder={allTags.length > 0 ? t('services.tagsPlaceholder') : t('services.noTagsAvailable')}
                                        helperText={allTags.length === 0 ? t('services.goToTagsPage') : undefined}
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option.name}
                                            {...getTagProps({ index })}
                                            key={option.id}
                                        />
                                    ))
                                }
                                noOptionsText={t('services.noTagsAvailable')}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button variant="contained" onClick={handleSave}>{initialData ? t('common.save') : t('services.add')}</Button>
            </DialogActions>
        </Dialog>
    );
}
