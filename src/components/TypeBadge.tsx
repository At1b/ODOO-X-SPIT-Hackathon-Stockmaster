import { OperationType } from '../store/operationsStore';

interface TypeBadgeProps {
  type: OperationType;
}

export const TypeBadge = ({ type }: TypeBadgeProps) => {
  const typeConfig = {
    receipt: {
      label: 'Receipt',
      className: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    delivery: {
      label: 'Delivery',
      className: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    transfer: {
      label: 'Transfer',
      className: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    },
  };

  const config = typeConfig[type];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};


