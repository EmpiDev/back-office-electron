import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Divider } from '@mui/material';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [newProduct, setNewProduct] = useState({ code: '', name: '', description: '', target_segment: '', is_highlighted: false });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const p = await window.electronApi.getProducts();
        setProducts(p);
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
            <Typography variant="h4" gutterBottom>Products Management</Typography>
            <Button variant="contained" onClick={loadData} sx={{ mb: 4 }}>Refresh</Button>

            <Paper sx={{ p: 2, maxWidth: 600 }}>
                <Typography variant="h6">Add Product</Typography>
                <Box sx={{ mb: 2 }}>
                    <TextField 
                        size="small" 
                        label="Code" 
                        value={newProduct.code} 
                        onChange={e => setNewProduct({ ...newProduct, code: e.target.value })} 
                        fullWidth 
                        sx={{ mb: 1 }} 
                    />
                    <TextField 
                        size="small" 
                        label="Name" 
                        value={newProduct.name} 
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} 
                        fullWidth 
                        sx={{ mb: 1 }} 
                    />
                    <Button variant="outlined" onClick={handleCreateProduct}>Add Product</Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>Product List</Typography>
                {products.map(p => (
                    <Box key={p.id} sx={{ mb: 1, borderBottom: '1px solid #eee', pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">{p.name} ({p.code})</Typography>
                            <Button size="small" color="error" onClick={() => handleDeleteProduct(p.id)}>Delete</Button>
                        </Box>
                    </Box>
                ))}
            </Paper>
        </Box>
    );
}
