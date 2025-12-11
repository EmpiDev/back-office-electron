import { Paper, Typography, Box } from '@mui/material';

interface RecentProductsProps {
    products: any[];
}

export default function RecentProducts({ products }: RecentProductsProps) {
    return (
        <Paper sx={{ p: 3, borderRadius: 3, minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>Derniers produits ajoutés</Typography>
            <Box sx={{ mt: 2 }}>
                {!Array.isArray(products) || products.length === 0 ? (
                    <Typography color="text.secondary">Aucun produit récent.</Typography>
                ) : (
                    products.map((product) => (
                        <Box key={product.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" fontWeight="bold">{product.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Ajouté le {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                                </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="bold">
                                {product.price ? `${product.price} €` : 'N/A'}
                            </Typography>
                        </Box>
                    ))
                )}
            </Box>
        </Paper>
    );
}
