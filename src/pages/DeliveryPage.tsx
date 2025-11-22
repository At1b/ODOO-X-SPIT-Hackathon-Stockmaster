import { useEffect, useState } from 'react';
import { useOperationsStore } from '../store/operationsStore';
import { useDataStore } from '../store/dataStore';
import { OperationFilters } from '../components/OperationFilters';
import { OperationsTable } from '../components/OperationsTable';
import { Modal } from '../components/Modal';
import { DeliveryForm } from '../components/forms/DeliveryForm';
import { StatsCard } from '../components/StatsCard';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { StatsDetailModal } from '../components/StatsDetailModal';
import { Plus, Truck, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Operation } from '../store/operationsStore';
import { fetchProducts, fetchLocations, fetchWarehouses } from '../services/dataService';

export const DeliveryPage = () => {
  const { operations, loading, fetchOperations } = useOperationsStore();
  const { setProducts, setLocations } = useDataStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    title: '',
    operations: [] as Operation[],
  });

  // Load data once
  useEffect(() => {
    fetchOperations();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, locationsData, warehousesData] = await Promise.all([
        fetchProducts(),
        fetchLocations(),
        fetchWarehouses(),
      ]);

      setProducts(productsData);
      setLocations(locationsData);
      useDataStore.getState().setWarehouses(warehousesData);

    } catch (error) {
      console.error("Failed loading support data:", error);
    }
  };

  // Only deliveries
  const deliveries = operations.filter(op => op.type === "delivery");

  // Stats
  const stats = {
    total: deliveries.length,
    done: deliveries.filter(op => op.status === "done").length,
    draft: deliveries.filter(op => op.status === "draft").length,
    waiting: deliveries.filter(op => op.status === "waiting").length
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchOperations();
  };

  const handleValidate = async (id: string) => {
    alert("Validation not implemented yet for MySQL version.");
  };

  const handleView = (id: string) => {
    const op = deliveries.find(o => o.id === id);
    setSelectedOperation(op || null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Delivery Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Manage outgoing stock operations and customer deliveries
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Delivery
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Deliveries"
              value={stats.total}
              icon={Truck}
              color="purple"
              onClick={() =>
                setDetailModal({ isOpen: true, title: "All Deliveries", operations: deliveries })
              }
            />

            <StatsCard
              title="Completed"
              value={stats.done}
              icon={CheckCircle}
              color="green"
              onClick={() =>
                setDetailModal({
                  isOpen: true,
                  title: "Completed Deliveries",
                  operations: deliveries.filter(op => op.status === "done")
                })
              }
            />

            <StatsCard
              title="In Draft"
              value={stats.draft}
              icon={Clock}
              color="yellow"
              onClick={() =>
                setDetailModal({
                  isOpen: true,
                  title: "Draft Deliveries",
                  operations: deliveries.filter(op => op.status === "draft")
                })
              }
            />

            <StatsCard
              title="Waiting"
              value={stats.waiting}
              icon={TrendingUp}
              color="indigo"
              onClick={() =>
                setDetailModal({
                  isOpen: true,
                  title: "Waiting Deliveries",
                  operations: deliveries.filter(op => op.status === "waiting")
                })
              }
            />
          </div>
        </div>

        <OperationFilters />

        {loading ? (
          <TableSkeleton />
        ) : deliveries.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No Delivery Orders Found"
            description="Create your first delivery order to start tracking outgoing stock."
            action={{ label: "Create Delivery", onClick: () => setIsCreateModalOpen(true) }}
          />
        ) : (
          <OperationsTable operations={deliveries} onValidate={handleValidate} onView={handleView} />
        )}

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Delivery Order"
          size="lg"
        >
          <DeliveryForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        {/* View Modal */}
        {selectedOperation && (
          <Modal
            isOpen={!!selectedOperation}
            onClose={() => setSelectedOperation(null)}
            title="Operation Details"
            size="lg"
          >
            <OperationDetails operation={selectedOperation} />
          </Modal>
        )}

        {/* Stats Popup */}
        <StatsDetailModal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ isOpen: false, title: '', operations: [] })}
          title={detailModal.title}
          operations={detailModal.operations}
          type="delivery"
        />

      </div>
    </div>
  );
};

// Item modal
const OperationDetails = ({ operation }: { operation: Operation }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Type</label>
          <p className="mt-1 text-sm text-gray-900">{operation.type}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <p className="mt-1 text-sm text-gray-900">{operation.status}</p>
        </div>

        {operation.customer && (
          <div>
            <label className="text-sm font-medium text-gray-700">Customer</label>
            <p className="mt-1 text-sm text-gray-900">{operation.customer}</p>
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Items</label>
        <div className="mt-2 space-y-2">
          {operation.operation_items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">{item.products?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{item.products?.sku}</p>
              </div>
              <p className="font-medium">{item.quantity} {item.products?.uom || 'pcs'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
