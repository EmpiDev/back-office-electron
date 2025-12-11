import { useEffect, useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { Box, Typography, Button, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid, InputAdornment, Autocomplete, Chip } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Tag } from '../../../types/electron-api';
import SearchFilterBar from '../../shared/components/SearchFilterBar';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';

export default function ServicesPage() {
    const { t } = useTranslation();
    const [services, setServices] = useState<any[]>([]);
    const [allTags, setAllTags] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newService, setNewService] = useState({ name: '', description: '', category_id: null });
    const [selectedTagsInForm, setSelectedTagsInForm] = useState<number[]>([]);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterTags, setSelectedFilterTags] = useState<Tag[]>([]);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [selectedFilterCategories, setSelectedFilterCategories] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const { showNotification } = useNotification();

    const loadData = async () => {
        const response = await window.electronApi.getServices();
        if (!response.success) {
             showNotification(response.error || t('services.messages.loadError'), response.code);
             return;
        }
        const rawServices = response.data;
        
        // Fetch tags for each service
        const servicesWithTags = await Promise.all(rawServices.map(async (service: any) => {
            const tagsRes = await window.electronApi.getTagsForService(service.id);
            const tags = tagsRes.success ? tagsRes.data : [];
            return { ...service, tags };
        }));

        setServices(servicesWithTags);
        const tagsResponse = await window.electronApi.getTags();
        if (tagsResponse.success) {
            setAllTags(tagsResponse.data);
        }

        const categoriesResponse = await window.electronApi.getCategories();
        if (categoriesResponse.success) {
            setAllCategories(categoriesResponse.data);
        }
    };

    const handleOpenCreateDialog = () => {
        setEditingServiceId(null);
        setNewService({ name: '', description: '', category_id: null });
        setSelectedTagsInForm([]);
        setOpenDialog(true);
    };

    const handleEditService = async (service: any) => {
        setEditingServiceId(service.id);
        setNewService({
            name: service.name,
            description: service.description || '',
            category_id: service.category_id
        });
        
        // Tags are already in the service object now, but we use the API to be safe/consistent
        // or just use service.tags if we trust loadData is fresh
        const tagsRes = await window.electronApi.getTagsForService(service.id);
        const tags = tagsRes.success ? tagsRes.data : [];
        setSelectedTagsInForm(tags.map((t: any) => t.id));
        
        setOpenDialog(true);
    };

    const handleSaveService = async () => {
        let savedService;
        let result;
        if (editingServiceId) {
            result = await window.electronApi.updateService(editingServiceId, newService);
            if (!result.success) {
                 showNotification(result.error || t('services.messages.updateError'), result.code);
                 return;
            }
            savedService = result.data;
            showNotification(t('services.messages.updated'), result.code);
            
            // Update tag associations
            const currentTagsRes = await window.electronApi.getTagsForService(editingServiceId);
            const currentTags = currentTagsRes.success ? currentTagsRes.data : [];
            
            // Remove tags that are no longer selected
            for (const tag of currentTags) {
                if (tag.id && !selectedTagsInForm.includes(tag.id)) {
                    await window.electronApi.removeTagFromService(editingServiceId, tag.id);
                }
            }
            
            // Add newly selected tags
            for (const tagId of selectedTagsInForm) {
                if (!currentTags.find((t: any) => t.id === tagId)) {
                    await window.electronApi.addTagToService(editingServiceId, tagId);
                }
            }
        } else {
            result = await window.electronApi.createService(newService);
            if (!result.success) {
                showNotification(result.error || t('services.messages.createError'), result.code);
                return;
            }
            savedService = result.data;
            showNotification(t('services.messages.created'), result.code);
            
            // Add tags to new service
            if (savedService && savedService.id) {
                for (const tagId of selectedTagsInForm) {
                    await window.electronApi.addTagToService(savedService.id, tagId);
                }
            }
        }
        
        setNewService({ name: '', description: '', category_id: null });
        setSelectedTagsInForm([]);
        setEditingServiceId(null);
        setOpenDialog(false);
        loadData();
    };

    const handleDeleteService = async (id: number) => {
        const res = await window.electronApi.deleteService(id);
        if (res.success) {
            showNotification(t('services.messages.deleted'), res.code);
            loadData();
        } else {
            showNotification(res.error || t('services.messages.deleteError'), res.code);
        }
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
                    onDelete={handleDeleteService}
                    onEdit={handleEditService}
                />
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingServiceId ? t('common.edit') : t('services.addService')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField 
                                    label={t('common.name')} 
                                    value={newService.name} 
                                    onChange={e => setNewService({ ...newService, name: e.target.value })} 
                                    fullWidth 
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Autocomplete
                                    options={allCategories}
                                    getOptionLabel={(option) => option.name}
                                    value={allCategories.find(c => c.id === newService.category_id) || null}
                                    onChange={(_, newValue) => {
                                        setNewService({ ...newService, category_id: newValue ? newValue.id : null });
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
                                    value={allTags.filter(tag => tag.id && selectedTagsInForm.includes(tag.id))}
                                    onChange={(_, newValue) => {
                                        setSelectedTagsInForm(newValue.map(tag => tag.id).filter((id): id is number => id !== undefined));
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
                    <Button onClick={() => setOpenDialog(false)}>{t('common.cancel')}</Button>
                    <Button variant="contained" onClick={handleSaveService}>{editingServiceId ? t('common.save') : t('services.add')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}