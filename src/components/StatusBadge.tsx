import { OperationStatus } from '../store/operationsStore';

interface StatusBadgeProps {
  status: OperationStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    draft: {
      label: 'Draft',
      className: 'bg-gray-100 text-gray-800 border-gray-300',
    },
    waiting: {
      label: 'Waiting',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    },
    done: {
      label: 'Done',
      className: 'bg-green-100 text-green-800 border-green-300',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};


