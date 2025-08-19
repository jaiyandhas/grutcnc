import { useState } from "react";
import { Package, AlertTriangle, CheckCircle, Clock, Play, Upload, Filter, Wrench, Brain, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSpares, useSimulateSpareWear, useLoadSparesFromCSV } from "@/hooks/use-spares";
import { SpareCard } from "@/components/spare-card";
import { LiveIndicator } from "@/components/live-indicator";
import { useToast } from "@/hooks/use-toast";
import type { CriticalSpare } from "@shared/schema";

type FilterType = 'all' | 'green' | 'yellow' | 'red';

export function SparesDashboard() {
  const { data: spares = [], isLoading } = useSpares();
  const simulateWear = useSimulateSpareWear();
  const loadSpares = useLoadSparesFromCSV();
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterType>('all');

  const getSpareStatus = (spare: CriticalSpare) => {
    const remainingLife = Math.max(0, 100 - (spare.wearPercentage || 0));
    const isLowStock = (spare.quantityInHand || 0) < (spare.reorderLevel || 2);
    
    if (remainingLife < 20 || isLowStock) return 'red';
    if (remainingLife >= 20 && remainingLife <= 40) return 'yellow';
    return 'green';
  };

  const filteredSpares = spares.filter(spare => {
    if (filter === 'all') return true;
    return getSpareStatus(spare) === filter;
  });

  // Calculate stats
  const totalSpares = spares.length;
  const greenCount = spares.filter(s => getSpareStatus(s) === 'green').length;
  const yellowCount = spares.filter(s => getSpareStatus(s) === 'yellow').length;
  const redCount = spares.filter(s => getSpareStatus(s) === 'red').length;

  const handleSimulateWear = async () => {
    try {
      await simulateWear.mutateAsync();
      toast({
        title: "Wear simulation completed",
        description: "All critical spares have been updated. Check alerts for any new warnings.",
      });
    } catch (error) {
      toast({
        title: "Simulation failed",
        description: "Failed to simulate spare wear. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLoadSpares = async () => {
    try {
      const result = await loadSpares.mutateAsync();
      toast({
        title: "CSV data loaded successfully",
        description: `Loaded ${(result as any)?.spares?.length || 0} critical spares from CSV.`,
      });
    } catch (error) {
      toast({
        title: "Failed to load CSV",
        description: "Could not load spares from CSV file. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading critical spares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-gray-100 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-gray-100"
                  data-testid="nav-back-machines"
                >
                  <ArrowLeft size={16} />
                  <Brain size={16} />
                  <span>Machines</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Critical Spares Inventory</h1>
                <LiveIndicator />
              </div>
            </div>
            <div className="flex space-x-3 mt-4 lg:mt-0">
              <Button 
                onClick={handleLoadSpares}
                disabled={loadSpares.isPending}
                className="bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2"
                data-testid="button-load-csv"
              >
                {loadSpares.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Upload size={16} />
                )}
                <span>Load CSV Data</span>
              </Button>
              
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
                <span>Simulate Wear</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spares</p>
                  <p className="text-3xl font-bold text-gray-900" data-testid="stat-total-spares">{totalSpares}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100/70 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Package className="text-blue-600" size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 via-transparent to-green-50/10 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Good Condition</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="stat-green">{greenCount}</p>
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
                  <p className="text-sm font-medium text-gray-600">Needs Attention</p>
                  <p className="text-3xl font-bold text-amber-600" data-testid="stat-yellow">{yellowCount}</p>
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
                  <p className="text-3xl font-bold text-red-600" data-testid="stat-red">{redCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-100/70 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-red-500" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="flex items-center space-x-2"
              data-testid="filter-all"
            >
              <Filter size={16} />
              <span>All ({totalSpares})</span>
            </Button>
            <Button
              variant={filter === 'green' ? 'default' : 'outline'}
              onClick={() => setFilter('green')}
              className="flex items-center space-x-2 border-green-200 text-green-700 hover:bg-green-50"
              data-testid="filter-green"
            >
              <CheckCircle size={16} />
              <span>Good ({greenCount})</span>
            </Button>
            <Button
              variant={filter === 'yellow' ? 'default' : 'outline'}
              onClick={() => setFilter('yellow')}
              className="flex items-center space-x-2 border-amber-200 text-amber-700 hover:bg-amber-50"
              data-testid="filter-yellow"
            >
              <Clock size={16} />
              <span>Warning ({yellowCount})</span>
            </Button>
            <Button
              variant={filter === 'red' ? 'default' : 'outline'}
              onClick={() => setFilter('red')}
              className="flex items-center space-x-2 border-red-200 text-red-700 hover:bg-red-50"
              data-testid="filter-red"
            >
              <AlertTriangle size={16} />
              <span>Critical ({redCount})</span>
            </Button>
          </div>

          {/* Spares Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpares.map((spare) => (
              <SpareCard
                key={spare.id}
                spare={spare}
                status={getSpareStatus(spare)}
              />
            ))}
            {filteredSpares.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-500">
                <Package size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No spares found</p>
                <p className="text-sm">Load CSV data to get started with predictive maintenance.</p>
                <Button 
                  onClick={handleLoadSpares} 
                  className="mt-4 bg-green-600 hover:bg-green-700"
                  data-testid="button-load-first-csv"
                >
                  <Upload className="mr-2" size={16} />
                  Load CSV Data
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}