import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function KPICard({ title, value, icon: Icon, trend, description }: KPICardProps) {
  return (
  <div className="bg-card text-card-foreground rounded-xl p-4 shadow-sm hover:shadow-md transition animate-fade-slide">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-300 uppercase tracking-wide">{title}</div>
          <div className="text-2xl md:text-3xl font-extrabold mt-2">{value}</div>
          {description && <div className="text-sm text-gray-400 mt-1">{description}</div>}
        </div>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
