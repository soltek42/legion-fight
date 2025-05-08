import React, { useEffect, useState } from 'react';
import { Stage, Container, Sprite, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { io, Socket } from 'socket.io-client';

// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const LANE_COUNT = 3;
const LANE_HEIGHT = GAME_HEIGHT / LANE_COUNT;

// Basic unit class
class Unit {
  x: number;
  y: number;
  speed: number;
  health: number;
  damage: number;
  lane: number;
  id: string;

  constructor(x: number, y: number, lane: number, id: string) {
    this.x = x;
    this.y = y;
    this.speed = 2;
    this.health = 100;
    this.damage = 10;
    this.lane = lane;
    this.id = id;
  }

  update() {
    this.x += this.speed;
  }
}

const Game: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [gold, setGold] = useState(100);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('gameState', (state) => {
      setUnits(state.units.map((unit: any) => new Unit(
        unit.x,
        unit.y,
        unit.lane,
        unit.id
      )));
      setGold(state.gold);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Initialize game
  useEffect(() => {
    if (!socket) return;

    // Add some initial units for testing
    const initialUnits = [
      new Unit(50, LANE_HEIGHT * 0.5, 0, '1'),
      new Unit(50, LANE_HEIGHT * 1.5, 1, '2'),
      new Unit(50, LANE_HEIGHT * 2.5, 2, '3'),
    ];
    setUnits(initialUnits);

    // Game loop
    const gameLoop = setInterval(() => {
      setUnits(currentUnits => 
        currentUnits.map(unit => {
          unit.update();
          return unit;
        })
      );
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [socket]);

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <Stage
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        options={{ backgroundColor: 0x1a1a1a }}
      >
        {/* Draw lanes */}
        {Array.from({ length: LANE_COUNT - 1 }).map((_, index) => (
          <Container key={index}>
            <Sprite
              texture={PIXI.Texture.WHITE}
              x={0}
              y={LANE_HEIGHT * (index + 1)}
              width={GAME_WIDTH}
              height={2}
              tint={0xffffff}
            />
          </Container>
        ))}

        {/* Draw units */}
        {units.map((unit) => (
          <Container key={unit.id}>
            <Sprite
              texture={PIXI.Texture.WHITE}
              x={unit.x}
              y={unit.y}
              width={30}
              height={30}
              tint={0x00ff00}
            />
            <Text
              text={`HP: ${unit.health}`}
              x={unit.x}
              y={unit.y - 20}
              style={new PIXI.TextStyle({
                fill: 0xffffff,
                fontSize: 12,
              })}
            />
          </Container>
        ))}

        {/* UI Elements */}
        <Container>
          <Text
            text={`Gold: ${gold}`}
            x={10}
            y={10}
            style={new PIXI.TextStyle({
              fill: 0xffff00,
              fontSize: 20,
            })}
          />
        </Container>
      </Stage>
    </div>
  );
};

export default Game; 