import { Socket, io } from "socket.io-client";
import { BotService } from "./BotService";

export class BotFactory {
  private static instance: BotFactory;
  private bots: Map<string, BotService> = new Map();

  private constructor() {}

  public static getInstance(): BotFactory {
    if (!BotFactory.instance) {
      BotFactory.instance = new BotFactory();
    }
    return BotFactory.instance;
  }

  public createBot(): Promise<BotService> {
    return new Promise((resolve, reject) => {
      console.log("[BOT_FACTORY] Creating new bot instance");
      
      // Create a new socket connection for the bot
      const socket: Socket = io("http://localhost:5000", {
        transports: ["websocket"],
        autoConnect: false // Changed to false to control connection
      });

      // Create a new bot instance
      const bot = new BotService(socket);
      
      // Handle connection errors
      socket.on("connect_error", (error) => {
        console.error("[BOT_FACTORY] Connection error:", error);
        reject(error);
      });

      // Wait for socket to connect
      socket.on("connect", () => {
        console.log("[BOT_FACTORY] Bot socket connected:", socket.id);
        if (socket.id) {
          // Store the bot instance
          this.bots.set(socket.id, bot);
          
          // Wait a short moment to ensure socket is fully ready
          setTimeout(() => {
            resolve(bot);
          }, 100);
        }
      });

      // Remove bot when disconnected
      socket.on("disconnect", () => {
        console.log("[BOT_FACTORY] Bot socket disconnected");
        if (socket.id) {
          this.bots.delete(socket.id);
        }
      });

      // Initiate connection
      socket.connect();
    });
  }

  public getBotById(socketId: string): BotService | undefined {
    return this.bots.get(socketId);
  }

  public getAllBots(): BotService[] {
    return Array.from(this.bots.values());
  }
} 