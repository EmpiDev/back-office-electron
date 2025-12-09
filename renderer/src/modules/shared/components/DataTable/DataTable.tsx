import React from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow, 
    Button, 
    Paper,
    TableContainer
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface Column<T> {
    id: keyof T | string;
    label: string;
    render?: (row: T) => React.ReactNode;
    align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onDelete?: (id: number) => void;
    onEdit?: (item: T) => void;
}

export default function DataTable<T extends { id: number }>({ columns, data, onDelete, onEdit }: DataTableProps<T>) {
    const { t } = useTranslation();

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {columns.map((col) => (
                            <TableCell key={String(col.id)} align={col.align || 'left'}>
                                {col.label}
                            </TableCell>
                        ))}
                        {(onDelete || onEdit) && <TableCell align="right">{t('common.actions')}</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
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
