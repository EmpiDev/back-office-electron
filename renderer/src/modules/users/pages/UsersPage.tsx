import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, InputAdornment } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';
import { useUsers } from '../hooks/useUsers';
import UserFormDialog from '../components/UserFormDialog';

export default function UsersPage() {
    const { t } = useTranslation();
    const { 
        users, loading, 
        loadData, deleteUser, saveUser 
    } = useUsers();

    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenCreateDialog = () => {
        setEditingUser(null);
        setOpenDialog(true);
    };

    const handleEditUser = (user: any) => {
        setEditingUser(user);
        setOpenDialog(true);
    };

    const handleSave = async (userData: any) => {
        try {
            await saveUser(userData, editingUser?.id || null);
            setOpenDialog(false);
        } catch (error) {
            console.error(error);
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
                    onDelete={deleteUser}
                    onEdit={handleEditUser}
                />
            </Paper>

             <UserFormDialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)} 
                onSave={handleSave}
                initialData={editingUser}
            />
        </Box>
    );
}