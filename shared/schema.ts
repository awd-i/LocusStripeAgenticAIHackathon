import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("USDC"),
  status: varchar("status", { length: 20 }).notNull(), // pending, approved, rejected, completed, failed
  type: varchar("type", { length: 50 }).notNull(), // purchase, payment, transfer, subscription
  merchant: text("merchant"),
  description: text("description"),
  requiresApproval: boolean("requires_approval").notNull().default(false),
  approvedViaVoice: boolean("approved_via_voice").default(false),
  voiceCallId: varchar("voice_call_id", { length: 100 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Voice calls table
export const voiceCalls = pgTable("voice_calls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vapiCallId: varchar("vapi_call_id", { length: 100 }),
  type: varchar("type", { length: 20 }).notNull(), // incoming, outgoing
  purpose: varchar("purpose", { length: 50 }).notNull(), // transaction_approval, notification, emergency
  status: varchar("status", { length: 20 }).notNull(), // ringing, active, completed, failed
  duration: decimal("duration", { precision: 10, scale: 2 }), // in seconds
  transcript: text("transcript"),
  transactionId: varchar("transaction_id", { length: 100 }),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
});

// Agent configuration table
export const agentConfig = pgTable("agent_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Transaction Agent"),
  approvalThreshold: decimal("approval_threshold", { precision: 18, scale: 6 }).notNull().default("100.00"),
  dailySpendLimit: decimal("daily_spend_limit", { precision: 18, scale: 6 }).notNull().default("1000.00"),
  monthlySpendLimit: decimal("monthly_spend_limit", { precision: 18, scale: 6 }).notNull().default("5000.00"),
  authorizedMerchants: jsonb("authorized_merchants").default([]),
  blockedMerchants: jsonb("blocked_merchants").default([]),
  autoApprovalEnabled: boolean("auto_approval_enabled").notNull().default(true),
  voiceNotificationsEnabled: boolean("voice_notifications_enabled").notNull().default(true),
  emergencyStopActive: boolean("emergency_stop_active").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Wallet information table
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: varchar("address", { length: 100 }).notNull().unique(),
  network: varchar("network", { length: 20 }).notNull().default("base-sepolia"),
  balance: decimal("balance", { precision: 18, scale: 6 }).notNull().default("0"),
  currency: varchar("currency", { length: 10 }).notNull().default("USDC"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Zod schemas for validation
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// API schema for creating transactions with strict validation
export const apiCreateTransactionSchema = z.object({
  amount: z.string().regex(/^\d+\.?\d*$/, "Amount must be a valid number").refine(
    (val) => parseFloat(val) > 0,
    "Amount must be greater than 0"
  ),
  currency: z.string().default("USDC"),
  type: z.enum(["purchase", "subscription", "payment", "transfer"]),
  merchant: z.string().min(1, "Merchant is required"),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional().default({}),
});

export const insertVoiceCallSchema = createInsertSchema(voiceCalls).omit({
  id: true,
  startedAt: true,
  endedAt: true,
});

export const insertAgentConfigSchema = createInsertSchema(agentConfig).omit({
  id: true,
  updatedAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  updatedAt: true,
});

// TypeScript types
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type VoiceCall = typeof voiceCalls.$inferSelect;
export type InsertVoiceCall = z.infer<typeof insertVoiceCallSchema>;

export type AgentConfig = typeof agentConfig.$inferSelect;
export type InsertAgentConfig = z.infer<typeof insertAgentConfigSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

// Additional frontend-only types
export interface DashboardStats {
  totalTransactions: number;
  pendingApprovals: number;
  activeCalls: number;
  totalSpentToday: string;
  totalSpentMonth: string;
}

export interface TransactionWithCall extends Transaction {
  voiceCall?: VoiceCall;
}
