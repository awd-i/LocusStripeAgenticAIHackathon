import { Phone, PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoiceCall } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface VoiceActivityFeedProps {
  calls: VoiceCall[];
  isLoading?: boolean;
}

export function VoiceActivityFeed({ calls, isLoading }: VoiceActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Voice Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getCallIcon = (type: string, status: string) => {
    if (status === "active") {
      return <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse-glow">
        <Phone className="h-5 w-5 text-green-500" />
      </div>;
    }
    
    const Icon = type === "incoming" ? PhoneIncoming : PhoneOutgoing;
    return <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      ringing: { className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
      active: { className: "bg-green-500/10 text-green-500 border-green-500/20" },
      completed: { className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      failed: { className: "bg-red-500/10 text-red-500 border-red-500/20" },
    };

    const badgeConfig = config[status as keyof typeof config] || config.completed;
    
    return (
      <Badge variant="outline" className={badgeConfig.className}>
        {status}
      </Badge>
    );
  };

  return (
    <Card data-testid="card-voice-activity">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Voice Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {calls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No voice calls yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex gap-3 p-3 rounded-lg hover-elevate transition-colors"
                data-testid={`voice-call-${call.id}`}
              >
                {getCallIcon(call.type, call.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm capitalize">{call.purpose.replace('_', ' ')}</span>
                    {getStatusBadge(call.status)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(call.startedAt), { addSuffix: true })}
                    {call.duration && ` • ${call.duration}s`}
                  </p>
                  {call.transcript && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {call.transcript}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
