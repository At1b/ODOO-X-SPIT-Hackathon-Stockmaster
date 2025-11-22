import React, { useState } from 'react';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';

export default function ProductTable({ products, onDelete, onEdit, onRowClick, loading = false }: any) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [dir, setDir] = useState<'asc'|'desc'>('asc');

  const sortBy = (key: string) => {
    if (sortKey === key) setDir(dir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setDir('asc'); }
  };

  const sorted = React.useMemo(() => {
    if (!sortKey) return products || [];
    return [...(products || [])].sort((a,b) => {
      if (a[sortKey] == null) return 1;
      if (b[sortKey] == null) return -1;
      if (a[sortKey] < b[sortKey]) return dir === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, sortKey, dir]);

  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden transition hover:shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-gray-800">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 cursor-pointer" onClick={() => sortBy('name')}>Name</th>
              <th className="text-left p-3 cursor-pointer" onClick={() => sortBy('sku')}>SKU</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3 cursor-pointer" onClick={() => sortBy('stock')}>Stock</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // render skeleton rows
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-t">
                  <td className="p-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse font-mono" />
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                  </td>
                  <td className="p-3 text-right">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto animate-pulse" />
                  </td>
                  <td className="p-3 text-right">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto animate-pulse" />
                  </td>
                </tr>
              ))
            ) : (
              sorted.map((p: any) => (
                <tr key={p.product_id || p.id} onClick={() => onRowClick && onRowClick(p)} className="border-t hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 font-mono text-sm">{p.sku}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700">{p.category}</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {p.low_stock && <AlertTriangle className="text-red-500 w-4 h-4" />}
                      <span className={`px-2 py-1 rounded ${p.low_stock ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'}`}>{p.stock}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2 items-center justify-end">
                      <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(p); }} className="p-2 rounded hover:bg-gray-100"><Edit className="w-4 h-4"/></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(p.product_id || p.id); }} className="p-2 rounded hover:bg-gray-100"><Trash2 className="w-4 h-4 text-red-600"/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
