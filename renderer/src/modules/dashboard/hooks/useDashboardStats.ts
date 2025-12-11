import { useState, useEffect } from 'react';

export interface DashboardStats {
    totalProducts: number;
    totalUsers: number;
    totalServices: number;
    recentProducts: any[];
}

export const useDashboardStats = () => {
    const [statsData, setStatsData] = useState<DashboardStats>({
        totalProducts: 0,
        totalUsers: 0,
        totalServices: 0,
        recentProducts: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                // @ts-ignore
                const res = await window.electronApi.getDashboardStats();
                if (res.success && res.data) {
                    setStatsData(res.data);
                } else {
                    console.error("Dashboard error:", res.error);
                    setError(res.error || "Failed to load stats");
                }
            } catch (err) {
                console.error("Failed to load dashboard stats:", err);
                setError("Unexpected error");
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    return { statsData, loading, error };
};
