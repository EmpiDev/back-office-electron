import { useState, useCallback } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

export const useTags = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await window.electronApi.getTags();
            if (res.success) setTags(res.data);
            else showNotification(res.error || 'Failed to load tags', res.code);
        } catch (error) {
            console.error(error);
            showNotification('Error loading tags', 500);
        } finally {
            setLoading(false);
        }
    }, [t, showNotification]);

    const deleteTag = async (id: number) => {
        const res = await window.electronApi.deleteTag(id);
        if (res.success) {
            showNotification('Tag deleted', res.code);
            loadData();
        } else {
            showNotification(res.error || 'Failed to delete tag', res.code);
        }
    };

    const saveTag = async (tagData: any, editingId: number | null) => {
        let res;
        if (editingId) {
            res = await window.electronApi.updateTag(editingId, tagData);
        } else {
            res = await window.electronApi.createTag(tagData);
        }

        if (res.success) {
            showNotification(editingId ? 'Tag updated' : 'Tag created', res.code);
            loadData();
        } else {
            showNotification(res.error || 'Failed to save tag', res.code);
            throw new Error(res.error);
        }
    };

    return {
        tags,
        loading,
        loadData,
        deleteTag,
        saveTag
    };
};
