import { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, Box, Grid, TextField, 
    FormControl, InputLabel, Select, MenuItem, DialogActions, Button 
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface UserFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (userData: any) => Promise<void>;
    initialData?: any;
}

export default function UserFormDialog({ 
    open, 
    onClose, 
    onSave, 
    initialData
}: UserFormDialogProps) {
    const { t } = useTranslation();
    const [user, setUser] = useState({ username: '', password_hash: '123456', role: 'user' });

    useEffect(() => {
        if (open) {
            if (initialData) {
                setUser({
                    username: initialData.username,
                    password_hash: '', // Security: don't show hash or default
                    role: initialData.role
                });
            } else {
                setUser({ username: '', password_hash: '123456', role: 'user' });
            }
        }
    }, [open, initialData]);

    const handleSave = () => {
        onSave(user);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? t('common.edit') : t('users.addUser')}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField 
                                label={t('users.username')} 
                                value={user.username} 
                                onChange={e => setUser({ ...user, username: e.target.value })} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel id="role-select-label">{t('users.role')}</InputLabel>
                                <Select
                                    labelId="role-select-label"
                                    value={user.role}
                                    label={t('users.role')}
                                    onChange={e => setUser({ ...user, role: e.target.value })}
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
                <Button onClick={onClose}>Annuler</Button>
                <Button variant="contained" onClick={handleSave}>{initialData ? t('common.save') : t('users.add')}</Button>
            </DialogActions>
        </Dialog>
    );
}
