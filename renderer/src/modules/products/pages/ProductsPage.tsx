import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Chip, Tooltip, IconButton } from '@mui/material';
import { Add as AddIcon, Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Tag } from '../../../types/electron-api';
import SearchFilterBar from '../../shared/components/SearchFilterBar';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';
import { useProducts } from '../hooks/useProducts';
import ProductFormDialog from '../components/ProductFormDialog';

export default function ProductsPage() {
    const { t } = useTranslation();
    const { 
        products, allServices, allTags, allCategories, loading, 
        loadData, deleteProduct, toggleTopProduct, saveProduct 
    } = useProducts();

    const [openDialog, setOpenDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterTags, setSelectedFilterTags] = useState<Tag[]>([]);
    const [selectedFilterCategories, setSelectedFilterCategories] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenCreateDialog = () => {
        setEditingProduct(null);
        setOpenDialog(true);
    };

    const handleEditProduct = (product: any) => {
        setEditingProduct(product);
        setOpenDialog(true);
    };

    const handleSave = async (productData: any, selectedServices: any[], selectedTags: number[]) => {
        try {
            await saveProduct(productData, selectedServices, selectedTags, editingProduct?.id || null);
            setOpenDialog(false);
        } catch (error) {
            console.error(error);
            // Error handling is done inside saveProduct (notifications)
        }
    };

    const normalizeServicesForDialog = (services: any[]) => {
        return services?.map((s: any) => ({ serviceId: s.service_id, quantity: s.quantity })) || [];
    };

    const normalizeTagsForDialog = (tags: any[]) => {
        return tags?.map((t: any) => t.id) || [];
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
                        onClick={(e) => { e.stopPropagation(); toggleTopProduct(row); }}
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
                    onDelete={deleteProduct}
                    onEdit={handleEditProduct}
                />
            </Paper>

            <ProductFormDialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)} 
                onSave={handleSave}
                initialData={editingProduct}
                initialServices={editingProduct ? normalizeServicesForDialog(editingProduct.services) : []}
                initialTags={editingProduct ? normalizeTagsForDialog(editingProduct.tags) : []}
                allServices={allServices}
                allTags={allTags}
            />
        </Box>
    );
}