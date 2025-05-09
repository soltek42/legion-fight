import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Basic users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Game statistics table to track user performance
export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gamesPlayed: integer("games_played").default(0),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  favoriteRace: text("favorite_race"),
  lastPlayed: timestamp("last_played"),
});

// Game sessions table to track active games
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  playerCount: integer("player_count").default(0),
  gamePhase: text("game_phase").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  winnerId: integer("winner_id").references(() => users.id),
});

// Player sessions to track players in a game
export const playerSessions = pgTable("player_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => gameSessions.sessionId),
  userId: integer("user_id").references(() => users.id),
  race: text("race"),
  isAI: boolean("is_ai").default(false),
  castleHealth: integer("castle_health"),
  goldEarned: integer("gold_earned"),
  unitsKilled: integer("units_killed").default(0),
  buildingsPlaced: integer("buildings_placed").default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameStatsSchema = createInsertSchema(gameStats);
export const insertGameSessionSchema = createInsertSchema(gameSessions);
export const insertPlayerSessionSchema = createInsertSchema(playerSessions);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameStats = typeof gameStats.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type PlayerSession = typeof playerSessions.$inferSelect;
