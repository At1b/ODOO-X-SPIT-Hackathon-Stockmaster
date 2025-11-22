import React, { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function ProductQuickView({ productId, onClose }: { productId: string | number | null, onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!productId) return;
    let active = true;
    (async () => {
      setLoading(true);
      const res = await productsApi.getById(String(productId));
      if (res.success && res.data && active) {
        setProduct(res.data);
      }

      // fetch stock by location
      const stocks = await productsApi.getLocations(String(productId));
      if (stocks.success && stocks.data && active) {
        setLocations(stocks.data);
      }

      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [productId]);

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-w-2xl w-full mx-4">
        <Card>
          <CardHeader>
            <CardTitle>Product Quick View</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-6">Loading...</div>
            ) : (
              <div className="space-y-4 p-4">
                <div>
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="text-lg font-semibold">{product.name}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div>{product.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">SKU</div>
                    <div className="font-mono">{product.sku}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Reorder Threshold</div>
                    <div>{product.low_stock_threshold ?? 0}</div>
                  </div>
                </div>

                {product.barcode && (
                  <div>
                    <div className="text-sm text-muted-foreground">Barcode</div>
                    <div className="pt-2 bg-white p-3 rounded-md shadow-sm inline-block dark:bg-card">
                      <img src={product.barcode} alt="barcode" />
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Stock by Location</div>
                  <div className="grid grid-cols-1 gap-2">
                    {locations && locations.length > 0 ? (
                      locations.map((l:any) => (
                        <div key={l.location_id} className={`flex items-center justify-between p-3 rounded border ${l.quantity < (product.low_stock_threshold || 0) ? 'bg-red-50 border-red-100 text-red-700' : 'bg-white dark:bg-card'}`}>
                          <div>
                            <div className="font-medium">{l.location_name || l.name || `Location ${l.location_id}`}</div>
                            <div className="text-sm text-muted-foreground">Updated: {l.last_updated ? new Date(l.last_updated).toLocaleString() : '—'}</div>
                          </div>
                          <div className="font-mono text-lg">{l.quantity}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No stock records found for this product.</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>Close</Button>
                  <Button onClick={() => navigate(`/products/edit/${product.product_id || product.id}`)}>Edit</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
