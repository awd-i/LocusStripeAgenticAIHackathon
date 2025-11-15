import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import {
  mockVapiService,
  mockAnthropicService,
  mockCoinbaseService,
  mockLocusService,
} from "./mock-services";
import { apiCreateTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Stats endpoint
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Transactions endpoints
  app.get("/api/transactions", async (_req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/recent", async (_req, res) => {
    try {
      const transactions = await storage.getRecentTransactions(10);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const config = await storage.getAgentConfig();
      const stats = await storage.getDashboardStats();

      // Validate request body with strict API schema
      const validationResult = apiCreateTransactionSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid transaction data", 
          details: validationResult.error.errors,
        });
      }

      // Build complete transaction data with validated input + computed fields
      const validatedInput = validationResult.data;
      const transactionData = {
        ...validatedInput,
        status: "pending" as const,
        requiresApproval: false,
        approvedViaVoice: false,
        voiceCallId: undefined,
      };

      // Step 1: Check spending limits with Locus
      const locusCheck = await mockLocusService.checkSpendingLimits(
        transactionData,
        config,
        stats
      );

      if (!locusCheck.approved) {
        return res.status(400).json({ 
          error: "Transaction blocked", 
          reason: locusCheck.reason,
          checks: locusCheck.checks,
        });
      }

      // Step 2: Analyze with Anthropic Agent SDK
      const agentDecision = await mockAnthropicService.analyzeTransaction(
        transactionData,
        config
      );

      // Update transaction data with agent decision
      transactionData.requiresApproval = agentDecision.requiresApproval;
      transactionData.status = agentDecision.requiresApproval ? "pending" : "approved";

      // Create transaction with fully validated and complete data
      const transaction = await storage.createTransaction(transactionData);

      // Step 3: If requires approval, initiate voice call with Vapi
      if (agentDecision.requiresApproval && config.voiceNotificationsEnabled) {
        const callScript = await mockAnthropicService.generateCallScript(
          transaction,
          "transaction_approval"
        );

        const vapiCall = await mockVapiService.initiateCall(
          "+1234567890", // Mock phone number
          "transaction_approval",
          { transactionId: transaction.id, script: callScript }
        );

        // Create voice call record
        const voiceCall = await storage.createVoiceCall({
          vapiCallId: vapiCall.callId,
          type: "outgoing",
          purpose: "transaction_approval",
          status: "ringing",
          transactionId: transaction.id,
        });

        // Update transaction with voice call ID
        await storage.updateTransaction(transaction.id, {
          voiceCallId: voiceCall.id,
        });

        // Broadcast to WebSocket clients
        broadcastToClients({
          type: "voice_call_initiated",
          call: voiceCall,
          transaction,
        });
      } else if (!agentDecision.requiresApproval) {
        // Auto-approve and process payment
        const payment = await mockCoinbaseService.createPayment(
          transaction.amount,
          transaction.merchant || "merchant",
          "base-sepolia"
        );

        await storage.updateTransaction(transaction.id, {
          status: "completed",
          completedAt: new Date(),
          metadata: { ...transaction.metadata, payment },
        });

        // Log with Locus
        await mockLocusService.logTransaction(transaction);

        // Broadcast to WebSocket clients
        broadcastToClients({
          type: "transaction_completed",
          transaction: await storage.getTransaction(transaction.id),
        });
      }

      res.json({
        transaction,
        agentDecision,
        locusCheck,
      });
    } catch (error) {
      console.error("Transaction creation error:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.updateTransaction(req.params.id, req.body);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // If approved, process payment
      if (req.body.status === "approved" && transaction.status === "approved") {
        const payment = await mockCoinbaseService.createPayment(
          transaction.amount,
          transaction.merchant || "merchant",
          "base-sepolia"
        );

        await storage.updateTransaction(transaction.id, {
          status: "completed",
          completedAt: new Date(),
          metadata: { ...transaction.metadata, payment },
        });

        broadcastToClients({
          type: "transaction_completed",
          transaction: await storage.getTransaction(transaction.id),
        });
      }

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  // Voice calls endpoints
  app.get("/api/calls", async (_req, res) => {
    try {
      const calls = await storage.getVoiceCalls();
      res.json(calls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch voice calls" });
    }
  });

  app.get("/api/calls/recent", async (_req, res) => {
    try {
      const calls = await storage.getRecentVoiceCalls(10);
      res.json(calls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent calls" });
    }
  });

  app.post("/api/calls/:id/complete", async (req, res) => {
    try {
      const call = await storage.getVoiceCall(req.params.id);
      if (!call) {
        return res.status(404).json({ error: "Voice call not found" });
      }

      // Complete the call with Vapi
      const completedCall = await mockVapiService.endCall(
        call.vapiCallId || "",
        req.body.transcript
      );

      // Update call record
      const updatedCall = await storage.updateVoiceCall(call.id, {
        status: "completed",
        duration: completedCall?.duration || "30.00",
        transcript: completedCall?.transcript || req.body.transcript,
        endedAt: new Date(),
      });

      // If this was for transaction approval, update the transaction
      if (call.transactionId && req.body.approved) {
        await storage.updateTransaction(call.transactionId, {
          status: "approved",
          approvedViaVoice: true,
        });
      }

      broadcastToClients({
        type: "voice_call_completed",
        call: updatedCall,
      });

      res.json(updatedCall);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete call" });
    }
  });

  // Agent config endpoints
  app.get("/api/config", async (_req, res) => {
    try {
      const config = await storage.getAgentConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });

  app.patch("/api/config", async (req, res) => {
    try {
      const config = await storage.updateAgentConfig(req.body);
      
      broadcastToClients({
        type: "config_updated",
        config,
      });

      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to update config" });
    }
  });

  // Wallet endpoints
  app.get("/api/wallet", async (_req, res) => {
    try {
      const wallet = await storage.getWallet();
      
      // Refresh balance from Coinbase
      if (wallet) {
        const balanceData = await mockCoinbaseService.getWalletBalance(wallet.address);
        await storage.updateWallet(wallet.id, {
          balance: balanceData.balance,
        });
      }

      const updatedWallet = await storage.getWallet();
      res.json(updatedWallet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });

  // WebSocket setup for real-time updates
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  const clients = new Set<WebSocket>();

  wss.on("connection", (ws: WebSocket) => {
    clients.add(ws);
    console.log("WebSocket client connected");

    ws.on("close", () => {
      clients.delete(ws);
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });

    // Send initial connection confirmation
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "connected", message: "WebSocket connection established" }));
    }
  });

  function broadcastToClients(data: any) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Make broadcastToClients available globally for mock services
  (global as any).broadcastToClients = broadcastToClients;

  return httpServer;
}
