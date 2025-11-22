import { useEffect, useState } from 'react';
import { useOperationsStore } from '../store/operationsStore';
import { useDataStore } from '../store/dataStore';
import { OperationFilters } from '../components/OperationFilters';
import { OperationsTable } from '../components/OperationsTable';
import { Modal } from '../components/Modal';
import { ReceiptForm } from '../components/forms/ReceiptForm';
import { StatsCard } from '../components/StatsCard';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { StatsDetailModal } from '../components/StatsDetailModal';
import { Plus, Package, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Operation } from '../store/operationsStore';
import { fetchProducts, fetchLocations, fetchWarehouses } from '../services/dataService';

export const ReceiptsPage = () => {
  const { operations, loading, fetchOperations } = useOperationsStore();
  const { setProducts, setLocations } = useDataStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    title: '',
    operations: [] as Operation[],
  });

  // Load ALL operations
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
      console.error('Failed to load data:', error);
    }
  };

  const receipts = operations.filter((op) => op.type === 'receipt');

  // Stats
  const stats = {
    total: receipts.length,
    done: receipts.filter((op) => op.status === 'done').length,
    draft: receipts.filter((op) => op.status === 'draft').length,
    waiting: receipts.filter((op) => op.status === 'waiting').length,
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchOperations();
  };

  const handleValidate = async (id: string) => {
    alert("Validation backend not implemented yet for MySQL version.");
  };

  const handleView = (id: string) => {
    const op = operations.find((o) => o.id === id);
    setSelectedOperation(op || null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Receipts</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Manage incoming stock operations and track inventory receipts
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Receipt
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Total Receipts" value={stats.total} icon={Package} color="blue"
              onClick={() => setDetailModal({ isOpen: true, title: 'All Receipts', operations: receipts })} />
            <StatsCard title="Completed" value={stats.done} icon={CheckCircle} color="green"
              onClick={() => setDetailModal({ isOpen: true, title: 'Completed Receipts', operations: receipts.filter(op => op.status === 'done') })} />
            <StatsCard title="In Draft" value={stats.draft} icon={Clock} color="yellow"
              onClick={() => setDetailModal({ isOpen: true, title: 'Draft Receipts', operations: receipts.filter(op => op.status === 'draft') })} />
            <StatsCard title="Waiting" value={stats.waiting} icon={TrendingUp} color="purple"
              onClick={() => setDetailModal({ isOpen: true, title: 'Waiting Receipts', operations: receipts.filter(op => op.status === 'waiting') })} />
          </div>
        </div>

        <OperationFilters />

        {loading ? (
          <TableSkeleton />
        ) : receipts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Receipts Found"
            description="Get started by creating your first receipt."
            action={{
              label: 'Create Receipt',
              onClick: () => setIsCreateModalOpen(true),
            }}
          />
        ) : (
          <OperationsTable operations={receipts} onValidate={handleValidate} onView={handleView} />
        )}

        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Receipt" size="lg">
          <ReceiptForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateModalOpen(false)} />
        </Modal>

      </div>
    </div>
  );
};
