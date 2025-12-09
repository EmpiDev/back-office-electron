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
    Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export interface Column<T> {
    id: keyof T | string;
    label: string;
    render?: (row: T) => React.ReactNode;
    align?: 'left' | 'right' | 'center';
    filterable?: boolean;
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

    const handleFilterChange = (colId: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [colId]: value
        }));
    };

    const filteredData = data.filter(row => {
        return columns.every(col => {
            if (!col.filterable || !filters[String(col.id)]) return true;
            const cellValue = (row as any)[col.id];
            const filterValue = filters[String(col.id)].toLowerCase();
            return String(cellValue).toLowerCase().includes(filterValue);
        });
    });

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {columns.map((col) => (
                            <TableCell key={String(col.id)} align={col.align || 'left'}>
                                {col.label}
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
                    {filteredData.map((row) => (
                        <TableRow key={row.id}>
                            {columns.map((col) => (
                                <TableCell key={String(col.id)} align={col.align || 'left'}>
                                    {col.render ? col.render(row) : (row as any)[col.id]}
                                </TableCell>
                            ))}
                            {(onDelete || onEdit) && (
                                <TableCell align="right">
                                    {onEdit && (
                                        <Button
                                            size="small"
                                            color="primary"
                                            onClick={() => onEdit(row)}
                                            sx={{ mr: 1 }}
                                        >
                                            {t('common.edit') || 'Modifier'}
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button 
                                            size="small" 
                                            color="error" 
                                            onClick={() => onDelete(row.id)}
                                        >
                                            {t('common.delete')}
                                        </Button>
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
