import React from 'react';
import { Box, TextField, InputAdornment, Autocomplete } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

interface Tag {
    id?: number;
    name: string;
    color?: string;
}

interface SearchFilterBarProps {
    searchText: string;
    onSearchChange: (text: string) => void;
    selectedTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    allTags: Tag[];
    placeholder?: string;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
    searchText,
    onSearchChange,
    selectedTags,
    onTagsChange,
    allTags,
    placeholder
}) => {
    const { t } = useTranslation();

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
                placeholder={placeholder || t('common.search') || 'Rechercher'}
                size="small"
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                sx={{ flexGrow: 1, minWidth: '200px' }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                }}
            />
            <Autocomplete
                multiple
                limitTags={2}
                options={allTags}
                getOptionLabel={(option) => option.name}
                value={selectedTags}
                onChange={(_, newValue) => onTagsChange(newValue)}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        label={t('common.filterByTags') || 'Filtrer par tags'} 
                        placeholder={selectedTags.length === 0 ? (t('common.tags') || 'Tags') : ''}
                        size="small"
                    />
                )}
                sx={{ minWidth: '250px', flexGrow: 1 }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
            />
        </Box>
    );
};

export default SearchFilterBar;
