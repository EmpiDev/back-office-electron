import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';
import { useCategories } from '../hooks/useCategories';
import CategoryFormDialog from '../components/CategoryFormDialog';

export default function CategoriesPage() {
    const { t } = useTranslation();
    const { 
        categories, loading, 
        loadData, deleteCategory, saveCategory 
    } = useCategories();

    const [openDialog, setOpenDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenCreateDialog = () => {
        setEditingCategory(null);
        setOpenDialog(true);
    };

    const handleEditCategory = (category: any) => {
        setEditingCategory(category);
        setOpenDialog(true);
    };

    const handleSave = async (categoryData: any) => {
        try {
            await saveCategory(categoryData, editingCategory?.id || null);
            setOpenDialog(false);
        } catch (error) {
            console.error(error);
        }
    };

    const columns: Column<any>[] = [
        { id: 'name', label: t('common.name') || 'Nom', sortable: true },
        { id: 'description', label: t('common.description') || 'Description', sortable: true },
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
                    onDelete={deleteCategory}
                    onEdit={handleEditCategory}
                />
            </Paper>

            <CategoryFormDialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)} 
                onSave={handleSave}
                initialData={editingCategory}
            />
        </Box>
    );
}
