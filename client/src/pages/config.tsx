import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings, Save, DollarSign, Shield, Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { AgentConfig } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Config() {
  const { toast } = useToast();
  const { data: config, isLoading } = useQuery<AgentConfig>({
    queryKey: ["/api/config"],
  });

  const [formData, setFormData] = useState({
    name: config?.name || "Transaction Agent",
    approvalThreshold: config?.approvalThreshold || "100.00",
    dailySpendLimit: config?.dailySpendLimit || "1000.00",
    monthlySpendLimit: config?.monthlySpendLimit || "5000.00",
    autoApprovalEnabled: config?.autoApprovalEnabled ?? true,
    voiceNotificationsEnabled: config?.voiceNotificationsEnabled ?? true,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AgentConfig>) => apiRequest("PATCH", "/api/config", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Configuration Updated",
        description: "Your agent settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update configuration.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-blue-cyan text-gradient">
              Agent Configuration
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customize your AI agent's behavior and limits
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-8 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="spending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="spending" data-testid="tab-spending">
                <DollarSign className="h-4 w-4 mr-2" />
                Spending Limits
              </TabsTrigger>
              <TabsTrigger value="permissions" data-testid="tab-permissions">
                <Shield className="h-4 w-4 mr-2" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="notifications" data-testid="tab-notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="spending" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Spending Limits</CardTitle>
                  <CardDescription>
                    Set maximum transaction amounts and daily/monthly limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="approvalThreshold">Approval Threshold (USD)</Label>
                    <Input
                      id="approvalThreshold"
                      type="number"
                      step="0.01"
                      value={formData.approvalThreshold}
                      onChange={(e) => setFormData({ ...formData, approvalThreshold: e.target.value })}
                      data-testid="input-approval-threshold"
                    />
                    <p className="text-xs text-muted-foreground">
                      Transactions above this amount require voice call approval
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dailyLimit">Daily Spend Limit (USD)</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      step="0.01"
                      value={formData.dailySpendLimit}
                      onChange={(e) => setFormData({ ...formData, dailySpendLimit: e.target.value })}
                      data-testid="input-daily-limit"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum amount the agent can spend per day
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyLimit">Monthly Spend Limit (USD)</Label>
                    <Input
                      id="monthlyLimit"
                      type="number"
                      step="0.01"
                      value={formData.monthlySpendLimit}
                      onChange={(e) => setFormData({ ...formData, monthlySpendLimit: e.target.value })}
                      data-testid="input-monthly-limit"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum amount the agent can spend per month
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Permissions</CardTitle>
                  <CardDescription>
                    Control what actions your agent can perform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoApproval">Auto-Approval</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically approve transactions below threshold
                      </p>
                    </div>
                    <Switch
                      id="autoApproval"
                      checked={formData.autoApprovalEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, autoApprovalEnabled: checked })
                      }
                      data-testid="switch-auto-approval"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agentName">Agent Name</Label>
                    <Input
                      id="agentName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-agent-name"
                    />
                    <p className="text-xs text-muted-foreground">
                      The name your agent uses when calling
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Voice Notifications</CardTitle>
                  <CardDescription>
                    Configure when the agent should call you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="voiceNotifications">Voice Call Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive voice calls for important transactions
                      </p>
                    </div>
                    <Switch
                      id="voiceNotifications"
                      checked={formData.voiceNotificationsEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, voiceNotificationsEnabled: checked })
                      }
                      data-testid="switch-voice-notifications"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-6 sticky bottom-0 bg-background py-4 border-t border-border">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              data-testid="button-save-config"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
