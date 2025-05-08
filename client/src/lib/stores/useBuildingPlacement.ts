import { create } from "zustand";
import { Vector3Tuple } from "three";
import { BuildingType } from "@shared/types";
import { useGameState } from "./useGameState";
import { isValidBuildingPlacement } from "@/lib/game/gameLogic";

interface BuildingPlacementState {
  placementMode: boolean;
  selectedBuildingType: BuildingType | null;
  cursorPosition: { x: number; z: number };
  
  enterPlacementMode: (buildingType: BuildingType) => void;
  exitPlacementMode: () => void;
  updateCursorPosition: (x: number, z: number) => void;
  placeBuildingAtCursor: () => void;
}

export const useBuildingPlacement = create<BuildingPlacementState>((set, get) => ({
  placementMode: false,
  selectedBuildingType: null,
  cursorPosition: { x: -4, z: 2 },
  
  enterPlacementMode: (buildingType: BuildingType) => {
    set({
      placementMode: true,
      selectedBuildingType: buildingType,
      cursorPosition: { x: -4, z: 2 } // Default placement position
    });
  },
  
  exitPlacementMode: () => {
    set({
      placementMode: false,
      selectedBuildingType: null
    });
  },
  
  updateCursorPosition: (x: number, z: number) => {
    // Snap to grid (1x1 units)
    const snappedX = Math.round(x);
    const snappedZ = Math.round(z);
    
    set({
      cursorPosition: { x: snappedX, z: snappedZ }
    });
  },
  
  placeBuildingAtCursor: () => {
    const { placementMode, selectedBuildingType, cursorPosition } = get();
    
    if (!placementMode || !selectedBuildingType) return;
    
    const { playerBuildings, addPlayerBuilding } = useGameState.getState();
    const position: Vector3Tuple = [cursorPosition.x, 0.5, cursorPosition.z];
    
    // Check if placement is valid
    if (isValidBuildingPlacement(position, true, playerBuildings)) {
      // Place the building
      addPlayerBuilding(selectedBuildingType, position);
      
      // Exit placement mode
      set({
        placementMode: false,
        selectedBuildingType: null
      });
    } else {
      // Provide feedback that placement is invalid
      console.log("Invalid building placement");
    }
  }
}));
