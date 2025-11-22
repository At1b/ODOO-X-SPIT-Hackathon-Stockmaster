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
import { productsApi, categoriesApi } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [debouncedSearch, selectedCategory, currentPage]);

  const loadCategories = async () => {
    const response = await categoriesApi.getAll();
    if (response.success && response.data) {
      setCategories(response.data);
    } else {
      // Mock data
      setCategories([
        { id: 1, name: "Electronics" },
        { id: 2, name: "Furniture" },
        { id: 3, name: "Office Supplies" },
      ]);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    const response = await productsApi.getAll({
      search: debouncedSearch,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      page: currentPage,
      limit: 10,
    });

    if (response.success && response.data) {
      setProducts(response.data);
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your product inventory
            </p>
          </div>
          <Link to="/products/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
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
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Unit
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Stock
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">
                          {product.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">
                          {product.sku}
                        </td>
                        <td className="py-3 px-4">{product.category}</td>
                        <td className="py-3 px-4">{product.unit}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {product.stock < product.low_stock && (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                            <Badge
                              variant={
                                product.stock < product.low_stock
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {product.stock}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/products/edit/${product.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
