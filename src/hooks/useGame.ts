import { useState, useCallback, useRef } from 'react';
import { 
  GameState, 
  createGameState, 
  getActiveOptions, 
  isGameFinished, 
  getFinalResults,
  calculateGameSpeed 
} from '@/lib/gameLogic';

export interface GameConfig {
  professions: string[];
  children: number[];
  partners: string[];
  cycleNumber: number;
}

export const useGame = (playerAge: number = 20) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [highlightedPosition, setHighlightedPosition] = useState<{ sideIndex: number; optionIndex: number } | null>(null);
  const [lastEliminated, setLastEliminated] = useState<{ sideIndex: number; optionIndex: number } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initGame = useCallback((config: GameConfig) => {
    const state = createGameState(config);
    setGameState(state);
    setHighlightedPosition(null);
    setLastEliminated(null);
  }, []);

  const updateCycleNumber = useCallback((cycleNumber: number) => {
    setGameState(prev => prev ? { ...prev, cycleNumber } : null);
  }, []);

  const playRound = useCallback(() => {
    if (!gameState || gameState.isPlaying || gameState.isFinished) return;

    setGameState(prev => prev ? { ...prev, isPlaying: true } : null);
    setLastEliminated(null);

    const activeOptions = getActiveOptions(gameState.sides);
    if (activeOptions.length === 0) {
      setGameState(prev => prev ? { ...prev, isPlaying: false, isFinished: true } : null);
      return;
    }

    let count = 0;
    const targetCount = gameState.cycleNumber;
    
    // Calculate speed based on player age
    const gameSpeed = calculateGameSpeed(targetCount);

    intervalRef.current = setInterval(() => {
      count++;
      const currentPos = activeOptions[(count - 1) % activeOptions.length];
      setHighlightedPosition(currentPos);

      if (count >= targetCount) {
        // Clear interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Eliminate option
        const eliminatePos = currentPos;
        
        setTimeout(() => {
          setGameState(prev => {
            if (!prev) return null;
            
            const newSides = prev.sides.map((side, sIndex) => {
              if (sIndex === eliminatePos.sideIndex) {
                const newOptions = side.options.map((opt, oIndex) => {
                  if (oIndex === eliminatePos.optionIndex) {
                    return { ...opt, eliminated: true };
                  }
                  return opt;
                });
                return { ...side, options: newOptions };
              }
              return side;
            });

            const finished = isGameFinished(newSides);
            
            return {
              ...prev,
              sides: newSides,
              isPlaying: false,
              isFinished: finished,
            };
          });

          setLastEliminated(eliminatePos);
          setHighlightedPosition(null);
        }, 500);
      }
    }, gameSpeed);
  }, [gameState, playerAge]);

  const resetGame = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setGameState(null);
    setHighlightedPosition(null);
    setLastEliminated(null);
  }, []);

  const restartWithSameData = useCallback((newCycleNumber: number) => {
    if (!gameState) return;
    
    const config: GameConfig = {
      professions: gameState.sides[0].options.map(o => o.value),
      children: gameState.sides[1].options.map(o => parseInt(o.value)),
      partners: gameState.sides[2].options.map(o => o.value),
      cycleNumber: newCycleNumber,
    };
    
    initGame(config);
  }, [gameState, initGame]);

  const getResults = useCallback(() => {
    if (!gameState || !gameState.isFinished) return null;
    return getFinalResults(gameState.sides);
  }, [gameState]);

  return {
    gameState,
    highlightedPosition,
    lastEliminated,
    initGame,
    updateCycleNumber,
    playRound,
    resetGame,
    restartWithSameData,
    getResults,
  };
};
