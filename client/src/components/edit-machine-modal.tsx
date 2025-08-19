import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateMachine } from "@/hooks/use-machines";
import { useToast } from "@/hooks/use-toast";
import { updateMachineSchema, type UpdateMachine, type Machine } from "@shared/schema";

interface EditMachineModalProps {
  machine: Machine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMachineModal({ machine, open, onOpenChange }: EditMachineModalProps) {
  const updateMachine = useUpdateMachine();
  const { toast } = useToast();

  const form = useForm<UpdateMachine>({
    resolver: zodResolver(updateMachineSchema),
    defaultValues: {
      name: "",
      componentType: "Ball Screw",
      operatingHours: 0,
      loadFactor: 0.75,
      replacementCost: 50000,
    },
  });

  useEffect(() => {
    if (machine) {
      form.reset({
        name: machine.name,
        componentType: machine.componentType as "Ball Screw" | "LM Guideway" | "Tool Magazine" | "Spindle Motor",
        operatingHours: machine.operatingHours,
        loadFactor: machine.loadFactor,
        replacementCost: machine.replacementCost || 50000,
      });
    }
  }, [machine, form]);

  const onSubmit = async (data: UpdateMachine) => {
    if (!machine) return;
    
    try {
      await updateMachine.mutateAsync({ id: machine.id, data });
      toast({
        title: "Machine updated successfully",
        description: `${data.name} has been updated.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to update machine",
        description: "Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  if (!machine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="edit-machine-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Edit Machine
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Machine Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      data-testid="input-edit-machine-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="componentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Component Type
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        data-testid="select-edit-component-type"
                      >
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ball Screw">Ball Screw</SelectItem>
                      <SelectItem value="LM Guideway">LM Guideway</SelectItem>
                      <SelectItem value="Tool Magazine">Tool Magazine</SelectItem>
                      <SelectItem value="Spindle Motor">Spindle Motor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="operatingHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Operating Hours
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      data-testid="input-edit-operating-hours"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="loadFactor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Load Factor
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      data-testid="input-edit-load-factor"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="replacementCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Replacement Cost (₹)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="1000"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      data-testid="input-edit-replacement-cost"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMachine.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                data-testid="button-submit-edit"
              >
                {updateMachine.isPending ? "Updating..." : "Update Machine"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
