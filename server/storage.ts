import {
  type Transaction,
  type InsertTransaction,
  type VoiceCall,
  type InsertVoiceCall,
  type AgentConfig,
  type InsertAgentConfig,
  type Wallet,
  type InsertWallet,
  type DashboardStats,
  type TransactionWithCall,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Transactions
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactions(): Promise<Transaction[]>;
  getRecentTransactions(limit?: number): Promise<TransactionWithCall[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
  
  // Voice Calls
  getVoiceCall(id: string): Promise<VoiceCall | undefined>;
  getVoiceCalls(): Promise<VoiceCall[]>;
  getRecentVoiceCalls(limit?: number): Promise<VoiceCall[]>;
  createVoiceCall(call: InsertVoiceCall): Promise<VoiceCall>;
  updateVoiceCall(id: string, call: Partial<VoiceCall>): Promise<VoiceCall | undefined>;
  
  // Agent Config
  getAgentConfig(): Promise<AgentConfig>;
  updateAgentConfig(config: Partial<AgentConfig>): Promise<AgentConfig>;
  
  // Wallet
  getWallet(): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: string, wallet: Partial<Wallet>): Promise<Wallet | undefined>;
  
  // Stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction>;
  private voiceCalls: Map<string, VoiceCall>;
  private agentConfig: AgentConfig;
  private wallet: Wallet | undefined;

  constructor() {
    this.transactions = new Map();
    this.voiceCalls = new Map();
    
    // Initialize default agent config
    this.agentConfig = {
      id: randomUUID(),
      name: "Transaction Agent",
      approvalThreshold: "100.00",
      dailySpendLimit: "1000.00",
      monthlySpendLimit: "5000.00",
      authorizedMerchants: [],
      blockedMerchants: [],
      autoApprovalEnabled: true,
      voiceNotificationsEnabled: true,
      emergencyStopActive: false,
      updatedAt: new Date(),
    };

    // Initialize wallet with mock data
    this.wallet = {
      id: randomUUID(),
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      network: "base-sepolia",
      balance: "500.00",
      currency: "USDC",
      updatedAt: new Date(),
    };

    // Add some mock transactions and calls for demo
    this.seedMockData();
  }

  private seedMockData() {
    // Mock transactions
    const mockTransactions: InsertTransaction[] = [
      {
        amount: "45.99",
        currency: "USDC",
        status: "completed",
        type: "purchase",
        merchant: "Amazon",
        description: "Office supplies order",
        requiresApproval: false,
        approvedViaVoice: false,
        metadata: { orderId: "AMZ-123456" },
      },
      {
        amount: "150.00",
        currency: "USDC",
        status: "approved",
        type: "subscription",
        merchant: "Anthropic",
        description: "Claude API subscription",
        requiresApproval: true,
        approvedViaVoice: true,
        metadata: { plan: "Pro" },
      },
      {
        amount: "8.50",
        currency: "USDC",
        status: "completed",
        type: "payment",
        merchant: "OpenAI",
        description: "API usage charges",
        requiresApproval: false,
        approvedViaVoice: false,
        metadata: { tokens: 50000 },
      },
    ];

    mockTransactions.forEach((t) => {
      const id = randomUUID();
      this.transactions.set(id, {
        ...t,
        id,
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 2),
        completedAt: t.status === "completed" ? new Date() : null,
      });
    });

    // Mock voice calls
    const mockCalls: InsertVoiceCall[] = [
      {
        type: "outgoing",
        purpose: "transaction_approval",
        status: "completed",
        duration: "45.30",
        transcript: "Agent: Hello, I need your approval for a $150 subscription to Anthropic Claude API. User: Yes, approved.",
        vapiCallId: "vapi_" + randomUUID(),
      },
      {
        type: "outgoing",
        purpose: "notification",
        status: "completed",
        duration: "12.50",
        transcript: "Agent: Your transaction of $45.99 to Amazon has been completed successfully.",
        vapiCallId: "vapi_" + randomUUID(),
      },
    ];

    mockCalls.forEach((c) => {
      const id = randomUUID();
      this.voiceCalls.set(id, {
        ...c,
        id,
        startedAt: new Date(Date.now() - Math.random() * 86400000 * 2),
        endedAt: c.status === "completed" ? new Date() : null,
      });
    });
  }

  // Transactions
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRecentTransactions(limit: number = 10): Promise<TransactionWithCall[]> {
    const transactions = await this.getTransactions();
    return transactions.slice(0, limit).map((t) => ({
      ...t,
      voiceCall: t.voiceCallId ? this.voiceCalls.get(t.voiceCallId) : undefined,
    }));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updated = { ...transaction, ...updates };
    this.transactions.set(id, updated);
    return updated;
  }

  // Voice Calls
  async getVoiceCall(id: string): Promise<VoiceCall | undefined> {
    return this.voiceCalls.get(id);
  }

  async getVoiceCalls(): Promise<VoiceCall[]> {
    return Array.from(this.voiceCalls.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  async getRecentVoiceCalls(limit: number = 10): Promise<VoiceCall[]> {
    const calls = await this.getVoiceCalls();
    return calls.slice(0, limit);
  }

  async createVoiceCall(insertCall: InsertVoiceCall): Promise<VoiceCall> {
    const id = randomUUID();
    const call: VoiceCall = {
      ...insertCall,
      id,
      startedAt: new Date(),
      endedAt: null,
    };
    this.voiceCalls.set(id, call);
    return call;
  }

  async updateVoiceCall(id: string, updates: Partial<VoiceCall>): Promise<VoiceCall | undefined> {
    const call = this.voiceCalls.get(id);
    if (!call) return undefined;

    const updated = { ...call, ...updates };
    this.voiceCalls.set(id, updated);
    return updated;
  }

  // Agent Config
  async getAgentConfig(): Promise<AgentConfig> {
    return this.agentConfig;
  }

  async updateAgentConfig(updates: Partial<AgentConfig>): Promise<AgentConfig> {
    this.agentConfig = {
      ...this.agentConfig,
      ...updates,
      updatedAt: new Date(),
    };
    return this.agentConfig;
  }

  // Wallet
  async getWallet(): Promise<Wallet | undefined> {
    return this.wallet;
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = randomUUID();
    this.wallet = {
      ...insertWallet,
      id,
      updatedAt: new Date(),
    };
    return this.wallet;
  }

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | undefined> {
    if (!this.wallet || this.wallet.id !== id) return undefined;

    this.wallet = {
      ...this.wallet,
      ...updates,
      updatedAt: new Date(),
    };
    return this.wallet;
  }

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const transactions = await this.getTransactions();
    const calls = await this.getVoiceCalls();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalSpentToday = transactions
      .filter((t) => new Date(t.createdAt) >= todayStart && t.status === "completed")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalSpentMonth = transactions
      .filter((t) => new Date(t.createdAt) >= monthStart && t.status === "completed")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      totalTransactions: transactions.length,
      pendingApprovals: transactions.filter((t) => t.status === "pending").length,
      activeCalls: calls.filter((c) => c.status === "active" || c.status === "ringing").length,
      totalSpentToday: totalSpentToday.toFixed(2),
      totalSpentMonth: totalSpentMonth.toFixed(2),
    };
  }
}

export const storage = new MemStorage();
