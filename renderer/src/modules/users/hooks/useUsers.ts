import { useState, useCallback } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

export const useUsers = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await window.electronApi.getUsers();
            if (res.success) {
                setUsers(res.data);
            } else {
                showNotification(res.error || 'Failed to load users', res.code);
            }
        } catch (error) {
            console.error(error);
            showNotification('Error loading users', 500);
        } finally {
            setLoading(false);
        }
    }, [t, showNotification]);

    const deleteUser = async (id: number) => {
        const res = await window.electronApi.deleteUser(id);
        if (res.success) {
            showNotification('User deleted', res.code);
            loadData();
        } else {
            showNotification(res.error || 'Failed to delete', res.code);
        }
    };

    const saveUser = async (userData: any, editingId: number | null) => {
        let res;
        if (editingId) {
            res = await window.electronApi.updateUser(editingId, userData);
        } else {
            res = await window.electronApi.createUser(userData);
        }

        if (!res.success) {
            showNotification(res.error || 'Failed to save user', res.code);
            throw new Error(res.error);
        }

        showNotification(editingId ? 'User updated' : 'User created', res.code);
        loadData();
    };

    return {
        users,
        loading,
        loadData,
        deleteUser,
        saveUser
    };
};
