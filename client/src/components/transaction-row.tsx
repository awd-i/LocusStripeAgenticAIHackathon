import { useState } from "react";
import { ChevronDown, Phone, Check, X, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TransactionWithCall } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface TransactionRowProps {
  transaction: TransactionWithCall;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
      approved: { variant: "outline" as const, className: "bg-green-500/10 text-green-500 border-green-500/20", icon: Check },
      rejected: { variant: "outline" as const, className: "bg-red-500/10 text-red-500 border-red-500/20", icon: X },
      completed: { variant: "outline" as const, className: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Check },
      failed: { variant: "outline" as const, className: "bg-red-500/10 text-red-500 border-red-500/20", icon: X },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <StatusIcon className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="border-b border-border last:border-0">
      <div
        className="flex items-center gap-4 p-4 hover-elevate cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
        data-testid={`transaction-row-${transaction.id}`}
      >
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 transition-transform ${expanded ? 'rotate-180' : ''}`}
          data-testid={`button-expand-${transaction.id}`}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium truncate">{transaction.merchant || transaction.type}</span>
            {transaction.approvedViaVoice && (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                <Phone className="mr-1 h-3 w-3" />
                Voice
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{transaction.description}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-mono font-semibold">
              ${parseFloat(transaction.amount).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {transaction.currency}
            </div>
          </div>
          
          {getStatusBadge(transaction.status)}
          
          <div className="text-xs text-muted-foreground w-24 text-right">
            {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pl-16">
          <Card className="p-4 bg-muted/30">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Transaction ID:</span>
                <p className="font-mono mt-1" data-testid={`text-transaction-id-${transaction.id}`}>{transaction.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="mt-1">{transaction.type}</p>
              </div>
              {transaction.voiceCall && (
                <>
                  <div>
                    <span className="text-muted-foreground">Voice Call Duration:</span>
                    <p className="mt-1">{transaction.voiceCall.duration ? `${transaction.voiceCall.duration}s` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Call Status:</span>
                    <p className="mt-1">{transaction.voiceCall.status}</p>
                  </div>
                  {transaction.voiceCall.transcript && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Transcript:</span>
                      <p className="mt-2 p-3 bg-background rounded-md text-sm border border-border">
                        {transaction.voiceCall.transcript}
                      </p>
                    </div>
                  )}
                </>
              )}
              {transaction.metadata && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Metadata:</span>
                  <pre className="mt-2 p-3 bg-background rounded-md text-xs font-mono overflow-auto border border-border">
                    {JSON.stringify(transaction.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
