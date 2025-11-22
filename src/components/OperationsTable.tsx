import { Operation } from '../store/operationsStore';
import { StatusBadge } from './StatusBadge';
import { TypeBadge } from './TypeBadge';
import { Stepper } from './Stepper';
import { format } from 'date-fns';

interface OperationsTableProps {
  operations: Operation[];
  onValidate?: (id: string) => void;
  onView?: (id: string) => void;
}

export const OperationsTable = ({
  operations,
  onValidate,
  onView,
}: OperationsTableProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Operation ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {operations.map((operation) => (
              <tr
                key={String(operation.id)}
                className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                {/* ID as string so .slice() never crashes */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                    {String(operation.id).slice(0, 8)}...
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <TypeBadge type={operation.type} />
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={operation.status} />
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {operation.operation_items?.length ?? 0} item(s)
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {operation.type === 'receipt' && operation.destination_location && (
                    <div>
                      <div className="font-medium dark:text-gray-200">
                        {operation.destination_location.name}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {operation.destination_location.warehouses?.name}
                      </div>
                    </div>
                  )}

                  {operation.type === 'delivery' && operation.source_location && (
                    <div>
                      <div className="font-medium">
                        {operation.source_location.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {operation.source_location.warehouses?.name}
                      </div>
                    </div>
                  )}

                  {operation.type === 'transfer' && (
                    <div>
                      <div className="text-xs">
                        <span className="font-medium">From:</span>{' '}
                        {operation.source_location?.name}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">To:</span>{' '}
                        {operation.destination_location?.name}
                      </div>
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {operation.created_at
                    ? format(new Date(operation.created_at), 'MMM dd, yyyy HH:mm')
                    : '—'}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    {onView && (
                      <button
                        onClick={() => onView(String(operation.id))}
                        className="px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors font-medium"
                      >
                        View
                      </button>
                    )}

                    {operation.status !== 'done' && onValidate && (
                      <button
                        onClick={() => onValidate(String(operation.id))}
                        className="px-3 py-1.5 text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-lg transition-colors font-medium shadow-sm"
                      >
                        Validate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
