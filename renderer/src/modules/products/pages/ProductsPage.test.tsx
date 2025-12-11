import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductsPage from './ProductsPage';
import React from 'react';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'products.title': 'Produits',
                'products.addProduct': 'Ajouter Produit',
                'common.name': 'Nom',
                'common.search': 'Rechercher',
            };
            return translations[key] || key;
        },
    }),
}));

// Mock Notification Context
const mockShowNotification = vi.fn();
vi.mock('../../../contexts/NotificationContext', () => ({
    useNotification: () => ({
        showNotification: mockShowNotification,
    }),
}));

// Mock child components if needed, but for integration we keep them to see if they render.
// However, if they are complex, we might shallow render them. 
// For now, let's keep them real, but we must insure SearchFilterBar doesn't break.

// Mock window.electronApi
const mockGetProducts = vi.fn();
const mockGetTagsForProduct = vi.fn();
const mockGetServices = vi.fn();
const mockGetTags = vi.fn();



describe('ProductsPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        window.electronApi = {
            getProducts: mockGetProducts,
            getTagsForProduct: mockGetTagsForProduct,
            getServices: mockGetServices,
            getTags: mockGetTags,
        } as unknown as ElectronApi;
    });

    it('renders the page and loads products', async () => {
        const products = [
            { id: 1, name: 'Product A', price: 10, payment_type: 'one_time' },
            { id: 2, name: 'Product B', price: 20, payment_type: 'monthly' },
        ];
        
        mockGetProducts.mockResolvedValue({ success: true, code: 200, data: products });
        mockGetTagsForProduct.mockResolvedValue({ success: true, code: 200, data: [] });
        mockGetServices.mockResolvedValue({ success: true, code: 200, data: [] });
        mockGetTags.mockResolvedValue({ success: true, code: 200, data: [] });

        render(<ProductsPage />);

        // Check title
        expect(screen.getByText('Produits')).toBeInTheDocument();
        
        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText('Product A')).toBeInTheDocument();
            expect(screen.getByText('Product B')).toBeInTheDocument();
        });
        
        // Check if add button is there
        expect(screen.getByText('Ajouter Produit')).toBeInTheDocument();
    });
});
