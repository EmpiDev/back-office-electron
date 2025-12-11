import { useState, useCallback } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

export const useCategories = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await window.electronApi.getCategories();
            if (res.success) {
                setCategories(res.data);
            } else {
                showNotification(res.error || t('categories.messages.loadError'), res.code);
            }
        } catch (error) {
            console.error(error);
            showNotification('Error loading categories', 500);
        } finally {
            setLoading(false);
        }
    }, [t, showNotification]);

    const deleteCategory = async (id: number) => {
        const res = await window.electronApi.deleteCategory(id);
        if (res.success) {
            showNotification(t('categories.messages.deleted'), res.code);
            loadData();
        } else {
            showNotification(res.error || t('categories.messages.deleteError'), res.code);
        }
    };

    const saveCategory = async (categoryData: any, editingId: number | null) => {
        let res;
        if (editingId) {
            res = await window.electronApi.updateCategory(editingId, categoryData);
        } else {
            res = await window.electronApi.createCategory(categoryData);
        }

        if (res.success) {
            showNotification(editingId ? t('categories.messages.updated') : t('categories.messages.created'), res.code);
            loadData();
        } else {
            showNotification(res.error || t('categories.messages.saveError'), res.code);
            throw new Error(res.error);
        }
    };

    return {
        categories,
        loading,
        loadData,
        deleteCategory,
        saveCategory
    };
};
