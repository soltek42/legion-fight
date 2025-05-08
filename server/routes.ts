import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GameServer } from "./gameServer";
import { GAME_CONFIG } from "../shared/gameData/gameConfig";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Initialize game server
  const gameServer = new GameServer(httpServer);
  
  // Game API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  
  // Get game configuration
  app.get("/api/game/config", (req, res) => {
    res.json(GAME_CONFIG);
  });
  
  // Get race data
  app.get("/api/game/races", (req, res) => {
    const { racesData } = require("../shared/gameData/racesData");
    res.json(racesData);
  });

  // Get building data
  app.get("/api/game/buildings", (req, res) => {
    const { buildingsData } = require("../shared/gameData/buildingsData");
    res.json(buildingsData);
  });

  // Get unit data
  app.get("/api/game/units", (req, res) => {
    const { unitsData } = require("../shared/gameData/unitsData");
    res.json(unitsData);
  });
  
  // Get single player stats
  app.get("/api/stats/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // In a real implementation, we would fetch game stats from a database
      // For now, return some placeholder stats
      res.json({
        userId: user.id,
        username: user.username,
        stats: {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          favoriteRace: null
        }
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  
  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }
      
      // Create new user
      const user = await storage.createUser({ username, password });
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  return httpServer;
}
