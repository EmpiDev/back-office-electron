import { useState, useCallback } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { Tag } from '../../../types/electron-api';

export const useProducts = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    
    const [products, setProducts] = useState<any[]>([]);
    const [allServices, setAllServices] = useState<any[]>([]);
    const [allTags, setAllTags] = useState<any[]>([]);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const productsRes = await window.electronApi.getProducts();
            if (!productsRes.success) {
                showNotification(productsRes.error || t('products.messages.loadError'), productsRes.code);
                return;
            }
            
            // Enrich products with tags and categories
            const productsWithDetails = await Promise.all(productsRes.data.map(async (product: any) => {
                const [tagsRes, servicesRes] = await Promise.all([
                    window.electronApi.getTagsForProduct(product.id),
                    window.electronApi.getServicesForProduct(product.id)
                ]);

                const tags = tagsRes.success ? tagsRes.data : [];
                const services = servicesRes.success ? servicesRes.data : [];
                
                // Extract categories from services
                const productCategories = new Map();
                services.forEach((s: any) => {
                    if (s.category_id && s.category_name) {
                        productCategories.set(s.category_id, { id: s.category_id, name: s.category_name });
                    }
                });
                
                return { 
                    ...product, 
                    tags,
                    categories: Array.from(productCategories.values()),
                    services // Include raw services data for editing
                };
            }));

            setProducts(productsWithDetails);
            
            // Load types for dropdowns
            const sRes = await window.electronApi.getServices();
            if (sRes.success) setAllServices(sRes.data);
            
            const tagsRes = await window.electronApi.getTags();
            if (tagsRes.success) setAllTags(tagsRes.data);

            const catRes = await window.electronApi.getCategories();
            if (catRes.success) setAllCategories(catRes.data);

        } catch (error) {
            console.error(error);
            showNotification('Error loading data', 500);
        } finally {
            setLoading(false);
        }
    }, [t, showNotification]);

    const deleteProduct = async (id: number) => {
        const res = await window.electronApi.deleteProduct(id);
        if (res.success) {
            showNotification(t('products.messages.deleted'), res.code);
            loadData();
        } else {
            showNotification(res.error || t('products.messages.deleteError'), res.code);
        }
    };

    const toggleTopProduct = async (product: any) => {
        const updatedProduct = { 
            ...product, 
            is_top_product: !product.is_top_product 
        };
        const res = await window.electronApi.updateProduct(product.id, updatedProduct);
        if (res.success) loadData();
        else showNotification(res.error || t('products.messages.updateError'), res.code);
    };

    const saveProduct = async (
        productData: any, 
        selectedServices: Array<{ serviceId: number; quantity: number }>, 
        selectedTags: number[],
        editingId: number | null
    ) => {
        let savedProduct;
        let res;

        if (editingId) {
             res = await window.electronApi.updateProduct(editingId, productData);
             if (!res.success) {
                 showNotification(res.error || 'Erreur inconnue', res.code);
                 throw new Error(res.error);
             }
             savedProduct = res.data;

             // Manage Services
             const currentServicesRes = await window.electronApi.getServicesForProduct(editingId);
             const currentServices = currentServicesRes.success ? currentServicesRes.data : [];
             
             // Remove unselected
             for(const s of currentServices) {
                 if(!selectedServices.find(newS => newS.serviceId === s.service_id)) {
                     await window.electronApi.removeServiceFromProduct(editingId, s.service_id);
                 }
             }

             // Manage Tags
             const currentTagsRes = await window.electronApi.getTagsForProduct(editingId);
             const currentTags = currentTagsRes.success ? currentTagsRes.data : [];
             
             for (const tag of currentTags) {
                 if (tag.id && !selectedTags.includes(tag.id)) {
                     await window.electronApi.removeTagFromProduct(editingId, tag.id);
                 }
             }
             
             for (const tagId of selectedTags) {
                 if (!currentTags.find((t: any) => t.id === tagId)) {
                     await window.electronApi.addTagToProduct(editingId, tagId);
                 }
             }
        } else {
             res = await window.electronApi.createProduct(productData);
             if (!res.success) {
                 showNotification(res.error || 'Erreur inconnue', res.code);
                 throw new Error(res.error);
             }
             savedProduct = res.data;
             
             if(savedProduct && savedProduct.id) {
                 for (const tagId of selectedTags) {
                    await window.electronApi.addTagToProduct(savedProduct.id, tagId);
                }
             }
        }

        const productId = savedProduct ? savedProduct.id : editingId;
        if (productId) {
            // Update/Add services
            // Note: addServiceToProduct should handle updates if possible, or we might need logic to checking before adding.
            // Simplified: loop and add/update
            for (const selectedService of selectedServices) {
                await window.electronApi.addServiceToProduct(productId, selectedService.serviceId, selectedService.quantity);
            }
        }

        showNotification(editingId ? t('products.messages.updated') : t('products.messages.created'), res.code);
        loadData();
    };

    return {
        products,
        allServices,
        allTags,
        allCategories,
        loading,
        loadData,
        deleteProduct,
        toggleTopProduct,
        saveProduct
    };
};
