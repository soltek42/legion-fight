import { useState, useEffect } from "react";
import { useGameState } from "@/lib/stores/useGameState";
import { useBuildingPlacement } from "@/lib/stores/useBuildingPlacement";
import { BuildingType } from "@shared/types";
import { buildingsData } from "@/lib/game/buildingsData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Coins, Clock, Users } from "lucide-react";

export default function BuildingMenu() {
  const { playerRace, playerGold, addPlayerBuilding } = useGameState();
  const { enterPlacementMode, exitPlacementMode, placementMode } = useBuildingPlacement();
  const [selectedCategory, setSelectedCategory] = useState<string>("combat");
  const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);

  // Update building types when race changes
  useEffect(() => {
    if (!playerRace) return;
    
    // Extract building type names (keys) that match the player's race
    const availableBuildings = Object.entries(buildingsData)
      .filter(([_, building]) => building.race === playerRace)
      .map(([type]) => type as BuildingType);
    
    setBuildingTypes(availableBuildings);
  }, [playerRace]);

  const handleSelectBuilding = (buildingType: BuildingType) => {
    // Check if player has enough gold
    const buildingData = buildingsData[buildingType];
    if (!buildingData || playerGold < buildingData.cost) return;
    
    enterPlacementMode(buildingType);
  };

  const getCategoryBuildings = (category: string) => {
    return buildingTypes.filter(type => {
      const data = buildingsData[type];
      return data && data.category === category;
    });
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-3/4 max-w-3xl">
      <Card className="border-2 border-amber-600 bg-gray-900/80 text-white">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-amber-400">Building Menu</CardTitle>
            {placementMode && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={exitPlacementMode}
              >
                Cancel
              </Button>
            )}
          </div>
          <CardDescription className="text-gray-300">
            Place buildings to spawn units and gather resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="combat" 
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-2 bg-gray-800">
              <TabsTrigger value="combat" className="text-white data-[state=active]:bg-amber-700">Combat</TabsTrigger>
              <TabsTrigger value="economy" className="text-white data-[state=active]:bg-amber-700">Economy</TabsTrigger>
              <TabsTrigger value="special" className="text-white data-[state=active]:bg-amber-700">Special</TabsTrigger>
            </TabsList>
            
            {["combat", "economy", "special"].map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {getCategoryBuildings(category).map((type) => {
                    const building = buildingsData[type];
                    
                    // Skip if building data is missing
                    if (!building) return null;
                    
                    const canAfford = playerGold >= building.cost;
                    
                    return (
                      <TooltipProvider key={type}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={cn(
                                "relative flex flex-col items-center p-2 border rounded-md transition-all",
                                canAfford 
                                  ? "cursor-pointer border-amber-600 hover:bg-amber-900/50" 
                                  : "cursor-not-allowed border-gray-600 opacity-50"
                              )}
                              onClick={() => canAfford && handleSelectBuilding(type)}
                            >
                              <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-md mb-1">
                                {building.icon ? (
                                  <span className="text-2xl">{building.icon}</span>
                                ) : (
                                  <div className="w-10 h-10 bg-amber-700 rounded"></div>
                                )}
                              </div>
                              <span className="text-xs font-medium text-center line-clamp-1">
                                {building.name}
                              </span>
                              <div className="flex items-center mt-1">
                                <Coins size={12} className="text-yellow-400 mr-1" />
                                <span className="text-xs">{building.cost}</span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="w-64 p-0 bg-gray-900 border-amber-600">
                            <div className="p-3">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-white">{building.name}</h3>
                                <Badge variant="outline" className="bg-amber-800 text-white border-none">
                                  {building.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-300 mb-2">{building.description}</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center">
                                  <Coins size={14} className="text-yellow-400 mr-1" />
                                  <span>Cost: {building.cost}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock size={14} className="text-blue-400 mr-1" />
                                  <span>Cooldown: {building.cooldown}s</span>
                                </div>
                              </div>
                              {building.produces && (
                                <div className="mt-2 pt-2 border-t border-gray-700">
                                  <div className="flex items-center mb-1">
                                    <Users size={14} className="text-green-400 mr-1" />
                                    <span className="text-xs font-semibold">Produces:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {building.produces.map(unit => (
                                      <Badge key={unit} variant="secondary" className="bg-gray-800 text-xs">
                                        {unit}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-700 pt-3">
          <div className="text-sm text-gray-300">
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs mr-1">E</kbd> to place
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs mx-1">ESC</kbd> to cancel
          </div>
          <div className="flex items-center">
            <Coins size={16} className="text-yellow-400 mr-1" />
            <span className="font-bold">{playerGold} Gold</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
