import { useState } from "react";
import { Package, AlertTriangle, Clock, TrendingDown, Calendar, DollarSign, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MaintenanceModal } from "@/components/maintenance-modal";
import { formatDistanceToNow } from "date-fns";
import type { CriticalSpare } from "@shared/schema";

interface SpareCardProps {
  spare: CriticalSpare;
  status: 'green' | 'yellow' | 'red';
}

export function SpareCard({ spare, status }: SpareCardProps) {
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  
  const remainingLifePercentage = Math.max(0, 100 - (spare.wearPercentage || 0));
  
  const getStatusColor = () => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
    }
  };

  const getStatusBadge = () => {
    const isLowStock = (spare.quantityInHand || 0) < (spare.reorderLevel || 2);
    if (remainingLifePercentage < 20) {
      return <Badge variant="destructive" className="mb-2">Critical Wear</Badge>;
    }
    if (isLowStock) {
      return <Badge variant="destructive" className="mb-2">Low Stock</Badge>;
    }
    if (remainingLifePercentage <= 40) {
      return <Badge variant="secondary" className="mb-2 bg-amber-100 text-amber-800">Needs Attention</Badge>;
    }
    return <Badge variant="secondary" className="mb-2 bg-green-100 text-green-800">Good Condition</Badge>;
  };

  const getStatusIcon = () => {
    if (remainingLifePercentage < 20) return <AlertTriangle className="text-red-500" size={20} />;
    if (remainingLifePercentage <= 40) return <Clock className="text-amber-500" size={20} />;
    return <Package className="text-green-500" size={20} />;
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        {/* Status indicator */}
        <div className={`absolute top-0 left-0 w-full h-1 ${getStatusColor()}`} />
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
        
        <div className="relative z-10">
          {getStatusBadge()}
          
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-tight line-clamp-2" data-testid={`spare-title-${spare.itemCode}`}>
                {spare.itemDescription}
              </h3>
              <p className="text-sm text-gray-600 font-mono" data-testid={`spare-code-${spare.itemCode}`}>{spare.itemCode}</p>
            </div>
            {getStatusIcon()}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Remaining Life</span>
              <span className="font-medium" data-testid={`spare-life-${spare.itemCode}`}>{remainingLifePercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={remainingLifePercentage} 
              className="h-3 bg-gray-200"
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Package size={16} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Stock</p>
                  <p className="text-sm font-semibold text-gray-900" data-testid={`spare-stock-${spare.itemCode}`}>
                    {spare.quantityInHand || 0} {spare.unit}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <DollarSign size={16} className="text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Cost</p>
                  <p className="text-sm font-semibold text-gray-900" data-testid={`spare-cost-${spare.itemCode}`}>
                    ₹{(spare.replacementCostInr || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Details */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Operating Hours:</span>
              <span className="font-medium" data-testid={`spare-hours-${spare.itemCode}`}>{(spare.operatingHours || 0).toLocaleString()}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Load Factor:</span>
              <span className="font-medium" data-testid={`spare-load-${spare.itemCode}`}>{((spare.loadFactor || 0) * 100).toFixed(0)}%</span>
            </div>
            {spare.predictedReplacementDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Next Service:</span>
                <span className="font-medium text-orange-600" data-testid={`spare-service-${spare.itemCode}`}>
                  {formatDistanceToNow(new Date(spare.predictedReplacementDate), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowMaintenanceModal(true)}
              className="flex-1 flex items-center justify-center space-x-2 hover:bg-blue-50"
              data-testid={`button-maintenance-${spare.itemCode}`}
            >
              <Wrench size={14} />
              <span>Maintenance</span>
            </Button>
            
            {(remainingLifePercentage < 40 || (spare.quantityInHand || 0) < (spare.reorderLevel || 2)) && (
              <Button 
                size="sm" 
                className="flex-1 flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700"
                data-testid={`button-order-${spare.itemCode}`}
              >
                <ArrowRight size={14} />
                <span>Order Now</span>
              </Button>
            )}
          </div>

          {/* Critical warning */}
          {remainingLifePercentage < 20 && (
            <div className="mt-3 p-3 bg-red-50/70 backdrop-blur-sm rounded-lg border border-red-200/50">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={16} className="text-red-600" />
                <p className="text-sm text-red-800 font-medium">Immediate replacement required</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <MaintenanceModal
        spare={spare}
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
      />
    </>
  );
}