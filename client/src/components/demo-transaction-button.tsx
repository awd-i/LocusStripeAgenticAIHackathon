import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const demoTransactions = [
  { merchant: "Amazon", amount: "45.99", type: "purchase", description: "Office supplies" },
  { merchant: "Netflix", amount: "15.99", type: "subscription", description: "Monthly subscription" },
  { merchant: "OpenAI", amount: "20.00", type: "payment", description: "API usage" },
  { merchant: "Anthropic", amount: "150.00", type: "subscription", description: "Claude API Pro plan" },
  { merchant: "Stripe", amount: "5.50", type: "payment", description: "Transaction fees" },
];

export function DemoTransactionButton() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    merchant: "",
    amount: "",
    type: "purchase",
    description: "",
  });
  const { toast } = useToast();

  const handleQuickDemo = async () => {
    const randomTx = demoTransactions[Math.floor(Math.random() * demoTransactions.length)];
    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/transactions", {
        ...randomTx,
        currency: "USDC",
      });

      toast({
        title: "Transaction Created",
        description: `Demo transaction for ${randomTx.merchant} has been created.`,
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create demo transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/transactions", {
        ...formData,
        currency: "USDC",
      });

      toast({
        title: "Transaction Created",
        description: `Transaction for ${formData.merchant} has been created.`,
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });

      setOpen(false);
      setFormData({ merchant: "", amount: "", type: "purchase", description: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleQuickDemo}
        disabled={isSubmitting}
        data-testid="button-quick-demo"
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Quick Demo Transaction
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button data-testid="button-create-transaction" className="gap-2">
            <Plus className="h-4 w-4" />
            New Transaction
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Transaction</DialogTitle>
            <DialogDescription>
              Create a new transaction for the AI agent to process
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCustomSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="merchant">Merchant</Label>
                <Input
                  id="merchant"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  placeholder="e.g., Amazon"
                  required
                  data-testid="input-merchant"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  data-testid="input-amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Transaction description"
                  data-testid="input-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} data-testid="button-submit-transaction">
                {isSubmitting ? "Creating..." : "Create Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
