import { useEffect, useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { Box, Typography, Button, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid, InputAdornment, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';

export default function UsersPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password_hash: '123456', role: 'user' });
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);


    const { showNotification } = useNotification();

    const loadData = async () => {
        const res = await window.electronApi.getUsers();
        if (res.success) setUsers(res.data);
        else showNotification(res.error || 'Failed to load users', res.code);
    };

    const handleOpenCreateDialog = () => {
        setEditingUserId(null);
        setNewUser({ username: '', password_hash: '123456', role: 'user' });
        setOpenDialog(true);
    };

    const handleEditUser = (user: any) => {
        setEditingUserId(user.id);
        setNewUser({
            username: user.username,
            password_hash: '', // Do not populate password hash for security
            role: user.role
        });
        setOpenDialog(true);
    };

    const handleSaveUser = async () => {
        let res;
        if (editingUserId) {
             // If password is empty, maybe don't update it?
             // The backend logic for updateUser currently ignores password updates (see previous context)
             // But let's send what we have.
            res = await window.electronApi.updateUser(editingUserId, newUser);
        } else {
            res = await window.electronApi.createUser(newUser);
        }

        if (!res.success) {
            showNotification(res.error || 'Failed to save user', res.code);
            return;
        }

        showNotification(editingUserId ? 'User updated' : 'User created', res.code);
        setNewUser({ username: '', password_hash: '123456', role: 'user' });
        setEditingUserId(null);
        setOpenDialog(false);
        loadData();
    };

    const handleDeleteUser = async (id: number) => {
        const res = await window.electronApi.deleteUser(id);
        if (res.success) {
             showNotification('User deleted', res.code);
             loadData();
        } else {
             showNotification(res.error || 'Failed to delete', res.code);
        }
    };

    const columns: Column<any>[] = [
        { id: 'id', label: t('users.id'), sortable: true },
        { id: 'username', label: t('users.username'), sortable: true },
        { id: 'role', label: t('users.role'), sortable: true },
    ];

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('users.title')}</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={handleOpenCreateDialog}
                >
                    {t('users.addUser')}
                </Button>
            </Box>

             <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="Rechercher un utilisateur..." 
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
                    data={filteredUsers}
                    onDelete={handleDeleteUser}
                    onEdit={handleEditUser}
                />
            </Paper>

             <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUserId ? t('common.edit') : t('users.addUser')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField 
                                    label={t('users.username')} 
                                    value={newUser.username} 
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })} 
                                    fullWidth 
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="role-select-label">{t('users.role')}</InputLabel>
                                    <Select
                                        labelId="role-select-label"
                                        value={newUser.role}
                                        label={t('users.role')}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <MenuItem value="admin">Admin</MenuItem>
                                        <MenuItem value="user">User</MenuItem>
                                        <MenuItem value="viewer">Viewer</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button variant="contained" onClick={handleSaveUser}>{editingUserId ? t('common.save') : t('users.add')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}