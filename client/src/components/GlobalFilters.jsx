import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import api from '../utils/api';
import { Filter, X } from 'lucide-react';

const GlobalFilters = () => {
    const { filters, updateFilter, clearFilters } = useFilters();
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [statuses] = useState([
        { value: 'all', label: 'All Status' },
        { value: 'in_stock', label: 'In Stock' },
        { value: 'low_stock', label: 'Low Stock' },
        { value: 'out_of_stock', label: 'Out of Stock' }
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [categoriesRes, locationsRes] = await Promise.all([
                    api.get('/filters/categories'),
                    api.get('/filters/locations')
                ]);

                setCategories(categoriesRes.data || []);
                setLocations(locationsRes.data || []);
            } catch (error) {
                // Error fetching filter options
            } finally {
                setLoading(false);
            }
        };
        fetchFilterOptions();
    }, []);

    const hasActiveFilters = filters.status !== 'all' || filters.category !== 'all' || filters.location !== 'all';

    if (loading) {
        return (
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="text-gray-500">Loading filters...</div>
            </div>
        );
    }

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <Filter size={18} />
                    <span>Filters:</span>
                </div>

                {/* Status Filter */}
                <select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                >
                    {statuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                </select>

                {/* Category Filter */}
                <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>

                {/* Location Filter */}
                <select
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                >
                    <option value="all">All Warehouses</option>
                    {locations.map(location => (
                        <option key={location.location_id} value={location.location_id}>
                            {location.location_name}
                        </option>
                    ))}
                </select>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        <X size={16} />
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
};

export default GlobalFilters;
