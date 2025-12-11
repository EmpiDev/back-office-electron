import { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, Box, Grid, TextField, 
    DialogActions, Button 
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface TagFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (tagData: any) => Promise<void>;
    initialData?: any;
}

export default function TagFormDialog({ 
    open, 
    onClose, 
    onSave, 
    initialData
}: TagFormDialogProps) {
    const { t } = useTranslation();
    const [tag, setTag] = useState({ name: '' });

    useEffect(() => {
        if (open) {
            if (initialData) {
                setTag({ name: initialData.name });
            } else {
                setTag({ name: '' });
            }
        }
    }, [open, initialData]);

    const handleSave = () => {
        onSave(tag);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? t('tags.editTag') : t('tags.addTag')}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField 
                                label={t('tags.nameLabel')} 
                                value={tag.name} 
                                onChange={e => setTag({ ...tag, name: e.target.value })} 
                                fullWidth 
                                autoFocus
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button variant="contained" onClick={handleSave}>
                    {initialData ? t('common.save') : t('tags.add')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
