import React from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow, 
    Button, 
    Paper,
    TableContainer,
    TextField,
    Box,
    TableSortLabel,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    Checkbox,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export interface Column<T> {
    id: keyof T | string;
    label: string;
    render?: (row: T) => React.ReactNode;
    format?: (value: any) => string;
    align?: 'left' | 'right' | 'center';
    filterable?: boolean;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onDelete?: (id: number) => void;
    onEdit?: (item: T) => void;
}

export default function DataTable<T extends { id: number }>({ columns, data, onDelete, onEdit }: DataTableProps<T>) {
    const { t } = useTranslation();
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [orderBy, setOrderBy] = useState<keyof T | string>('');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    
    // Column Visibility & Order State
    const [columnOrder, setColumnOrder] = useState<string[]>(columns.map(c => String(c.id)));
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

    // Update columnOrder if columns prop changes (and no reorder happened yet/reset)
    // For simplicity, we only init once or if length changes drastically, but rigorous sync might overwrite user reorder.
    // Let's keep it simple: sync if strict length mismatch, otherwise trust state.
    React.useEffect(() => {
        if (columnOrder.length !== columns.length) {
             setColumnOrder(columns.map(c => String(c.id)));
        }
    }, [columns]);

    const handleFilterChange = (colId: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [colId]: value
        }));
    };

    const handleRequestSort = (property: keyof T | string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };



    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleToggleColumn = (columnId: string) => {
        setHiddenColumns(prev => {
            if (prev.includes(columnId)) {
                return prev.filter(id => id !== columnId);
            } else {
                return [...prev, columnId];
            }
        });
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedColumnId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedColumnId || draggedColumnId === targetId) return;

        const oldIndex = columnOrder.indexOf(draggedColumnId);
        const newIndex = columnOrder.indexOf(targetId);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = [...columnOrder];
            newOrder.splice(oldIndex, 1);
            newOrder.splice(newIndex, 0, draggedColumnId);
            setColumnOrder(newOrder);
        }
        setDraggedColumnId(null);
    };

    // Filter and Sort Columns for display
    const visibleColumnIds = columnOrder.filter(id => !hiddenColumns.includes(id));
    const orderedColumns = visibleColumnIds
        .map(id => columns.find(c => String(c.id) === id))
        .filter((c): c is Column<T> => !!c);

    // Filter data based on search inputs (existing logic)
    const filteredData = data.filter(row => {
        return orderedColumns.every(col => { // Use orderedColumns to only filter visible ones? Or all? Usually all is better, but maybe visible only is intuitive. Let's stick to 'columns' for filtering to avoid confusion if a column is hidden but filter remains.
             // Actually, the original logic used 'columns'. Let's keep using 'columns' for filtering so hidden columns can still filter if active.
             // BUT, if we want to filter only visible, we change to orderedColumns.
             // Let's keep existing logic safe: use 'columns'.
             if (!col.filterable || !filters[String(col.id)]) return true;
             const cellValue = (row as any)[col.id];
             const filterValue = filters[String(col.id)].toLowerCase();
             return String(cellValue).toLowerCase().includes(filterValue);
        });
    });

    const sortedData = [...filteredData].sort((a, b) => {
        if (!orderBy) return 0;
        
        const aValue = (a as any)[orderBy];
        const bValue = (b as any)[orderBy];

        if (bValue < aValue) {
            return order === 'asc' ? 1 : -1;
        }
        if (bValue > aValue) {
            return order === 'asc' ? -1 : 1;
        }
        return 0;
    });

    return (
        <React.Fragment>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Tooltip title={t('common.columns') || 'Colonnes'}>
                    <IconButton onClick={handleMenuOpen}>
                        <ViewColumnIcon />
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    {columns.map((col) => (
                        <MenuItem key={String(col.id)} onClick={() => handleToggleColumn(String(col.id))}>
                            <ListItemIcon>
                                <Checkbox checked={!hiddenColumns.includes(String(col.id))} edge="start" disableRipple />
                            </ListItemIcon>
                            <ListItemText primary={col.label} />
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {orderedColumns.map((col) => (
                                <TableCell 
                                    key={String(col.id)} 
                                    align={col.align || 'left'}
                                    sortDirection={orderBy === col.id ? order : false}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, String(col.id))}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, String(col.id))}
                                    sx={{ cursor: 'move', backgroundColor: draggedColumnId === String(col.id) ? '#f0f0f0' : 'inherit' }}
                                >
                                    {col.sortable ? (
                                        <TableSortLabel
                                            active={orderBy === col.id}
                                            direction={orderBy === col.id ? order : 'asc'}
                                            onClick={() => handleRequestSort(col.id)}
                                        >
                                            {col.label}
                                        </TableSortLabel>
                                    ) : (
                                        col.label
                                    )}
                                    {col.filterable && (
                                        <Box sx={{ mt: 1 }} onClick={(e) => e.stopPropagation()}>
                                            <TextField 
                                                size="small" 
                                                variant="standard"
                                                placeholder="..."
                                                value={filters[String(col.id)] || ''}
                                                onChange={(e) => handleFilterChange(String(col.id), e.target.value)}
                                                fullWidth
                                            />
                                        </Box>
                                    )}
                                </TableCell>
                            ))}
                            {(onDelete || onEdit) && <TableCell align="right">{t('common.actions')}</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedData.map((row) => (
                            <TableRow key={row.id}>
                                {orderedColumns.map((col) => (
                                    <TableCell key={String(col.id)} align={col.align || 'left'}>
                                        {col.render ? col.render(row) : (col.format ? col.format((row as any)[col.id]) : (row as any)[col.id])}
                                    </TableCell>
                                ))}
                                {(onDelete || onEdit) && (
                                    <TableCell align="right">
                                        {onEdit && (
                                            <Tooltip title={t('common.edit') || 'Modifier'}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onEdit(row)}
                                                    color="primary"
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {onDelete && (
                                            <Tooltip title={t('common.delete') || 'Supprimer'}>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => onDelete(row.id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={orderedColumns.length + ((onDelete || onEdit) ? 1 : 0)} align="center">
                                    <span style={{ color: '#999', fontStyle: 'italic' }}>{t('common.noData')}</span>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </React.Fragment>
    );
}
