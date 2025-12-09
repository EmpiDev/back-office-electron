import { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid, InputAdornment } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';

export default function ServicesPage() {
    const { t } = useTranslation();
    const [services, setServices] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newService, setNewService] = useState({ tag: '', name: '', description: '', category_id: null });
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const s = await window.electronApi.getServices();
        setServices(s);
    };

    const handleOpenCreateDialog = () => {
        setEditingServiceId(null);
        setNewService({ tag: '', name: '', description: '', category_id: null });
        setOpenDialog(true);
    };

    const handleEditService = (service: any) => {
        setEditingServiceId(service.id);
        setNewService({
            tag: service.tag,
            name: service.name,
            description: service.description || '',
            category_id: service.category_id
        });
        setOpenDialog(true);
    };

    const handleSaveService = async () => {
        if (editingServiceId) {
            await window.electronApi.updateService(editingServiceId, newService);
        } else {
            await window.electronApi.createService(newService);
        }
        setNewService({ tag: '', name: '', description: '', category_id: null });
        setEditingServiceId(null);
        setOpenDialog(false);
        loadData();
    };

    const handleDeleteService = async (id: number) => {
        await window.electronApi.deleteService(id);
        loadData();
    };

    const columns: Column<any>[] = [
        { id: 'tag', label: t('common.tag') },
        { id: 'name', label: t('common.name') },
    ];

    const filteredServices = services.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="Rechercher un service..." 
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
                                    label={t('common.tag')} 
                                    value={newService.tag} 
                                    onChange={e => setNewService({ ...newService, tag: e.target.value })} 
                                    fullWidth 
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField 
                                    label={t('common.name')} 
                                    value={newService.name} 
                                    onChange={e => setNewService({ ...newService, name: e.target.value })} 
                                    fullWidth 
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button variant="contained" onClick={handleSaveService}>{editingServiceId ? t('common.save') : t('services.add')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}