import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Example: MCP Tool Usage Log Table
export const toolUsageLogs = pgTable("tool_usage_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  toolName: text("tool_name").notNull(),
  arguments: text("arguments"), // JSON string
  result: text("result"), // success or error
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

// Example: User Preferences Table
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(),
  preferences: text("preferences"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
