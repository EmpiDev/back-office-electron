import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';

export default function UsersPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<any[]>([]);
    const [newUser, setNewUser] = useState({ username: '', password_hash: '123456', role: 'user' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const u = await window.electronApi.getUsers();
        setUsers(u);
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

    const columns: Column<any>[] = [
        { id: 'id', label: t('users.id') },
        { id: 'username', label: t('users.username') },
        { id: 'role', label: t('users.role') },
    ];

    return (
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>{t('users.title')}</Typography>
            <Button variant="contained" onClick={loadData} sx={{ mb: 4 }}>{t('common.refresh')}</Button>

            <Paper sx={{ p: 2, maxWidth: 800 }}>
                <Typography variant="h6">{t('users.addUser')}</Typography>
                <Box sx={{ mb: 2 }}>
                    <TextField 
                        size="small" 
                        label={t('users.username')} 
                        value={newUser.username} 
                        onChange={e => setNewUser({ ...newUser, username: e.target.value })} 
                        fullWidth 
                        sx={{ mb: 1 }} 
                    />
                    <Button variant="outlined" onClick={handleCreateUser}>{t('users.add')}</Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>{t('users.list')}</Typography>
                
                <DataTable 
                    columns={columns}
                    data={users}
                    onDelete={handleDeleteUser}
                />
            </Paper>
        </Box>
    );
}