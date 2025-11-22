import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({ name: '', category: '', uom: 'pcs', low_stock_threshold: 0, initial_stock: 0 });
  const [barcode, setBarcode] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string,string>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await productsApi.getById(id);
      if (res.success && res.data) {
        setForm({
          name: res.data.name,
          category: res.data.category,
          uom: res.data.uom,
          low_stock_threshold: res.data.low_stock_threshold,
          initial_stock: res.data.total_stock ?? 0,
        });
        setBarcode(res.data.barcode || null);
        // attach sku preview if available
        if (res.data.sku) {
          // small optimization: show SKU in the form
          setForm((f:any)=>({ ...f, sku: res.data.sku }));
        }
      }
      setLoading(false);
    })();
  }, [id]);

  // real-time validation for edit form
  useEffect(() => {
    const e: Record<string,string> = {};
    if (!form.name || form.name.trim().length === 0) e.name = 'Product name is required';
    if (!form.category || form.category.trim().length === 0) e.category = 'Category is required';
    if (!form.uom || form.uom.trim().length === 0) e.uom = 'Unit is required';
    if (!Number.isInteger(form.initial_stock) || form.initial_stock < 0) e.initial_stock = 'Initial stock must be a non-negative integer';
    if (!Number.isInteger(form.low_stock_threshold) || form.low_stock_threshold < 0) e.low_stock_threshold = 'Low stock threshold must be a non-negative integer';
    if (form.initial_stock > 0 && form.low_stock_threshold > form.initial_stock) e.low_stock_threshold = 'Threshold should not exceed initial stock';
    setErrors(e);
  }, [form]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!id) return;
    if (Object.keys(errors).length > 0) {
      alert('Please fix validation errors before saving');
      return;
    }
    const res = await productsApi.update(id, form);
    if (res.success) navigate('/products');
    else alert(res.error || 'Failed to update');
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="w-full p-4 md:p-6 lg:p-8">
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input placeholder="e.g., Office Desk" value={form.name} onChange={(e:any)=>setForm({...form, name: e.target.value})} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label>Category</Label>
              <Input placeholder="e.g., Furniture" value={form.category} onChange={(e:any)=>setForm({...form, category: e.target.value})} aria-invalid={!!errors.category} />
              {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
            </div>
            <div>
              <Label>Unit</Label>
              <Input value={form.uom} onChange={(e:any)=>setForm({...form, uom: e.target.value})} aria-invalid={!!errors.uom} />
              {errors.uom && <p className="text-sm text-red-500 mt-1">{errors.uom}</p>}
            </div>
            <div>
              <Label>Initial Stock</Label>
              <Input type="number" placeholder="0" value={form.initial_stock} onChange={(e:any)=>setForm({...form, initial_stock: parseInt(e.target.value)||0})} aria-invalid={!!errors.initial_stock} />
              {errors.initial_stock && <p className="text-sm text-red-500 mt-1">{errors.initial_stock}</p>}
            </div>
            <div>
              <Label>Low Stock Threshold</Label>
              <Input type="number" value={form.low_stock_threshold} onChange={(e:any)=>setForm({...form, low_stock_threshold: parseInt(e.target.value)||0})} aria-invalid={!!errors.low_stock_threshold} />
              {errors.low_stock_threshold && <p className="text-sm text-red-500 mt-1">{errors.low_stock_threshold}</p>}
            </div>

            {form.sku && (
              <div>
                <Label>SKU</Label>
                <Input value={form.sku} readOnly disabled className="font-mono" />
              </div>
            )}

            {barcode && (
              <div className="md:col-span-2 mt-2">
                <Label>Barcode Preview</Label>
                <div className="pt-2 bg-white p-3 rounded-md shadow-sm inline-block dark:bg-card"><img src={barcode} alt="barcode" /></div>
              </div>
            )}

            <div className="flex justify-end gap-2 md:col-span-2">
              <Button variant="outline" onClick={()=>navigate('/products')}>Cancel</Button>
              <Button onClick={handleSubmit}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
