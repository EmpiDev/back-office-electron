import { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid, InputAdornment } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/modules/shared/components/DataTable/DataTable';

export default function TagsPage() {
    const { t } = useTranslation();
    const [tags, setTags] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newTag, setNewTag] = useState({ name: '' });
    const [editingTagId, setEditingTagId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const t = await window.electronApi.getTags();
        setTags(t);
    };

    const handleOpenCreateDialog = () => {
        setEditingTagId(null);
        setNewTag({ name: '' });
        setOpenDialog(true);
    };

    const handleEditTag = (tag: any) => {
        setEditingTagId(tag.id);
        setNewTag({ name: tag.name });
        setOpenDialog(true);
    };

    const handleSaveTag = async () => {
        if (editingTagId) {
            await window.electronApi.updateTag(editingTagId, newTag);
        } else {
            await window.electronApi.createTag(newTag);
        }
        setNewTag({ name: '' });
        setEditingTagId(null);
        setOpenDialog(false);
        loadData();
    };

    const handleDeleteTag = async (id: number) => {
        await window.electronApi.deleteTag(id);
        loadData();
    };

    const columns: Column<any>[] = [
        { id: 'name', label: t('tags.nameLabel') },
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
                    onDelete={handleDeleteTag}
                    onEdit={handleEditTag}
                />
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingTagId ? t('tags.editTag') : t('tags.addTag')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField 
                                    label={t('tags.nameLabel')} 
                                    value={newTag.name} 
                                    onChange={e => setNewTag({ ...newTag, name: e.target.value })} 
                                    fullWidth 
                                    autoFocus
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialog(false)}>{t('common.cancel')}</Button>
                    <Button variant="contained" onClick={handleSaveTag}>
                        {editingTagId ? t('common.save') : t('tags.add')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
