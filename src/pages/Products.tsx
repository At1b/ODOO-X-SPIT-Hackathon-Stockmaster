import ProductTable from '@/components/ProductTable';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { productsApi } from "@/lib/api";
import { locationsApi } from '@/lib/api';
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/use-toast";
import ProductQuickView from '@/components/ProductQuickView';

export default function Products() {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockStatus, setStockStatus] = useState<'all'|'low'|'in'|'out'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quickViewId, setQuickViewId] = useState<string | number | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    loadCategories();
    loadLocations();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [debouncedSearch, selectedCategory, currentPage]);

  const loadCategories = async () => {
    const response = await productsApi.getCategories();
  if (response.success && response.data) {
      setCategories(response.data.map((cat: string, idx: number) => ({ id: idx + 1, name: cat })));
    } else {
      // Mock data
      setCategories([
        { id: 1, name: "Electronics" },
        { id: 2, name: "Furniture" },
        { id: 3, name: "Office Supplies" },
      ]);
    }
  };

  const loadLocations = async () => {
    try {
      const res = await locationsApi.getAll();
      if (res.success && res.data) {
        setLocations(res.data);
      } else {
        setLocations([]);
      }
    } catch (err) {
      console.error('Failed to load locations', err);
      setLocations([]);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    const response = await productsApi.getAll({
      search: debouncedSearch,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      location: selectedLocation !== 'all' ? selectedLocation : undefined,
      page: currentPage,
      limit: 10,
    });
    if (response.success && response.data) {
      // normalize backend shape to what the UI expects
      const mapped = response.data.map((p: any) => ({
        product_id: p.product_id || p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        unit: p.uom || p.unit,
        stock: p.total_stock ?? 0,
        low_stock: p.total_stock < (p.low_stock_threshold || 0),
      }));
      // client-side stock status filtering
      let filtered = mapped;
      if (stockStatus !== 'all') {
        if (stockStatus === 'low') filtered = filtered.filter((f:any) => f.low_stock);
        if (stockStatus === 'in') filtered = filtered.filter((f:any) => f.stock > 0 && !f.low_stock);
        if (stockStatus === 'out') filtered = filtered.filter((f:any) => f.stock === 0);
      }

      // NOTE: location filtering requires backend support for per-location stock; we pass location param above.
      setProducts(filtered);
    } else {
      // Mock data
      setProducts([
        {
          id: 1,
          name: "Laptop Dell XPS 13",
          sku: "LAP-001",
          category: "Electronics",
          unit: "pcs",
          stock: 45,
          low_stock: 10,
        },
        {
          id: 2,
          name: "Office Chair Ergonomic",
          sku: "CHR-001",
          category: "Furniture",
          unit: "pcs",
          stock: 8,
          low_stock: 15,
        },
        {
          id: 3,
          name: "Printer Paper A4",
          sku: "PPR-001",
          category: "Office Supplies",
          unit: "boxes",
          stock: 120,
          low_stock: 30,
        },
      ]);
    }
    setLoading(false);
  };

  const handleEdit = (p: any) => {
    window.location.href = `/products/edit/${p.product_id || p.id}`;
  };

  const handleRowClick = (p: any) => {
    setQuickViewId(p.product_id || p.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const response = await productsApi.delete(id);
    if (response.success) {
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      loadProducts();
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="space-y-4 w-full">
        {/* Header */}
  <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your product inventory
            </p>
          </div>
          <Link to="/products/add">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="rounded-xl bg-white shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>

            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={stockStatus} onValueChange={(v: any) => setStockStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Stock status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low stock</SelectItem>
                  <SelectItem value="in">In stock</SelectItem>
                  <SelectItem value="out">Out of stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc:any) => (
                    <SelectItem key={loc.location_id} value={String(loc.location_id)}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Table */}
  <div className="mt-2 w-full">
          {loading ? (
            <div className="w-full bg-white rounded-lg shadow-sm p-4">
              <div className="overflow-x-auto w-full">
                <ProductTable loading={true} products={[]} onEdit={handleEdit} onDelete={handleDelete} />
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              {/* simple friendly illustration */}
              <svg className="mx-auto mb-4" width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="24" width="144" height="80" rx="8" fill="#F3F4F6" />
                <rect x="24" y="40" width="112" height="8" rx="4" fill="#E5E7EB" />
                <rect x="24" y="58" width="80" height="8" rx="4" fill="#E5E7EB" />
                <rect x="24" y="76" width="56" height="8" rx="4" fill="#E5E7EB" />
              </svg>
              <p className="text-gray-500">No products found</p>
              <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="w-full bg-white rounded-lg shadow-sm p-4">
              <div className="overflow-x-auto w-full">
                <ProductTable products={products} onEdit={handleEdit} onDelete={handleDelete} onRowClick={handleRowClick} />
              </div>
            </div>
          )}
        </div>
        {quickViewId && (
          <ProductQuickView productId={quickViewId} onClose={() => setQuickViewId(null)} />
        )}
      </div>
    </div>
  );
}
