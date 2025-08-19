import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMachine } from "@/hooks/use-machines";
import { useToast } from "@/hooks/use-toast";
import { insertMachineSchema, type InsertMachine } from "@shared/schema";

interface AddMachineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMachineModal({ open, onOpenChange }: AddMachineModalProps) {
  const createMachine = useCreateMachine();
  const { toast } = useToast();

  const form = useForm<InsertMachine>({
    resolver: zodResolver(insertMachineSchema),
    defaultValues: {
      name: "",
      componentType: "Ball Screw",
      initialLife: 100,
      operatingHours: 0,
      loadFactor: 0.75,
      replacementCost: 50000,
    },
  });

  const onSubmit = async (data: InsertMachine) => {
    try {
      await createMachine.mutateAsync(data);
      toast({
        title: "Machine added successfully",
        description: `${data.name} has been added to the system.`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to add machine",
        description: "Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="add-machine-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Add New Machine
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
                      placeholder="CNC-005"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      data-testid="input-machine-name"
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        data-testid="select-component-type"
                      >
                        <SelectValue placeholder="Select Component" />
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
              name="initialLife"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Initial Life (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      max="100"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      data-testid="input-initial-life"
                    />
                  </FormControl>
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
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      data-testid="input-operating-hours"
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
                      placeholder="0.75"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      data-testid="input-load-factor"
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
                      placeholder="50000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      data-testid="input-replacement-cost"
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
                data-testid="button-cancel-add"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMachine.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                data-testid="button-submit-add"
              >
                {createMachine.isPending ? "Adding..." : "Add Machine"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
