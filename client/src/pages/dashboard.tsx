import { useState } from "react";
import { Brain, Bell, Plus, Play, Settings, Trash2, AlertCircle, CheckCircle, Clock, Package } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useMachines, useSimulateWear, useAlerts } from "@/hooks/use-machines";
import { MachineCard } from "@/components/machine-card";
import { AddMachineModal } from "@/components/add-machine-modal";
import { EditMachineModal } from "@/components/edit-machine-modal";
import { DeleteMachineModal } from "@/components/delete-machine-modal";
import { SystemOverviewChart } from "@/components/system-overview-chart";
import { AlertsPanel } from "@/components/alerts-panel";
import { OverallWearTrendChart } from "@/components/overall-wear-trend-chart";
import { LiveIndicator } from "@/components/live-indicator";
import { useToast } from "@/hooks/use-toast";
import type { Machine } from "@shared/schema";

export default function Dashboard() {
  const { data: machines = [], isLoading } = useMachines();
  const { data: alerts = [] } = useAlerts();
  const simulateWear = useSimulateWear();
  const { toast } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [deletingMachine, setDeletingMachine] = useState<Machine | null>(null);

  // Calculate stats - Updated thresholds: Safe >60%, Warning 20-60%, Critical <20%
  const totalMachines = machines.length;
  const healthyCount = machines.filter(m => m.remainingLife > 60).length;
  const warningCount = machines.filter(m => m.remainingLife >= 20 && m.remainingLife <= 60).length;
  const criticalCount = machines.filter(m => m.remainingLife < 20).length;
  const recentAlerts = alerts.filter(a => a.severity === 'critical').length;

  const handleSimulateWear = async () => {
    try {
      await simulateWear.mutateAsync();
      toast({
        title: "Wear simulation completed",
        description: "All machines have been updated. Check alerts for any new warnings.",
      });
    } catch (error) {
      toast({
        title: "Simulation failed",
        description: "Failed to simulate wear. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-100 via-blue-50/30 to-gray-100 min-h-screen relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/30 fixed w-full top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                  <Brain className="text-white text-sm" size={16} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">TwinAI</h1>
                  <LiveIndicator />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/spares">
                <Button 
                  variant="outline"
                  size="sm" 
                  className="flex items-center space-x-2 hover:bg-blue-50 border-blue-200 text-blue-700"
                  data-testid="nav-spares"
                >
                  <Package size={16} />
                  <span>Critical Spares</span>
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                data-testid="notification-bell"
              >
                <Bell size={18} />
                {recentAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {recentAlerts}
                  </span>
                )}
              </Button>
              
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-brand-blue text-white hover:bg-blue-600 flex items-center space-x-2"
                data-testid="button-add-machine"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Machine</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Machines</p>
                  <p className="text-3xl font-bold text-gray-900" data-testid="stat-total-machines">{totalMachines}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100/70 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Settings className="text-brand-blue" size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 via-transparent to-green-50/10 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Healthy</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="stat-healthy">{healthyCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100/70 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-500" size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 via-transparent to-amber-50/10 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Warning</p>
                  <p className="text-3xl font-bold text-amber-600" data-testid="stat-warning">{warningCount}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100/70 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Clock className="text-amber-500" size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-100/20 via-transparent to-red-50/10 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-3xl font-bold text-red-600" data-testid="stat-critical">{criticalCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-100/70 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-red-500" size={20} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Overall Wear Trend Chart */}
          <div className="mb-8">
            <OverallWearTrendChart machines={machines} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Machines Grid */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Machine Status</h2>
                <Button 
                  onClick={handleSimulateWear}
                  disabled={simulateWear.isPending}
                  className="bg-gray-900 text-white hover:bg-gray-800 flex items-center space-x-2"
                  data-testid="button-simulate-wear"
                >
                  {simulateWear.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Play size={16} />
                  )}
                  <span>{simulateWear.isPending ? 'Simulating...' : 'Simulate Wear'}</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {machines.map((machine) => (
                  <MachineCard
                    key={machine.id}
                    machine={machine}
                    onEdit={setEditingMachine}
                    onDelete={setDeletingMachine}
                  />
                ))}
                {machines.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    <Settings size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No machines found</p>
                    <p className="text-sm">Add your first machine to get started with predictive maintenance.</p>
                    <Button 
                      onClick={() => setShowAddModal(true)} 
                      className="mt-4 bg-brand-blue hover:bg-blue-600"
                      data-testid="button-add-first-machine"
                    >
                      <Plus size={16} className="mr-2" />
                      Add First Machine
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Panels */}
            <div className="space-y-8">
              <SystemOverviewChart machines={machines} />
              <AlertsPanel alerts={alerts} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddMachineModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
      
      <EditMachineModal 
        machine={editingMachine}
        open={!!editingMachine}
        onOpenChange={() => setEditingMachine(null)}
      />
      
      <DeleteMachineModal 
        machine={deletingMachine}
        open={!!deletingMachine}
        onOpenChange={() => setDeletingMachine(null)}
      />
    </div>
  );
}
