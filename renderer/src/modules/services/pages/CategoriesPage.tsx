import { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid, InputAdornment } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';

export default function CategoriesPage() {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const c = await window.electronApi.getCategories();
        setCategories(c);
    };

    const handleOpenCreateDialog = () => {
        setEditingCategoryId(null);
        setNewCategory({ name: '', description: '' });
        setOpenDialog(true);
    };

    const handleEditCategory = (category: any) => {
        setEditingCategoryId(category.id);
        setNewCategory({ name: category.name, description: category.description || '' });
        setOpenDialog(true);
    };

    const handleSaveCategory = async () => {
        if (editingCategoryId) {
            await window.electronApi.updateCategory(editingCategoryId, newCategory);
        } else {
            await window.electronApi.createCategory(newCategory);
        }
        setNewCategory({ name: '', description: '' });
        setEditingCategoryId(null);
        setOpenDialog(false);
        loadData();
    };

    const handleDeleteCategory = async (id: number) => {
        await window.electronApi.deleteCategory(id);
        loadData();
    };

    const columns: Column<any>[] = [
        { id: 'name', label: t('common.name') || 'Nom' },
        { id: 'description', label: t('common.description') || 'Description' },
    ];

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('categories.title') || 'Gestion des Catégories'}</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={handleOpenCreateDialog}
                >
                    {t('categories.addCategory') || 'Ajouter une catégorie'}
                </Button>
            </Box>

            <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder={t('categories.searchPlaceholder') || 'Rechercher une catégorie...'} 
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
                    data={filteredCategories}
                    onDelete={handleDeleteCategory}
                    onEdit={handleEditCategory}
                />
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingCategoryId ? (t('common.edit') || 'Modifier') : (t('categories.addCategory') || 'Ajouter une catégorie')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField 
                                    label={t('common.name') || 'Nom'} 
                                    value={newCategory.name} 
                                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} 
                                    fullWidth 
                                    autoFocus
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField 
                                    label={t('common.description') || 'Description'} 
                                    value={newCategory.description} 
                                    onChange={e => setNewCategory({ ...newCategory, description: e.target.value })} 
                                    fullWidth 
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialog(false)}>{t('common.cancel') || 'Annuler'}</Button>
                    <Button variant="contained" onClick={handleSaveCategory}>
                        {editingCategoryId ? (t('common.save') || 'Enregistrer') : (t('common.add') || 'Ajouter')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
