import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended";

interface GameState {
  phase: GamePhase;

  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
  startGame: (mode: "ai" | "online") => void;
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set) => ({
    phase: "ready",

    start: () => {
      set((state) => {
        // Only transition from ready to playing
        if (state.phase === "ready") {
          return { phase: "playing" };
        }
        return {};
      });
    },

    restart: () => {
      set(() => ({ phase: "ready" }));
    },

    end: () => {
      set((state) => {
        // Only transition from playing to ended
        if (state.phase === "playing") {
          return { phase: "ended" };
        }
        return {};
      });
    },
    startGame: (mode: "ai" | "online") => {
      // socket.emit("createGame", { mode });  // Assuming socket is defined elsewhere
      set((state) => {
        if (state.phase === "ready") {
          console.log(`Starting game in ${mode} mode`); // Added console log for testing
          return { phase: "playing" };
        }
        return {};
      });
    }
  }))
);