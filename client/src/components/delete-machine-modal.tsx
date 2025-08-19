import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteMachine } from "@/hooks/use-machines";
import { useToast } from "@/hooks/use-toast";
import type { Machine } from "@shared/schema";

interface DeleteMachineModalProps {
  machine: Machine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMachineModal({ machine, open, onOpenChange }: DeleteMachineModalProps) {
  const deleteMachine = useDeleteMachine();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!machine) return;
    
    try {
      await deleteMachine.mutateAsync(machine.id);
      toast({
        title: "Machine deleted successfully",
        description: `${machine.name} has been removed from the system.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to delete machine",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!machine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" data-testid="delete-machine-modal">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-lg mb-4">
            <Trash2 className="text-red-500" size={20} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Machine
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete <strong>{machine.name}</strong>? This action cannot be undone.
          </p>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={deleteMachine.isPending}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              data-testid="button-confirm-delete"
            >
              {deleteMachine.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
