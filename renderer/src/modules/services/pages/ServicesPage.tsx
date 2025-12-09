import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';

export default function ServicesPage() {
    const { t } = useTranslation();
    const [services, setServices] = useState<any[]>([]);
    const [newService, setNewService] = useState({ code: '', name: '', description: '', category_id: null });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const s = await window.electronApi.getServices();
        setServices(s);
    };

    const handleCreateService = async () => {
        await window.electronApi.createService(newService);
        setNewService({ ...newService, code: '', name: '' });
        loadData();
    };

    const handleDeleteService = async (id: number) => {
        await window.electronApi.deleteService(id);
        loadData();
    };

    const columns: Column<any>[] = [
        { id: 'code', label: t('common.code') },
        { id: 'name', label: t('common.name') },
    ];

    return (
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>{t('services.title')}</Typography>
            <Button variant="contained" onClick={loadData} sx={{ mb: 4 }}>{t('common.refresh')}</Button>

            <Paper sx={{ p: 2, maxWidth: 800 }}>
                <Typography variant="h6">{t('services.addService')}</Typography>
                <Box sx={{ mb: 2 }}>
                    <TextField 
                        size="small" 
                        label={t('common.code')} 
                        value={newService.code} 
                        onChange={e => setNewService({ ...newService, code: e.target.value })} 
                        fullWidth 
                        sx={{ mb: 1 }} 
                    />
                    <TextField 
                        size="small" 
                        label={t('common.name')} 
                        value={newService.name} 
                        onChange={e => setNewService({ ...newService, name: e.target.value })} 
                        fullWidth 
                        sx={{ mb: 1 }} 
                    />
                    <Button variant="outlined" onClick={handleCreateService}>{t('services.add')}</Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>{t('services.list')}</Typography>
                
                <DataTable 
                    columns={columns}
                    data={services}
                    onDelete={handleDeleteService}
                />
            </Paper>
        </Box>
    );
}