import { useEffect, useState } from 'react';
import { useOperationsStore } from '../store/operationsStore';
import { useDataStore } from '../store/dataStore';
import { OperationFilters } from '../components/OperationFilters';
import { OperationsTable } from '../components/OperationsTable';
import { Modal } from '../components/Modal';
import { TransferForm } from '../components/forms/TransferForm';
import { StatsCard } from '../components/StatsCard';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { StatsDetailModal } from '../components/StatsDetailModal';
import { Plus, ArrowRightLeft, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Operation } from '../store/operationsStore';
import { fetchProducts, fetchLocations, fetchWarehouses } from '../services/dataService';

export const TransfersPage = () => {
  const { operations, loading, fetchOperations } = useOperationsStore();
  const { setProducts, setLocations } = useDataStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    title: '',
    operations: [] as Operation[],
  });

  // Load transfer operations + data
  useEffect(() => {
    fetchOperations();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, locationsData, warehousesData] = await Promise.all([
        fetchProducts(),
        fetchLocations(),
        fetchWarehouses()
      ]);

      setProducts(productsData);
      setLocations(locationsData);
      useDataStore.getState().setWarehouses(warehousesData);

    } catch (error) {
      console.error("Failed loading data:", error);
    }
  };

  // Filter only transfers
  const transfers = operations.filter(op => op.type === "transfer");

  // Stats
  const stats = {
    total: transfers.length,
    done: transfers.filter(op => op.status === "done").length,
    draft: transfers.filter(op => op.status === "draft").length,
    waiting: transfers.filter(op => op.status === "waiting").length,
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchOperations();
  };

  const handleValidate = async (id: string) => {
    alert("Validation backend not implemented for transfers.");
  };

  const handleView = (id: string) => {
    const op = transfers.find(o => o.id === id);
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
                Internal Transfers
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Manage location-to-location stock transfers
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Transfer
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

            <StatsCard
              title="Total Transfers"
              value={stats.total}
              icon={ArrowRightLeft}
              color="indigo"
              onClick={() =>
                setDetailModal({ isOpen: true, title: "All Transfers", operations: transfers })
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
                  title: "Completed Transfers",
                  operations: transfers.filter(op => op.status === "done")
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
                  title: "Draft Transfers",
                  operations: transfers.filter(op => op.status === "draft")
                })
              }
            />

            <StatsCard
              title="Waiting"
              value={stats.waiting}
              icon={TrendingUp}
              color="purple"
              onClick={() =>
                setDetailModal({
                  isOpen: true,
                  title: "Waiting Transfers",
                  operations: transfers.filter(op => op.status === "waiting")
                })
              }
            />

          </div>
        </div>

        <OperationFilters />

        {loading ? (
          <TableSkeleton />
        ) : transfers.length === 0 ? (
          <EmptyState
            icon={ArrowRightLeft}
            title="No Transfers Found"
            description="Create your first internal transfer."
            action={{ label: "Create Transfer", onClick: () => setIsCreateModalOpen(true) }}
          />
        ) : (
          <OperationsTable operations={transfers} onValidate={handleValidate} onView={handleView} />
        )}

        {/* Create Transfer Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Internal Transfer"
          size="lg"
        >
          <TransferForm
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
          type="transfer"
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

        {operation.source_location_id && (
          <div>
            <label className="text-sm font-medium text-gray-700">Source</label>
            <p className="mt-1 text-sm text-gray-900">{operation.source_location_id}</p>
          </div>
        )}

        {operation.destination_location_id && (
          <div>
            <label className="text-sm font-medium text-gray-700">Destination</label>
            <p className="mt-1 text-sm text-gray-900">{operation.destination_location_id}</p>
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
                <p className="font-medium">{item.products?.name || "Unknown"}</p>
                <p className="text-sm text-gray-500">{item.products?.sku}</p>
              </div>
              <p className="font-medium">
                {item.quantity} {item.products?.uom || "pcs"}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
