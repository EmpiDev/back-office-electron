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
    Tooltip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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

    const filteredData = data.filter(row => {
        return columns.every(col => {
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
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {columns.map((col) => (
                            <TableCell 
                                key={String(col.id)} 
                                align={col.align || 'left'}
                                sortDirection={orderBy === col.id ? order : false}
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
                            {columns.map((col) => (
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
                            <TableCell colSpan={columns.length + ((onDelete || onEdit) ? 1 : 0)} align="center">
                                <span style={{ color: '#999', fontStyle: 'italic' }}>{t('common.noData')}</span>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
