import React from 'react';

type Loc = {
  location_id?: number | string;
  name?: string;
  code?: string;
  total_stock?: number;
  quantity?: number; // alternative field
  last_updated?: string;
};

const formatQty = (q: any) => {
  const n = Number(q) || 0;
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const stockBadge = (qty: number) => {
  if (qty === 0) return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Zero' };
  if (qty < 10) return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Low' };
  if (qty > 10 && qty < 50) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' };
  return { bg: 'bg-green-100', text: 'text-green-700', label: 'High' };
};

export default function StockByLocationTable({ data }: { data: Loc[] }) {
  const list = Array.isArray(data) ? data : [];
  const total = list.reduce((s, d) => s + (Number(d.total_stock ?? d.quantity) || 0), 0);

  return (
    <div className="text-gray-800">
      {/* Totals card */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-indigo-50 rounded-lg shadow-sm">
          <h4 className="text-sm text-indigo-600 font-medium">Total Stock</h4>
          <p className="text-2xl font-bold text-indigo-900">{formatQty(total)}</p>
        </div>
        <div className="md:col-span-2 p-4 bg-white rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-gray-700">Stock distribution</h4>
          <p className="text-xs text-gray-500 mt-1">Total stock distribution across warehouse locations</p>
          {/* Simple distribution bars */}
          <div className="mt-3 space-y-2">
            {list.slice(0,5).map((l) => {
              const qty = Number(l.total_stock ?? l.quantity) || 0;
              const pct = total > 0 ? Math.round((qty / total) * 100) : 0;
              return (
                <div key={l.location_id} className="flex items-center gap-3">
                  <div className="w-36 text-sm text-gray-600">{l.name}</div>
                  <div className="flex-1 bg-gray-100 h-2 rounded overflow-hidden">
                    <div style={{ width: `${pct}%` }} className="h-2 bg-indigo-500" />
                  </div>
                  <div className="w-16 text-right font-mono text-sm">{formatQty(qty)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of location cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((loc) => {
          const qty = Number(loc.total_stock ?? loc.quantity) || 0;
          const badge = stockBadge(qty);
          return (
            <div key={loc.location_id} className="p-4 rounded-lg border shadow-sm bg-white hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{loc.name}</h3>
                  {loc.code && <p className="text-xs text-gray-500 mt-1">{loc.code}</p>}
                </div>
                <span className="text-xs text-gray-400">#{loc.location_id}</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Stock</div>
                  <div className="text-2xl font-bold text-gray-900 font-mono">{formatQty(qty)}</div>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-500">{loc.last_updated ? `Updated: ${new Date(loc.last_updated).toLocaleString()}` : ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
