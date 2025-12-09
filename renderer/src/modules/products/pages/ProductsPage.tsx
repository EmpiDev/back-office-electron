import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';

export default function ProductsPage() {
    const { t } = useTranslation();
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

    const columns: Column<any>[] = [
        { id: 'code', label: t('common.code') },
        { id: 'name', label: t('common.name') },
        // { id: 'description', label: t('common.description') }, // Optional
    ];

    return (
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>{t('products.title')}</Typography>
            <Button variant="contained" onClick={loadData} sx={{ mb: 4 }}>{t('common.refresh')}</Button>

            <Paper sx={{ p: 2, maxWidth: 800 }}>
                <Typography variant="h6">{t('products.addProduct')}</Typography>
                <Box sx={{ mb: 2 }}>
                    <TextField 
                        size="small" 
                        label={t('common.code')} 
                        value={newProduct.code} 
                        onChange={e => setNewProduct({ ...newProduct, code: e.target.value })} 
                        fullWidth 
                        sx={{ mb: 1 }} 
                    />
                    <TextField 
                        size="small" 
                        label={t('common.name')} 
                        value={newProduct.name} 
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} 
                        fullWidth 
                        sx={{ mb: 1 }} 
                    />
                    <Button variant="outlined" onClick={handleCreateProduct}>{t('products.add')}</Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>{t('products.list')}</Typography>

                <DataTable 
                    columns={columns}
                    data={products}
                    onDelete={handleDeleteProduct}
                />
            </Paper>
        </Box>
    );
}