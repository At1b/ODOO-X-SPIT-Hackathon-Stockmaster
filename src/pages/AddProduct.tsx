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
import { productsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from '@/hooks/useDebounce';

export default function AddProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    uom: "pcs",
    initial_stock: 0,
    low_stock_threshold: 0,
  });
  const [locations, setLocations] = useState<
    Array<{ location_id: string; quantity: number }>
  >([{ location_id: "", quantity: 0 }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const response = await productsApi.getCategories();
    if (response.success && response.data) {
      setCategories(response.data.map((cat: string, idx: number) => ({ id: idx + 1, name: cat })));
    } else {
      setCategories([
        { id: 1, name: "Electronics" },
        { id: 2, name: "Furniture" },
        { id: 3, name: "Office Supplies" },
      ]);
    }
  };

  const [barcodePreview, setBarcodePreview] = useState<string | null>(null);
  const [skuPreview, setSkuPreview] = useState<string | null>(null);
  const debouncedName = useDebounce(formData.name, 500);
  const debouncedCategory = useDebounce(formData.category, 500);

  // call generate SKU endpoint whenever name or category (debounced) change
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!debouncedName || !debouncedCategory) {
        setSkuPreview(null);
        setBarcodePreview(null);
        return;
      }

      try {
        const res = await productsApi.generateSku({ name: debouncedName, category: debouncedCategory });
        if (!active) return;
        if (res && res.success && res.data) {
          setSkuPreview(res.data.sku || null);
          setBarcodePreview(res.data.barcode || null);
        } else {
          setSkuPreview(null);
          setBarcodePreview(null);
        }
      } catch (err) {
        console.error('Failed to fetch generated SKU', err);
        if (active) {
          setSkuPreview(null);
          setBarcodePreview(null);
        }
      }
    };

    load();
    return () => { active = false; };
  }, [debouncedName, debouncedCategory]);

  // real-time validation
  useEffect(() => {
    const e: Record<string,string> = {};
    if (!formData.name || formData.name.trim().length === 0) e.name = 'Product name is required';
    if (!formData.category || formData.category.trim().length === 0) e.category = 'Category is required';
    if (!formData.uom || formData.uom.trim().length === 0) e.uom = 'Unit is required';
    if (!Number.isInteger(formData.initial_stock) || formData.initial_stock < 0) e.initial_stock = 'Initial stock must be a non-negative integer';
    if (!Number.isInteger(formData.low_stock_threshold) || formData.low_stock_threshold < 0) e.low_stock_threshold = 'Low stock threshold must be a non-negative integer';
    if (formData.initial_stock > 0 && formData.low_stock_threshold > formData.initial_stock) e.low_stock_threshold = 'Threshold should not exceed initial stock';
    setErrors(e);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validate final
    if (Object.keys(errors).length > 0) {
      toast({ title: 'Validation error', description: 'Fix the highlighted fields before submitting', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const productData = {
      name: formData.name,
      category: formData.category,
      uom: formData.uom,
      low_stock_threshold: formData.low_stock_threshold,
      initial_stock: formData.initial_stock,
    };

    const response = await productsApi.create(productData);
    if (response.success) {
      toast({ title: 'Success', description: 'Product created successfully' });
      // show barcode & sku if returned
      if (response.data && response.data.barcode) {
        setBarcodePreview(response.data.barcode);
      }
      if (response.data && response.data.sku) {
        setSkuPreview(response.data.sku);
      }
      // navigate to edit page for this product so the barcode will persist (Edit fetches product barcode)
      const newId = response.data?.product_id;
      setTimeout(() => {
        if (newId) navigate(`/products/edit/${newId}`);
        else navigate('/products');
      }, 900);
    } else {
      toast({ title: 'Error', description: response.error || 'Failed to create product', variant: 'destructive' });
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
    <div className="min-h-screen bg-background w-full">
      <div className="w-full p-4 md:p-6 lg:p-8 max-w-full space-y-6">
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

  <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Wireless Mouse"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                      required
                    >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                </div>

                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                      value={formData.uom}
                      onValueChange={(value) =>
                        setFormData({ ...formData, uom: value })
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
                <Input id="initial_stock" placeholder="0" type="number" min="0" value={formData.initial_stock} onChange={(e) => setFormData({ ...formData, initial_stock: parseInt(e.target.value) || 0 })} aria-invalid={!!errors.initial_stock} />
                {errors.initial_stock && <p className="text-sm text-red-500 mt-1">{errors.initial_stock}</p>}
              </div>

              <div>
                <Label>SKU (preview)</Label>
                <Input value={skuPreview || ''} placeholder="SKU will be generated" readOnly disabled className="font-mono" />
              </div>

              {barcodePreview && (
                <div className="mt-4 md:col-span-2">
                  <Label>Barcode Preview</Label>
                  <div className="pt-2 bg-white p-4 rounded-md shadow-sm inline-block dark:bg-card">
                    <img src={barcodePreview} alt="Barcode" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reordering Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Reordering Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                <Input
                  id="low_stock_threshold"
                  placeholder="e.g., 10"
                  type="number"
                  min="0"
                  value={formData.low_stock_threshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      low_stock_threshold: parseInt(e.target.value) || 0,
                    })
                  }
                  aria-invalid={!!errors.low_stock_threshold}
                />
                {errors.low_stock_threshold && <p className="text-sm text-red-500 mt-1">{errors.low_stock_threshold}</p>}
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
            <CardContent className="space-y-3">
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
          <div className="flex gap-3 justify-end">
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
