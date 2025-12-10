import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchFilterBar from './SearchFilterBar';
import React from 'react';

// Mock translation hook
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'common.search': 'Rechercher',
                'common.filterByTags': 'Filtrer par tags',
                'common.tags': 'Tags',
            };
            return translations[key] || key;
        },
    }),
}));

describe('SearchFilterBar', () => {
    const mockOnSearchChange = vi.fn();
    const mockOnTagsChange = vi.fn();
    const allTags = [
        { id: 1, name: 'Tag 1' },
        { id: 2, name: 'Tag 2' },
    ];

    it('renders with initial values', () => {
        render(
            <SearchFilterBar
                searchText=""
                onSearchChange={mockOnSearchChange}
                selectedTags={[]}
                onTagsChange={mockOnTagsChange}
                allTags={allTags}
            />
        );

        expect(screen.getByPlaceholderText('Rechercher')).toBeInTheDocument();
        // Since Autocomplete renders a combobox, we can check for that
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('calls onSearchChange when typing', () => {
        render(
            <SearchFilterBar
                searchText=""
                onSearchChange={mockOnSearchChange}
                selectedTags={[]}
                onTagsChange={mockOnTagsChange}
                allTags={allTags}
            />
        );

        const input = screen.getByPlaceholderText('Rechercher');
        fireEvent.change(input, { target: { value: 'test' } });
        expect(mockOnSearchChange).toHaveBeenCalledWith('test');
    });

    it('displays selected tags', () => {
        render(
            <SearchFilterBar
                searchText=""
                onSearchChange={mockOnSearchChange}
                selectedTags={[allTags[0]]}
                onTagsChange={mockOnTagsChange}
                allTags={allTags}
            />
        );
        
        // Autocomplete chips usually have the label text
        expect(screen.getByText('Tag 1')).toBeInTheDocument();
    });
});
