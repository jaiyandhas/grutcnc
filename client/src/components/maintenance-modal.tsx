import { useState } from "react";
import { X, Wrench, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMaintenanceLog } from "@/hooks/use-spares";
import { useToast } from "@/hooks/use-toast";
import type { CriticalSpare, InsertMaintenanceLog } from "@shared/schema";

interface MaintenanceModalProps {
  spare: CriticalSpare;
  isOpen: boolean;
  onClose: () => void;
}

export function MaintenanceModal({ spare, isOpen, onClose }: MaintenanceModalProps) {
  const [formData, setFormData] = useState<Partial<InsertMaintenanceLog>>({
    spareId: spare.id,
    maintenanceType: 'inspection',
    quantityUsed: 1,
    cost: 0,
    notes: '',
    performedBy: '',
  });

  const createMaintenanceLog = useCreateMaintenanceLog();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.maintenanceType || !formData.performedBy) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMaintenanceLog.mutateAsync(formData as InsertMaintenanceLog);
      toast({
        title: "Maintenance log created",
        description: "The maintenance record has been saved successfully.",
      });
      onClose();
      setFormData({
        spareId: spare.id,
        maintenanceType: 'inspection',
        quantityUsed: 1,
        cost: 0,
        notes: '',
        performedBy: '',
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "Could not save the maintenance record. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: keyof InsertMaintenanceLog, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wrench size={20} className="text-blue-600" />
            <span>Maintenance Log</span>
          </DialogTitle>
        </DialogHeader>

        {/* Spare Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{spare.itemDescription}</h4>
          <p className="text-sm text-gray-600 font-mono">{spare.itemCode}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="maintenanceType">Maintenance Type *</Label>
            <Select 
              value={formData.maintenanceType} 
              onValueChange={(value) => handleChange('maintenanceType', value)}
            >
              <SelectTrigger data-testid="select-maintenance-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="replacement">Replacement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="performedBy">Performed By *</Label>
            <Input
              id="performedBy"
              value={formData.performedBy || ''}
              onChange={(e) => handleChange('performedBy', e.target.value)}
              placeholder="Technician name"
              data-testid="input-performed-by"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantityUsed">Quantity Used</Label>
              <Input
                id="quantityUsed"
                type="number"
                min="0"
                value={formData.quantityUsed || 1}
                onChange={(e) => handleChange('quantityUsed', parseInt(e.target.value) || 0)}
                data-testid="input-quantity-used"
              />
            </div>
            <div>
              <Label htmlFor="cost">Cost (₹)</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost || 0}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                data-testid="input-cost"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes or observations..."
              rows={3}
              data-testid="textarea-notes"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMaintenanceLog.isPending}
              className="flex-1"
              data-testid="button-save-maintenance"
            >
              {createMaintenanceLog.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                "Save Log"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}