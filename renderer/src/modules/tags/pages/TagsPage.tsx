import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, InputAdornment } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';
import { useTags } from '../hooks/useTags';
import TagFormDialog from '../components/TagFormDialog';

export default function TagsPage() {
    const { t } = useTranslation();
    const { 
        tags, loading, 
        loadData, deleteTag, saveTag 
    } = useTags();

    const [openDialog, setOpenDialog] = useState(false);
    const [editingTag, setEditingTag] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenCreateDialog = () => {
        setEditingTag(null);
        setOpenDialog(true);
    };

    const handleEditTag = (tag: any) => {
        setEditingTag(tag);
        setOpenDialog(true);
    };

    const handleSave = async (tagData: any) => {
        try {
            await saveTag(tagData, editingTag?.id || null);
            setOpenDialog(false);
        } catch (error) {
            console.error(error);
        }
    };

    const columns: Column<any>[] = [
        { id: 'name', label: t('tags.nameLabel'), sortable: true },
    ];

    const filteredTags = tags.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('tags.title')}</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={handleOpenCreateDialog}
                >
                    {t('tags.addTag')}
                </Button>
            </Box>

            <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder={t('tags.searchPlaceholder')} 
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <DataTable 
                    columns={columns}
                    data={filteredTags}
                    onDelete={deleteTag}
                    onEdit={handleEditTag}
                />
            </Paper>

            <TagFormDialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)} 
                onSave={handleSave}
                initialData={editingTag}
            />
        </Box>
    );
}
