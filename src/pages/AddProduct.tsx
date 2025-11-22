import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { productsApi, categoriesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AddProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    unit: "pcs",
    initial_stock: 0,
    reorder_min: 0,
    reorder_quantity: 0,
    reorder_enabled: true,
  });
  const [locations, setLocations] = useState<
    Array<{ location_id: string; quantity: number }>
  >([{ location_id: "", quantity: 0 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const response = await categoriesApi.getAll();
    if (response.success && response.data) {
      setCategories(response.data);
    } else {
      setCategories([
        { id: 1, name: "Electronics" },
        { id: 2, name: "Furniture" },
        { id: 3, name: "Office Supplies" },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      ...formData,
      locations,
    };

    const response = await productsApi.create(productData);
    if (response.success) {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      navigate("/products");
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to create product",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const addLocation = () => {
    setLocations([...locations, { location_id: "", quantity: 0 }]);
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const updateLocation = (index: number, field: string, value: any) => {
    const updated = [...locations];
    updated[index] = { ...updated[index], [field]: value };
    setLocations(updated);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add Product</h1>
            <p className="text-muted-foreground mt-1">
              Create a new product in inventory
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                      <SelectItem value="units">Units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="initial_stock">Initial Stock</Label>
                <Input
                  id="initial_stock"
                  type="number"
                  min="0"
                  value={formData.initial_stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initial_stock: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Reordering Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Reordering Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reorder_min">Minimum Quantity</Label>
                  <Input
                    id="reorder_min"
                    type="number"
                    min="0"
                    value={formData.reorder_min}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reorder_min: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="reorder_quantity">Reorder Quantity</Label>
                  <Input
                    id="reorder_quantity"
                    type="number"
                    min="0"
                    value={formData.reorder_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reorder_quantity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Stock */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stock by Location</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addLocation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {locations.map((location, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g., Warehouse A, Store 1"
                      value={location.location_id}
                      onChange={(e) =>
                        updateLocation(index, "location_id", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-32">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={location.quantity}
                      onChange={(e) =>
                        updateLocation(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  {locations.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLocation(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/products")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
