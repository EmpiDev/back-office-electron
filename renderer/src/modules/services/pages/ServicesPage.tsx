import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Divider } from '@mui/material';

export default function ServicesPage() {
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
            <Typography variant="h4" gutterBottom>Services Management</Typography>
            <Button variant="contained" onClick={loadData} sx={{ mb: 4 }}>Refresh</Button>

            <Paper sx={{ p: 2, maxWidth: 600 }}>
                <Typography variant="h6">Add Service</Typography>
                <Box sx={{ mb: 2 }}>
                    <TextField 
                        size="small" 
                        label="Code" 
                        value={newService.code} 
                        onChange={e => setNewService({ ...newService, code: e.target.value })} 
                        fullWidth 
                        sx={{ mb: 1 }} 
                    />
                    <TextField 
                        size="small" 
                        label="Name" 
                        value={newService.name} 
                        onChange={e => setNewService({ ...newService, name: e.target.value })} 
                        fullWidth 
                        sx={{ mb: 1 }} 
                    />
                    <Button variant="outlined" onClick={handleCreateService}>Add Service</Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>Service List</Typography>
                {services.map(s => (
                    <Box key={s.id} sx={{ mb: 1, borderBottom: '1px solid #eee', pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">{s.name} ({s.code})</Typography>
                            <Button size="small" color="error" onClick={() => handleDeleteService(s.id)}>Delete</Button>
                        </Box>
                    </Box>
                ))}
            </Paper>
        </Box>
    );
}
