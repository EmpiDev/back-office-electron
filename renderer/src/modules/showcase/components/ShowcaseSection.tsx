import { Paper, Box, Typography, Card, FormControlLabel, Switch } from '@mui/material';

interface ShowcaseSectionProps {
    title: string;
    icon?: React.ReactNode;
    products: any[];
    onToggle: (product: any) => void;
    toggleProp: 'is_in_carousel' | 'is_top_product'; // Which property matches the switch?
    color?: string; // Background color
    limit?: number;
    emptyMessage?: string;
    switchColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
}

export function ShowcaseSection({ 
    title, icon, products, onToggle, toggleProp, color = '#f5f5f5', 
    limit, emptyMessage, switchColor = 'primary' 
}: ShowcaseSectionProps) {

    return (
        <Paper sx={{ p: 2, borderRadius: 2, height: '100%', bgcolor: color }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {icon && <Box sx={{ mr: 1, display: 'flex' }}>{icon}</Box>}
                    <Typography variant="h6">{title}</Typography>
                </Box>
                {limit && (
                    <Typography variant="subtitle2" color={products.length >= limit ? 'error' : 'text.secondary'}>
                        {products.length} / {limit}
                    </Typography>
                )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {products.length === 0 && <Typography variant="body2" color="text.secondary">{emptyMessage || 'Aucun produit.'}</Typography>}
                {products.map(product => (
                    <Card key={product.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                        <Box sx={{ px: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">{product.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{product.price} €</Typography>
                        </Box>
                        <FormControlLabel
                            control={<Switch checked={!!product[toggleProp]} onChange={() => onToggle(product)} color={switchColor} />}
                            label=""
                        />
                    </Card>
                ))}
            </Box>
        </Paper>
    );
}
