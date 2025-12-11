import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Tag } from '../../../types/electron-api';
import SearchFilterBar from '../../shared/components/SearchFilterBar';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';
import { useServices } from '../hooks/useServices';
import ServiceFormDialog from '../components/ServiceFormDialog';

export default function ServicesPage() {
    const { t } = useTranslation();
    const { 
        services, allTags, allCategories, loading, 
        loadData, deleteService, saveService 
    } = useServices();

    const [openDialog, setOpenDialog] = useState(false);
    const [editingService, setEditingService] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterTags, setSelectedFilterTags] = useState<Tag[]>([]);
    const [selectedFilterCategories, setSelectedFilterCategories] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenCreateDialog = () => {
        setEditingService(null);
        setOpenDialog(true);
    };

    const handleEditService = (service: any) => {
        setEditingService(service);
        setOpenDialog(true);
    };

    const handleSave = async (serviceData: any, selectedTags: number[]) => {
        try {
            await saveService(serviceData, selectedTags, editingService?.id || null);
            setOpenDialog(false);
        } catch (error) {
            console.error(error);
        }
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
            id: 'category_name', 
            label: t('common.category') || 'Catégorie', 
            sortable: true,
            render: (row) => row.category_name ? (
                <Chip label={row.category_name} size="small" variant="outlined" color="primary" />
            ) : '-'
        },
        { id: 'name', label: t('common.name'), sortable: true },
    ];

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTags = selectedFilterTags.length === 0 || 
            selectedFilterTags.some(filterTag => service.tags && service.tags.some((t: any) => t.id === filterTag.id));
        const matchesCategory = selectedFilterCategories.length === 0 ||
            selectedFilterCategories.some(cat => service.category_id === cat.id);
        
        return matchesSearch && matchesTags && matchesCategory;
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('services.title')}</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={handleOpenCreateDialog}
                >
                    {t('services.addService')}
                </Button>
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
                    data={filteredServices}
                    onDelete={deleteService}
                    onEdit={handleEditService}
                />
            </Paper>

            <ServiceFormDialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)} 
                onSave={handleSave}
                initialData={editingService}
                initialTags={editingService ? normalizeTagsForDialog(editingService.tags) : []}
                allTags={allTags}
                allCategories={allCategories}
            />
        </Box>
    );
}