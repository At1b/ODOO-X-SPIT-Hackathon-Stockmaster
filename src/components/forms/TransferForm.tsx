import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { operationsAPI } from '../../services/api';
import { useDataStore } from '../../store/dataStore';
import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

const transferSchema = z
  .object({
    source_location_id: z.string().uuid('Please select a source location'),
    destination_location_id: z.string().uuid('Please select a destination location'),
    items: z
      .array(
        z.object({
          product_id: z.string().uuid('Please select a product'),
          quantity: z.number().positive('Quantity must be greater than 0'),
        })
      )
      .min(1, 'At least one item is required'),
  })
  .refine((data) => data.source_location_id !== data.destination_location_id, {
    message: 'Source and destination locations must be different',
    path: ['destination_location_id'],
  });

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TransferForm = ({ onSuccess, onCancel }: TransferFormProps) => {
  const { products, locations, setProducts, setLocations } = useDataStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      source_location_id: '',
      destination_location_id: '',
      items: [{ product_id: '', quantity: 1 }],
    },
  });

  const items = watch('items');

  useEffect(() => {
    const loadData = async () => {
      try {
        const { fetchProducts, fetchLocations, fetchWarehouses } = await import('../../services/dataService');
        const [productsData, locationsData, warehousesData] = await Promise.all([
          fetchProducts(),
          fetchLocations(),
          fetchWarehouses(),
        ]);
        setProducts(productsData);
        setLocations(locationsData);
        useDataStore.getState().setWarehouses(warehousesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  const onSubmit = async (data: TransferFormData) => {
    try {
      setLoading(true);
      await operationsAPI.createTransfer(data);
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to create transfer');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setValue('items', [...items, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setValue(
      'items',
      items.filter((_, i) => i !== index)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source Location *
          </label>
          <select
            {...register('source_location_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} ({location.warehouses?.name})
              </option>
            ))}
          </select>
          {errors.source_location_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.source_location_id.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination Location *
          </label>
          <select
            {...register('destination_location_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} ({location.warehouses?.name})
              </option>
            ))}
          </select>
          {errors.destination_location_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.destination_location_id.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Items *
          </label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <select
                  {...register(`items.${index}.product_id`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
                {errors.items?.[index]?.product_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.items[index]?.product_id?.message}
                  </p>
                )}
              </div>
              <div className="w-32">
                <input
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Qty"
                />
                {errors.items?.[index]?.quantity && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.items[index]?.quantity?.message}
                  </p>
                )}
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.items && (
          <p className="mt-1 text-sm text-red-600">{errors.items.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 font-medium shadow-sm transition-all"
        >
          {loading ? 'Creating...' : 'Create Transfer'}
        </button>
      </div>
    </form>
  );
};

