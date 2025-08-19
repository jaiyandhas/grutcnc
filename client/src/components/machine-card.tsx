import { Settings, Edit2, Trash2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Machine } from "@shared/schema";

interface MachineCardProps {
  machine: Machine;
  onEdit: (machine: Machine) => void;
  onDelete: (machine: Machine) => void;
}

export function MachineCard({ machine, onEdit, onDelete }: MachineCardProps) {
  const getStatusColor = (life: number) => {
    if (life > 60) return "green";
    if (life >= 20) return "amber";
    return "red";
  };

  const getStatusIcon = (life: number) => {
    if (life > 60) return <CheckCircle size={18} className="text-green-500" />;
    if (life >= 20) return <Clock size={18} className="text-amber-500" />;
    return <AlertTriangle size={18} className="text-red-500" />;
  };

  const getStatusMessage = (life: number) => {
    if (life > 60) return "Optimal Performance";
    if (life >= 20) return "Monitor Closely";
    return "Critical - Maintenance Required";
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case "Ball Screw":
        return <Settings size={18} />;
      case "LM Guideway":
        return <Settings size={18} />;
      case "Tool Magazine":
        return <Settings size={18} />;
      case "Spindle Motor":
        return <Settings size={18} />;
      default:
        return <Settings size={18} />;
    }
  };

  const statusColor = getStatusColor(machine.remainingLife);
  const statusIcon = getStatusIcon(machine.remainingLife);
  const statusMessage = getStatusMessage(machine.remainingLife);

  return (
    <div 
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
      data-testid={`machine-card-${machine.id}`}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
      
      {/* Pulsing status indicator */}
      {machine.remainingLife < 20 && (
        <div className="absolute top-4 right-4">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              statusColor === 'green' ? 'bg-green-100 text-green-500' :
              statusColor === 'amber' ? 'bg-amber-100 text-amber-500' :
              'bg-red-100 text-red-500'
            }`}>
              {getComponentIcon(machine.componentType)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900" data-testid={`machine-name-${machine.id}`}>
                {machine.name}
              </h3>
              <p className="text-sm text-gray-600" data-testid={`machine-component-${machine.id}`}>
                {machine.componentType}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(machine)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
              data-testid={`button-edit-${machine.id}`}
            >
              <Edit2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(machine)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
              data-testid={`button-delete-${machine.id}`}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Remaining Life</span>
            <span 
              className={`text-lg font-bold ${
                statusColor === 'green' ? 'text-green-500' :
                statusColor === 'amber' ? 'text-amber-500' :
                'text-red-500'
              }`}
              data-testid={`remaining-life-${machine.id}`}
            >
              {Math.round(machine.remainingLife)}%
            </span>
          </div>
          <Progress 
            value={machine.remainingLife} 
            className={`h-3 ${
              statusColor === 'green' ? '[&>[data-state=complete]]:bg-green-500' :
              statusColor === 'amber' ? '[&>[data-state=complete]]:bg-amber-500' :
              '[&>[data-state=complete]]:bg-red-500'
            }`}
            data-testid={`progress-${machine.id}`}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-600">Operating Hours</p>
            <p className="font-semibold text-gray-900" data-testid={`operating-hours-${machine.id}`}>
              {machine.operatingHours.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Load Factor</p>
            <p className="font-semibold text-gray-900" data-testid={`load-factor-${machine.id}`}>
              {machine.loadFactor.toFixed(2)}
            </p>
          </div>
        </div>
        
        {machine.remainingLife < 20 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={16} className="text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-600">Replacement Cost</p>
                <p className="text-lg font-bold text-red-700" data-testid={`replacement-cost-${machine.id}`}>
                  ₹{machine.replacementCost?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className={`p-3 rounded-lg ${
          statusColor === 'green' ? 'bg-green-50' :
          statusColor === 'amber' ? 'bg-amber-50' :
          'bg-red-50'
        }`}>
          <div className="flex items-center space-x-2">
            {statusIcon}
            <span className={`text-sm font-medium ${
              statusColor === 'green' ? 'text-green-600' :
              statusColor === 'amber' ? 'text-amber-600' :
              'text-red-600'
            }`} data-testid={`status-message-${machine.id}`}>
              {statusMessage}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}