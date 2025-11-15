import { useQuery } from "@tanstack/react-query";
import { Phone, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VoiceActivityFeed } from "@/components/voice-activity-feed";
import { ThemeToggle } from "@/components/theme-toggle";
import { VoiceCall } from "@shared/schema";
import { useState } from "react";

export default function Calls() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: calls, isLoading } = useQuery<VoiceCall[]>({
    queryKey: ["/api/calls"],
  });

  const filteredCalls = calls?.filter((call) => {
    const search = searchQuery.toLowerCase();
    return (
      call.purpose.toLowerCase().includes(search) ||
      call.status.toLowerCase().includes(search) ||
      call.transcript?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-blue-cyan text-gradient">
              Voice Calls
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review all voice interactions with your agent
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-8 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                All Voice Calls
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search calls..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-calls"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <VoiceActivityFeed calls={filteredCalls || []} isLoading={isLoading} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
