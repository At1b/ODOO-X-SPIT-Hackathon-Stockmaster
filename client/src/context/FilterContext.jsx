import React, { createContext, useState, useContext } from 'react';

const FilterContext = createContext();

export const useFilters = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
    const [filters, setFilters] = useState({
        status: 'all',
        category: 'all',
        location: 'all'
    });

    const updateFilter = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            status: 'all',
            category: 'all',
            location: 'all'
        });
    };

    return (
        <FilterContext.Provider value={{ filters, updateFilter, clearFilters }}>
            {children}
        </FilterContext.Provider>
    );
};
