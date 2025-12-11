import { useState, useCallback } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { Tag } from '../../../types/electron-api';

const CAROUSEL_LIMIT = 5;

export const useShowcase = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    
    const [products, setProducts] = useState<any[]>([]);
    const [allTags, setAllTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const prodRes = await window.electronApi.getProducts();
            if (!prodRes.success) { showNotification(prodRes.error || 'Failed to load', prodRes.code); return; }
            const p = prodRes.data;
            
            const tagsRes = await window.electronApi.getTags();
            const tags = tagsRes.success ? tagsRes.data : [];
            setAllTags(tags);

            const productsWithTags = await Promise.all(p.map(async (product: any) => {
                 const productTagsRes = await window.electronApi.getTagsForProduct(product.id);
                 return { ...product, tags: productTagsRes.success ? productTagsRes.data : [] };
            }));

            setProducts(productsWithTags);
        } catch (error) {
            console.error(error);
            showNotification('Error loading showcase', 500);
        } finally {
            setLoading(false);
        }
    }, [t, showNotification]);

    const toggleCarousel = async (product: any) => {
        if (!product.is_in_carousel) {
             const currentCount = products.filter(p => p.is_in_carousel).length;
             if (currentCount >= CAROUSEL_LIMIT) {
                 alert(t('showcase.carouselLimitReached', { limit: CAROUSEL_LIMIT }) || `Limite de ${CAROUSEL_LIMIT} produits atteinte pour le carrousel.`);
                 return;
             }
        }
        const updatedProduct = { ...product, is_in_carousel: !product.is_in_carousel };
        const res = await window.electronApi.updateProduct(product.id, updatedProduct);
        if (res.success) {
            loadData();
        } else {
            showNotification(res.error || 'Failed', res.code);
        }
    };

    const toggleTopProduct = async (product: any) => {
        const updatedProduct = { ...product, is_top_product: !product.is_top_product };
        const res = await window.electronApi.updateProduct(product.id, updatedProduct);
        if (res.success) loadData();
        else showNotification(res.error || 'Failed', res.code);
    };

    return {
        products,
        allTags,
        loading,
        loadData,
        toggleCarousel,
        toggleTopProduct
    };
};
