import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

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

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>{t('users.title')}</Typography>
            <Button variant="contained" onClick={loadData} sx={{ mb: 4 }}>{t('common.refresh')}</Button>

            <Paper sx={{ p: 2, maxWidth: 600 }}>
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
                {users.map(u => (
                    <Box key={u.id} sx={{ mb: 1, borderBottom: '1px solid #eee', pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">{u.username} ({u.role})</Typography>
                            <Button size="small" color="error" onClick={() => handleDeleteUser(u.id)}>{t('common.delete')}</Button>
                        </Box>
                    </Box>
                ))}
            </Paper>
        </Box>
    );
}