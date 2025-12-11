import { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, Box, Grid, TextField, 
    DialogActions, Button 
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CategoryFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (categoryData: any) => Promise<void>;
    initialData?: any;
}

export default function CategoryFormDialog({ 
    open, 
    onClose, 
    onSave, 
    initialData
}: CategoryFormDialogProps) {
    const { t } = useTranslation();
    const [category, setCategory] = useState({ name: '', description: '' });

    useEffect(() => {
        if (open) {
            if (initialData) {
                setCategory({
                    name: initialData.name,
                    description: initialData.description || ''
                });
            } else {
                setCategory({ name: '', description: '' });
            }
        }
    }, [open, initialData]);

    const handleSave = () => {
        onSave(category);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? (t('common.edit') || 'Modifier') : (t('categories.addCategory') || 'Ajouter une catégorie')}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField 
                                label={t('common.name') || 'Nom'} 
                                value={category.name} 
                                onChange={e => setCategory({ ...category, name: e.target.value })} 
                                fullWidth 
                                autoFocus
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField 
                                label={t('common.description') || 'Description'} 
                                value={category.description} 
                                onChange={e => setCategory({ ...category, description: e.target.value })} 
                                fullWidth 
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>{t('common.cancel') || 'Annuler'}</Button>
                <Button variant="contained" onClick={handleSave}>
                    {initialData ? (t('common.save') || 'Enregistrer') : (t('common.add') || 'Ajouter')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
