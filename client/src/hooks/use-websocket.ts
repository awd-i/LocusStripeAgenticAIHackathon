import { useEffect, useRef } from "react";
import { queryClient } from "@/lib/queryClient";

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message:", data);

        // Invalidate relevant queries based on message type
        switch (data.type) {
          case "transaction_completed":
          case "transaction_created":
            queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
            queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
            queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
            queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
            break;

          case "voice_call_initiated":
          case "voice_call_completed":
            queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
            queryClient.invalidateQueries({ queryKey: ["/api/calls/recent"] });
            queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
            break;

          case "config_updated":
            queryClient.invalidateQueries({ queryKey: ["/api/config"] });
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return ws;
}
