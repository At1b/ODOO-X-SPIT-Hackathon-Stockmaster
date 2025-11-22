import { Modal } from './Modal';
import { Operation } from '../store/operationsStore';
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { TypeBadge } from './TypeBadge';

interface StatsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  operations: Operation[];
  type: 'receipt' | 'delivery' | 'transfer';
}

export const StatsDetailModal = ({
  isOpen,
  onClose,
  title,
  operations,
  type,
}: StatsDetailModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="max-h-96 overflow-y-auto">
        {operations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No operations found
          </div>
        ) : (
          <div className="space-y-3">
            {operations.map((operation) => (
              <div
                key={operation.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <TypeBadge type={operation.type} />
                    <StatusBadge status={operation.status} />
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {operation.id.slice(0, 8)}...
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(operation.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  {operation.supplier && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Supplier</p>
                      <p className="text-sm font-medium dark:text-gray-200">{operation.supplier}</p>
                    </div>
                  )}
                  {operation.customer && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</p>
                      <p className="text-sm font-medium dark:text-gray-200">{operation.customer}</p>
                    </div>
                  )}
                  {operation.source_location && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Source</p>
                      <p className="text-sm font-medium dark:text-gray-200">
                        {operation.source_location.name}
                      </p>
                      {operation.source_location.warehouses && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {operation.source_location.warehouses.name}
                        </p>
                      )}
                    </div>
                  )}
                  {operation.destination_location && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Destination</p>
                      <p className="text-sm font-medium dark:text-gray-200">
                        {operation.destination_location.name}
                      </p>
                      {operation.destination_location.warehouses && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {operation.destination_location.warehouses.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Items ({operation.operation_items.length})</p>
                  <div className="space-y-1">
                    {operation.operation_items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm bg-white dark:bg-gray-900 px-2 py-1 rounded"
                      >
                        <span className="dark:text-gray-200">
                          {item.products?.name || 'Unknown'}
                        </span>
                        <span className="font-medium dark:text-gray-200">
                          {item.quantity} {item.products?.uom || 'pcs'}
                        </span>
                      </div>
                    ))}
                    {operation.operation_items.length > 3 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        +{operation.operation_items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};


