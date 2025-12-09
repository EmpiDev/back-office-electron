import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

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

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>{t('services.title')}</Typography>
            <Button variant="contained" onClick={loadData} sx={{ mb: 4 }}>{t('common.refresh')}</Button>

            <Paper sx={{ p: 2, maxWidth: 600 }}>
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
                {services.map(s => (
                    <Box key={s.id} sx={{ mb: 1, borderBottom: '1px solid #eee', pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">{s.name} ({s.code})</Typography>
                            <Button size="small" color="error" onClick={() => handleDeleteService(s.id)}>{t('common.delete')}</Button>
                        </Box>
                    </Box>
                ))}
            </Paper>
        </Box>
    );
}