import { useState, useCallback } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

export const useServices = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    
    const [services, setServices] = useState<any[]>([]);
    const [allTags, setAllTags] = useState<any[]>([]);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await window.electronApi.getServices();
            if (!response.success) {
                 showNotification(response.error || t('services.messages.loadError'), response.code);
                 return;
            }
            
            // Enrich services with tags
            const servicesWithTags = await Promise.all(response.data.map(async (service: any) => {
                const tagsRes = await window.electronApi.getTagsForService(service.id);
                const tags = tagsRes.success ? tagsRes.data : [];
                return { ...service, tags };
            })); // Fix: correctly map and wait for all

            setServices(servicesWithTags);

            const tagsResponse = await window.electronApi.getTags();
            if (tagsResponse.success) setAllTags(tagsResponse.data);

            const categoriesResponse = await window.electronApi.getCategories();
            if (categoriesResponse.success) setAllCategories(categoriesResponse.data);

        } catch (error) {
            console.error(error);
            showNotification('Error loading data', 500);
        } finally {
            setLoading(false);
        }
    }, [t, showNotification]);

    const deleteService = async (id: number) => {
        const res = await window.electronApi.deleteService(id);
        if (res.success) {
            showNotification(t('services.messages.deleted'), res.code);
            loadData();
        } else {
            showNotification(res.error || t('services.messages.deleteError'), res.code);
        }
    };

    const saveService = async (serviceData: any, selectedTags: number[], editingId: number | null) => {
        let savedService;
        let result;

        if (editingId) {
            result = await window.electronApi.updateService(editingId, serviceData);
            if (!result.success) {
                showNotification(result.error || 'Erreur inconnue', result.code);
                throw new Error(result.error);
            }
            savedService = result.data;
            
            const currentTagsRes = await window.electronApi.getTagsForService(editingId);
            const currentTags = currentTagsRes.success ? currentTagsRes.data : [];
            
            for (const tag of currentTags) {
                if (tag.id && !selectedTags.includes(tag.id)) {
                    await window.electronApi.removeTagFromService(editingId, tag.id);
                }
            }
            
            for (const tagId of selectedTags) {
                if (!currentTags.find((t: any) => t.id === tagId)) {
                    await window.electronApi.addTagToService(editingId, tagId);
                }
            }
        } else {
            result = await window.electronApi.createService(serviceData);
            if (!result.success)  {
                showNotification(result.error || 'Erreur inconnue', result.code);
                throw new Error(result.error);
            }
            savedService = result.data;
            
            if (savedService && savedService.id) {
                for (const tagId of selectedTags) {
                    await window.electronApi.addTagToService(savedService.id, tagId);
                }
            }
        }
        
        showNotification(editingId ? t('services.messages.updated') : t('services.messages.created'), result.code);
        loadData();
    };

    return {
        services,
        allTags,
        allCategories,
        loading,
        loadData,
        deleteService,
        saveService
    };
};
