import { useEffect, useState } from "react";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  AlertTriangle,
  FolderTree,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
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
  LineChart,
  Line,
} from "recharts";
import { dashboardApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    categoriesCount: 0,
    totalStock: 0,
  });

  const [stockByCategory, setStockByCategory] = useState([
    { name: "Electronics", stock: 120 },
    { name: "Furniture", stock: 85 },
    { name: "Office Supplies", stock: 210 },
    { name: "Hardware", stock: 95 },
  ]);

  const [stockDistribution, setStockDistribution] = useState([
    { name: "Normal Stock", value: 75 },
    { name: "Low Stock", value: 25 },
  ]);

  const [stockTrend, setStockTrend] = useState([
    { month: "Jan", stock: 400 },
    { month: "Feb", stock: 380 },
    { month: "Mar", stock: 420 },
    { month: "Apr", stock: 450 },
    { month: "May", stock: 480 },
    { month: "Jun", stock: 510 },
  ]);

  const [recentProducts, setRecentProducts] = useState([
    { id: 1, name: "Product A", sku: "SKU001", stock: 50, category: "Electronics" },
    { id: 2, name: "Product B", sku: "SKU002", stock: 12, category: "Furniture" },
    { id: 3, name: "Product C", sku: "SKU003", stock: 100, category: "Office Supplies" },
  ]);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    const response = await dashboardApi.getStats();
    if (response.success && response.data) {
      setStats(response.data);
    } else {
      // Using mock data when API is not available
      setStats({
        totalProducts: 145,
        lowStockCount: 12,
        categoriesCount: 8,
        totalStock: 4250,
      });
    }
  };

  const handleNavigateToOperations = () => {
    // Replace with actual Rutuja's dashboard URL
    window.location.href = "https://operations-dashboard-url.com";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Product Management Overview
            </p>
          </div>
          <Button
            onClick={handleNavigateToOperations}
            className="gap-2"
            variant="default"
          >
            Go to Operations Dashboard
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            description="Active products in inventory"
          />
          <KPICard
            title="Low Stock Items"
            value={stats.lowStockCount}
            icon={AlertTriangle}
            description="Requires attention"
          />
          <KPICard
            title="Categories"
            value={stats.categoriesCount}
            icon={FolderTree}
            description="Product categories"
          />
          <KPICard
            title="Total Stock Units"
            value={stats.totalStock}
            icon={TrendingUp}
            description="Across all locations"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Stock by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stock Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stockDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Stock Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="stock"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Added Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      SKU
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4 font-mono text-sm">
                        {product.sku}
                      </td>
                      <td className="py-3 px-4">{product.category}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock < 20
                              ? "bg-destructive/10 text-destructive"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
