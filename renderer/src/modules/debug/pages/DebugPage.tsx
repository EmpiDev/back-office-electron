import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Grid, Divider } from '@mui/material';

export default function DebugPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const [newUser, setNewUser] = useState({ username: '', password_hash: '123456', role: 'user' });
    const [newService, setNewService] = useState({ code: '', name: '', description: '', category_id: null });
    const [newProduct, setNewProduct] = useState({ code: '', name: '', description: '', target_segment: '', is_highlighted: false });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const u = await window.electronApi.getUsers();
        setUsers(u);
        const s = await window.electronApi.getServices();
        setServices(s);
        const p = await window.electronApi.getProducts();
        setProducts(p);
    };

    const handleCreateUser = async () => {
        await window.electronApi.createUser(newUser);
        setNewUser({ ...newUser, username: '' });
        loadData();
    };

    const handleDeleteUser = async (id: number) => {
        await window.electronApi.deleteUser(id);
        loadData();
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

    const handleCreateProduct = async () => {
        await window.electronApi.createProduct(newProduct);
        setNewProduct({ ...newProduct, code: '', name: '' });
        loadData();
    };

    const handleDeleteProduct = async (id: number) => {
        await window.electronApi.deleteProduct(id);
        loadData();
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>Debug / Test CRUD</Typography>
            <Button variant="contained" onClick={loadData} sx={{ mb: 4 }}>Refresh All</Button>

            <Grid container spacing={4}>
                {/* Users */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Users</Typography>
                        <Box sx={{ mb: 2 }}>
                            <TextField size="small" label="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} fullWidth sx={{ mb: 1 }} />
                            <Button variant="outlined" onClick={handleCreateUser}>Add User</Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {users.map(u => (
                            <Box key={u.id} sx={{ mb: 1, borderBottom: '1px solid #eee' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle2">{u.username} ({u.role})</Typography>
                                    <Button size="small" color="error" onClick={() => handleDeleteUser(u.id)}>✖</Button>
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                {/* Services */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Services</Typography>
                        <Box sx={{ mb: 2 }}>
                            <TextField size="small" label="Code" value={newService.code} onChange={e => setNewService({ ...newService, code: e.target.value })} fullWidth sx={{ mb: 1 }} />
                            <TextField size="small" label="Name" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} fullWidth sx={{ mb: 1 }} />
                            <Button variant="outlined" onClick={handleCreateService}>Add Service</Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {services.map(s => (
                            <Box key={s.id} sx={{ mb: 1, borderBottom: '1px solid #eee' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle2">{s.name} ({s.code})</Typography>
                                    <Button size="small" color="error" onClick={() => handleDeleteService(s.id)}>✖</Button>
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                {/* Products */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Products</Typography>
                        <Box sx={{ mb: 2 }}>
                            <TextField size="small" label="Code" value={newProduct.code} onChange={e => setNewProduct({ ...newProduct, code: e.target.value })} fullWidth sx={{ mb: 1 }} />
                            <TextField size="small" label="Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} fullWidth sx={{ mb: 1 }} />
                            <Button variant="outlined" onClick={handleCreateProduct}>Add Product</Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {products.map(p => (
                            <Box key={p.id} sx={{ mb: 1, borderBottom: '1px solid #eee' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle2">{p.name} ({p.code})</Typography>
                                    <Button size="small" color="error" onClick={() => handleDeleteProduct(p.id)}>✖</Button>
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
