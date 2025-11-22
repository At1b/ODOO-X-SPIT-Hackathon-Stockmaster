import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { KPICard } from '@/components/KPICard';
import ChartCard from '@/components/ChartCard';
import StockByLocationTable from '@/components/StockByLocationTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  AlertTriangle,
  FolderTree,
  TrendingUp,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    total_products: 0,
    low_stock_count: 0,
    total_categories: 0,
    total_stock: 0,
    stock_by_category: [],
    stock_by_location: [],
    recent_products: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    const t = setInterval(() => fetchStats(), 30000); // refresh every 30s
    return () => clearInterval(t);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardApi.getStats();
      if (response && response.success && response.data) {
        setStats(response.data);
        setError(null);
      } else if (response && !response.success) {
        setError(response.error || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const lowStockData = [
    { name: 'Low Stock', value: stats.low_stock_count, color: '#ef4444' },
    {
      name: 'Normal Stock',
      value: Math.max((stats.total_products || 0) - (stats.low_stock_count || 0), 0),
      color: '#7c3aed', // purple
    },
  ];

  const COLORS = ['#ef4444', '#7c3aed'];

  if (loading) {
    return (
      <div className="py-12">
        <div className="text-center py-20 text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
  <div className="space-y-4 w-full">
      {error && (
        <div className="mb-4">
          <div className="p-4 rounded-md bg-destructive/10 text-destructive">
            <strong>Dashboard error:</strong> {error}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Product Management Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">Last updated: <span className="font-medium text-gray-200">{new Date().toLocaleTimeString()}</span></div>
          <Button onClick={fetchStats} variant="outline" className="gap-2">Refresh</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <section aria-labelledby="kpis" className="mt-4">
        <h3 id="kpis" className="text-xs text-gray-400 uppercase tracking-wide mb-3">Overview</h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Products" value={stats.total_products} icon={Package} />
          <KPICard title="Low Stock Items" value={stats.low_stock_count} icon={AlertTriangle} />
          <KPICard title="Categories" value={stats.total_categories} icon={FolderTree} />
          <KPICard title="Total Stock Units" value={stats.total_stock} icon={TrendingUp} />
        </div>
      </section>

      {/* Charts */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <div className="lg:col-span-2">
          <ChartCard title="Stock by Category">
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={Array.isArray(stats.stock_by_category) ? stats.stock_by_category : []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="category" tickLine={false} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_stock" fill="#4F46E5" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div>
          <ChartCard title="Stock Status">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={Array.isArray(lowStockData) ? lowStockData : []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {lowStockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* Stock by Location & Recent Products */}
      <section className="grid gap-4 md:grid-cols-2 mt-6">
        <div>
          <Card className="rounded-xl shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Stock by Location
              </CardTitle>
              <CardDescription>Inventory across warehouses</CardDescription>
            </CardHeader>
            <CardContent>
              <StockByLocationTable data={stats.stock_by_location} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="rounded-xl shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Recently Added Products</CardTitle>
              <CardDescription>Latest additions to inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stats.recent_products?.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No products yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    (Array.isArray(stats.recent_products) ? stats.recent_products : []).map((product: any) => (
                      <TableRow key={product.product_id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.sku}</Badge>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">{product.total_stock}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
