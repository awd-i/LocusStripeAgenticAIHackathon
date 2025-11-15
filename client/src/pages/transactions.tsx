import { useQuery } from "@tanstack/react-query";
import { CreditCard, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TransactionRow } from "@/components/transaction-row";
import { ThemeToggle } from "@/components/theme-toggle";
import { TransactionWithCall } from "@shared/schema";
import { useState } from "react";

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: transactions, isLoading } = useQuery<TransactionWithCall[]>({
    queryKey: ["/api/transactions"],
  });

  const filteredTransactions = transactions?.filter((t) => {
    const search = searchQuery.toLowerCase();
    return (
      t.merchant?.toLowerCase().includes(search) ||
      t.description?.toLowerCase().includes(search) ||
      t.id.toLowerCase().includes(search) ||
      t.status.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-purple-pink text-gradient">
              Transactions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage all agent transactions
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                All Transactions
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-transactions"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading transactions...
              </div>
            ) : !filteredTransactions || filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">
                  {searchQuery ? "No transactions match your search" : "No transactions yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredTransactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
