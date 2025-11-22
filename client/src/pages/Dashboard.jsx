import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useFilters } from '../context/FilterContext';
import { Package, AlertTriangle, XCircle, Truck, ArrowDownLeft } from 'lucide-react';

const Dashboard = () => {
    const { filters } = useFilters();
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        outOfStock: 0,
        pendingReceipts: 0,
        pendingDeliveries: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const params = new URLSearchParams();
                if (filters.status !== 'all') params.append('status', filters.status);
                if (filters.category !== 'all') params.append('category', filters.category);
                if (filters.location !== 'all') params.append('location', filters.location);

                const { data } = await api.get(`/dashboard/kpi?${params.toString()}`);
                setStats(data);
            } catch (error) {
                // Error fetching dashboard stats
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [filters]);

    if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

    const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-start justify-between border border-slate-100 hover:shadow-md transition-shadow">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon className={color} size={24} />
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={Package}
                    color="text-indigo-600"
                    bgColor="bg-indigo-50"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats.lowStock}
                    icon={AlertTriangle}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                />
                <StatCard
                    title="Out of Stock"
                    value={stats.outOfStock}
                    icon={XCircle}
                    color="text-red-600"
                    bgColor="bg-red-50"
                />
                <StatCard
                    title="Pending Receipts"
                    value={stats.pendingReceipts}
                    icon={ArrowDownLeft}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
                <StatCard
                    title="Pending Deliveries"
                    value={stats.pendingDeliveries}
                    icon={Truck}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
            </div>

            {/* Placeholder for recent activity or charts */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h2>
                <div className="text-slate-500 text-center py-8">
                    Activity log coming soon...
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
