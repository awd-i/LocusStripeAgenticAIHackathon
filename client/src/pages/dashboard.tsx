import { useQuery } from "@tanstack/react-query";
import { CreditCard, Phone, TrendingUp, DollarSign } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { TransactionRow } from "@/components/transaction-row";
import { VoiceActivityFeed } from "@/components/voice-activity-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmergencyStopButton } from "@/components/emergency-stop-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DemoTransactionButton } from "@/components/demo-transaction-button";
import { DashboardStats, TransactionWithCall, VoiceCall, AgentConfig } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Dashboard() {
  // Connect to WebSocket for real-time updates
  useWebSocket();
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery<TransactionWithCall[]>({
    queryKey: ["/api/transactions/recent"],
  });

  const { data: recentCalls, isLoading: callsLoading } = useQuery<VoiceCall[]>({
    queryKey: ["/api/calls/recent"],
  });

  const { data: config } = useQuery<AgentConfig>({
    queryKey: ["/api/config"],
  });

  const handleEmergencyStop = async (active: boolean) => {
    await apiRequest("PATCH", "/api/config", { emergencyStopActive: active });
    await queryClient.invalidateQueries({ queryKey: ["/api/config"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-purple-pink text-gradient">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor your AI agent's transaction activity
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DemoTransactionButton />
            <EmergencyStopButton
              isActive={config?.emergencyStopActive || false}
              onToggle={handleEmergencyStop}
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Transactions"
            value={stats?.totalTransactions || 0}
            description="All time"
            icon={CreditCard}
            isLoading={statsLoading}
          />
          <StatsCard
            title="Pending Approvals"
            value={stats?.pendingApprovals || 0}
            description="Awaiting confirmation"
            icon={TrendingUp}
            isLoading={statsLoading}
          />
          <StatsCard
            title="Active Calls"
            value={stats?.activeCalls || 0}
            description="Voice interactions"
            icon={Phone}
            isLoading={statsLoading}
          />
          <StatsCard
            title="Spent Today"
            value={stats?.totalSpentToday ? `$${parseFloat(stats.totalSpentToday).toFixed(2)}` : "$0.00"}
            description={`Monthly: $${stats?.totalSpentMonth ? parseFloat(stats.totalSpentMonth).toFixed(2) : "0.00"}`}
            icon={DollarSign}
            isLoading={statsLoading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card data-testid="card-recent-transactions">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {transactionsLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading transactions...
                  </div>
                ) : !recentTransactions || recentTransactions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No transactions yet</p>
                    <p className="text-xs mt-1">Transactions will appear here when your agent processes payments</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentTransactions.map((transaction) => (
                      <TransactionRow key={transaction.id} transaction={transaction} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <VoiceActivityFeed calls={recentCalls || []} isLoading={callsLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
