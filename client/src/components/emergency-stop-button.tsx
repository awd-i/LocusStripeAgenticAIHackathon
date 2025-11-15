import { useState } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface EmergencyStopButtonProps {
  isActive: boolean;
  onToggle: (active: boolean) => Promise<void>;
}

export function EmergencyStopButton({ isActive, onToggle }: EmergencyStopButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onToggle(!isActive);
      toast({
        title: isActive ? "Emergency Stop Deactivated" : "Emergency Stop Activated",
        description: isActive 
          ? "Agent transactions have been resumed."
          : "All agent transactions have been halted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle emergency stop.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDialog(false);
    }
  };

  return (
    <>
      <Button
        variant={isActive ? "default" : "destructive"}
        size="default"
        onClick={() => setShowDialog(true)}
        disabled={isLoading}
        data-testid="button-emergency-stop"
        className="gap-2"
      >
        <AlertOctagon className="h-4 w-4" />
        {isActive ? "Deactivate Emergency Stop" : "Emergency Stop"}
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-destructive" />
              {isActive ? "Deactivate Emergency Stop?" : "Activate Emergency Stop?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isActive ? (
                <>
                  This will resume all agent transactions. The AI agent will be able to process
                  payments and make autonomous decisions according to your configured limits.
                </>
              ) : (
                <>
                  This will immediately halt all agent transactions. No new payments will be
                  processed until you deactivate emergency stop. Pending transactions will be
                  cancelled.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-emergency">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={isActive ? "" : "bg-destructive hover:bg-destructive/90"}
              data-testid="button-confirm-emergency"
            >
              {isActive ? "Deactivate" : "Activate Emergency Stop"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
