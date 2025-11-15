import { randomUUID } from "crypto";

/**
 * Mock services for external APIs (Vapi, Anthropic, Coinbase x402, Locus)
 * These provide realistic simulations without needing real API keys
 */

// Vapi Voice Calling Mock Service
export class MockVapiService {
  private activeCalls: Map<string, any> = new Map();

  async initiateCall(phoneNumber: string, purpose: string, context: any) {
    const callId = `vapi_${randomUUID()}`;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const call = {
      id: callId,
      status: "ringing",
      phoneNumber,
      purpose,
      context,
      startedAt: new Date(),
    };

    this.activeCalls.set(callId, call);

    // Simulate call progression
    setTimeout(() => {
      if (this.activeCalls.has(callId)) {
        this.activeCalls.get(callId).status = "active";
      }
    }, 2000);

    return {
      callId,
      status: "initiated",
      message: `[MOCK] Voice call initiated to ${phoneNumber} for ${purpose}`,
    };
  }

  async getCallStatus(callId: string) {
    return this.activeCalls.get(callId) || { status: "not_found" };
  }

  async endCall(callId: string, transcript?: string) {
    const call = this.activeCalls.get(callId);
    if (call) {
      call.status = "completed";
      call.endedAt = new Date();
      call.transcript = transcript || this.generateMockTranscript(call.purpose);
      return call;
    }
    return null;
  }

  private generateMockTranscript(purpose: string): string {
    const transcripts = {
      transaction_approval: "Agent: Hello, I need your approval for a transaction. User: Yes, approved. Agent: Thank you, transaction approved.",
      notification: "Agent: This is a notification about your recent transaction. It has been completed successfully.",
      emergency: "Agent: Emergency stop has been activated. All transactions have been halted.",
    };
    return transcripts[purpose as keyof typeof transcripts] || "Mock call transcript";
  }
}

// Anthropic Agent SDK Mock Service
export class MockAnthropicAgentService {
  async analyzeTransaction(transaction: any, agentConfig: any) {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    const amount = parseFloat(transaction.amount);
    const threshold = parseFloat(agentConfig.approvalThreshold);

    const decision = {
      requiresApproval: amount >= threshold,
      reasoning: amount >= threshold 
        ? `Transaction amount ($${amount}) exceeds approval threshold ($${threshold}). Voice confirmation required.`
        : `Transaction amount ($${amount}) is within auto-approval limit. Processing automatically.`,
      riskScore: Math.random() * 0.3, // Low risk simulation
      recommendedAction: amount >= threshold ? "request_voice_approval" : "auto_approve",
      agentThoughts: [
        `Analyzing transaction for ${transaction.merchant || transaction.type}`,
        `Checking against daily limit: ${agentConfig.dailySpendLimit}`,
        `Verifying merchant authorization status`,
        `Decision: ${amount >= threshold ? 'REQUIRES_APPROVAL' : 'AUTO_APPROVED'}`,
      ],
    };

    return decision;
  }

  async generateCallScript(transaction: any, purpose: string) {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      greeting: "Hello, this is your AI transaction agent.",
      message: `I need your approval for a ${transaction.type} transaction of $${transaction.amount} to ${transaction.merchant || 'merchant'}.`,
      questions: [
        "Do you approve this transaction?",
        "Would you like me to proceed with the payment?",
      ],
      closing: "Thank you for your confirmation.",
    };
  }
}

// Coinbase x402 Payment Protocol Mock Service
export class MockCoinbaseX402Service {
  async createPayment(amount: string, recipient: string, network: string = "base-sepolia") {
    // Simulate blockchain transaction time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const txHash = `0x${randomUUID().replace(/-/g, '')}`;
    
    return {
      transactionHash: txHash,
      network,
      amount,
      recipient,
      status: "confirmed",
      blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
      gasUsed: "0.000021",
      timestamp: new Date().toISOString(),
      explorerUrl: `https://sepolia.basescan.org/tx/${txHash}`,
    };
  }

  async verifyPayment(transactionHash: string) {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      verified: true,
      status: "confirmed",
      confirmations: Math.floor(Math.random() * 10) + 1,
    };
  }

  async getWalletBalance(address: string) {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simulate some balance fluctuation
    const baseBalance = 500;
    const fluctuation = (Math.random() - 0.5) * 50;
    
    return {
      address,
      balance: (baseBalance + fluctuation).toFixed(2),
      currency: "USDC",
      network: "base-sepolia",
    };
  }
}

// Locus Payment Infrastructure Mock Service
export class MockLocusService {
  async checkSpendingLimits(transaction: any, agentConfig: any, stats: any) {
    await new Promise(resolve => setTimeout(resolve, 400));

    const amount = parseFloat(transaction.amount);
    const dailySpent = parseFloat(stats.totalSpentToday);
    const monthlySpent = parseFloat(stats.totalSpentMonth);
    const dailyLimit = parseFloat(agentConfig.dailySpendLimit);
    const monthlyLimit = parseFloat(agentConfig.monthlySpendLimit);

    const checks = {
      withinDailyLimit: dailySpent + amount <= dailyLimit,
      withinMonthlyLimit: monthlySpent + amount <= monthlyLimit,
      merchantAuthorized: !agentConfig.blockedMerchants?.includes(transaction.merchant),
      emergencyStopActive: agentConfig.emergencyStopActive,
      limits: {
        daily: {
          spent: dailySpent,
          limit: dailyLimit,
          remaining: dailyLimit - dailySpent,
        },
        monthly: {
          spent: monthlySpent,
          limit: monthlyLimit,
          remaining: monthlyLimit - monthlySpent,
        },
      },
    };

    const approved = 
      checks.withinDailyLimit &&
      checks.withinMonthlyLimit &&
      checks.merchantAuthorized &&
      !checks.emergencyStopActive;

    return {
      approved,
      checks,
      reason: !approved 
        ? this.getBlockReason(checks)
        : "Transaction within all spending limits",
    };
  }

  private getBlockReason(checks: any): string {
    if (checks.emergencyStopActive) return "Emergency stop is active";
    if (!checks.withinDailyLimit) return "Daily spending limit exceeded";
    if (!checks.withinMonthlyLimit) return "Monthly spending limit exceeded";
    if (!checks.merchantAuthorized) return "Merchant is blocked";
    return "Unknown reason";
  }

  async logTransaction(transaction: any) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      logged: true,
      logId: randomUUID(),
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instances
export const mockVapiService = new MockVapiService();
export const mockAnthropicService = new MockAnthropicAgentService();
export const mockCoinbaseService = new MockCoinbaseX402Service();
export const mockLocusService = new MockLocusService();
