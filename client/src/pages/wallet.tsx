import { useQuery } from "@tanstack/react-query";
import { Wallet as WalletIcon, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "@shared/schema";

export default function WalletPage() {
  const { toast } = useToast();
  const { data: wallet, isLoading } = useQuery<Wallet>({
    queryKey: ["/api/wallet"],
  });

  const handleCopyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-purple-pink text-gradient">
              Wallet
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your agent's payment wallet
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-8 py-8 max-w-4xl">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading wallet...</p>
          </div>
        ) : !wallet ? (
          <Card>
            <CardContent className="p-12 text-center">
              <WalletIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No Wallet Connected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect a wallet to enable agent transactions
              </p>
              <Button data-testid="button-connect-wallet">Connect Wallet</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">Wallet Balance</CardTitle>
                    <CardDescription>Current available funds</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2" data-testid="text-wallet-balance">
                  ${parseFloat(wallet.balance).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">{wallet.currency}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wallet Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Network</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{wallet.network}</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-3 bg-muted rounded-md font-mono text-sm" data-testid="text-wallet-address">
                      {wallet.address}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyAddress}
                      data-testid="button-copy-address"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(`https://sepolia.basescan.org/address/${wallet.address}`, '_blank')}
                      data-testid="button-view-explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm mt-1">
                    {new Date(wallet.updatedAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Configured payment integrations for your agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <span className="text-blue-500 font-bold">CB</span>
                    </div>
                    <div>
                      <p className="font-medium">Coinbase x402</p>
                      <p className="text-xs text-muted-foreground">Micropayments via HTTP</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Connected
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <span className="text-purple-500 font-bold">LC</span>
                    </div>
                    <div>
                      <p className="font-medium">Locus</p>
                      <p className="text-xs text-muted-foreground">Payment infrastructure & controls</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
