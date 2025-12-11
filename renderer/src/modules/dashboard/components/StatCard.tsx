import { ReactNode } from 'react';
import { Paper, Box, Typography } from '@mui/material';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    color: string;
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <Paper
            sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 3,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px 0 rgba(0,0,0,0.1)',
                }
            }}
        >
            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    {title.toUpperCase()}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {value}
                </Typography>
            </Box>
            <Box
                sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: color
                }}
            >
                {icon}
            </Box>
        </Paper>
    );
}
