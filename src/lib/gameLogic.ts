export interface GameOption {
  value: string;
  eliminated: boolean;
}

export interface GameSide {
  id: 'professions' | 'children' | 'partners' | 'wealth';
  label: string;
  options: GameOption[];
}

export interface GameState {
  sides: GameSide[];
  cycleNumber: number;
  currentIndex: number;
  isPlaying: boolean;
  isFinished: boolean;
}

// Generate wealth letters ensuring no consecutive duplicates
export const generateWealthOptions = (count: number): string[] => {
  const letters = ['P', 'R', 'M'];
  const result: string[] = [];
  
  for (let i = 0; i < count; i++) {
    if (i < 3) {
      result.push(letters[i]);
    } else {
      // Get available letters (exclude the last one to avoid duplicates)
      const lastLetter = result[result.length - 1];
      const available = letters.filter(l => l !== lastLetter);
      const randomLetter = available[Math.floor(Math.random() * available.length)];
      result.push(randomLetter);
    }
  }
  
  return result;
};

// Generate random children counts
export const generateRandomChildren = (count: number): number[] => {
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    result.push(Math.floor(Math.random() * 12) + 1);
  }
  return result;
};

// Generate sequential children counts
export const generateSequentialChildren = (count: number): number[] => {
  return Array.from({ length: count }, (_, i) => i + 1);
};

// Create initial game state from config
export const createGameState = (config: {
  professions: string[];
  children: number[];
  partners: string[];
  cycleNumber: number;
}): GameState => {
  const wealthOptions = generateWealthOptions(config.professions.length);
  
  return {
    sides: [
      {
        id: 'professions',
        label: 'Profissão',
        options: config.professions.map(v => ({ value: v, eliminated: false })),
      },
      {
        id: 'children',
        label: 'Filhos',
        options: config.children.map(v => ({ value: String(v), eliminated: false })),
      },
      {
        id: 'partners',
        label: 'Casamento',
        options: config.partners.map(v => ({ value: v, eliminated: false })),
      },
      {
        id: 'wealth',
        label: 'Fortuna',
        options: wealthOptions.map(v => ({ value: v, eliminated: false })),
      },
    ],
    cycleNumber: config.cycleNumber,
    currentIndex: -1,
    isPlaying: false,
    isFinished: false,
  };
};

// Get all active options in order (for clockwise counting)
export const getActiveOptions = (sides: GameSide[]): { sideIndex: number; optionIndex: number }[] => {
  const result: { sideIndex: number; optionIndex: number }[] = [];
  
  // Clockwise order starting from top:
  // 1. Top (children) - left to right
  // 2. Right (partners) - top to bottom  
  // 3. Bottom (wealth) - RIGHT to LEFT (reversed for clockwise)
  // 4. Left (professions) - BOTTOM to TOP (reversed for clockwise)
  
  const sideConfigs: { sideIndex: number; reverse: boolean }[] = [
    { sideIndex: 1, reverse: false },  // children (top): left to right
    { sideIndex: 2, reverse: false },  // partners (right): top to bottom
    { sideIndex: 3, reverse: true },   // wealth (bottom): right to left
    { sideIndex: 0, reverse: true },   // professions (left): bottom to top
  ];
  
  for (const { sideIndex, reverse } of sideConfigs) {
    const side = sides[sideIndex];
    // Check if this side should be skipped (only 1 option remaining)
    const activeCount = side.options.filter(o => !o.eliminated).length;
    if (activeCount <= 1) continue;
    
    // Get indices in the correct order
    const indices = side.options.map((_, idx) => idx);
    if (reverse) indices.reverse();
    
    for (const optionIndex of indices) {
      if (!side.options[optionIndex].eliminated) {
        result.push({ sideIndex, optionIndex });
      }
    }
  }
  
  return result;
};

// Check if game is finished
export const isGameFinished = (sides: GameSide[]): boolean => {
  return sides.every(side => {
    const activeCount = side.options.filter(o => !o.eliminated).length;
    return activeCount === 1;
  });
};

// Get final results
export const getFinalResults = (sides: GameSide[]): {
  profession: string;
  children: number;
  partner: string;
  wealth: string;
} => {
  const profession = sides[0].options.find(o => !o.eliminated)?.value || '';
  const children = parseInt(sides[1].options.find(o => !o.eliminated)?.value || '0');
  const partner = sides[2].options.find(o => !o.eliminated)?.value || '';
  const wealth = sides[3].options.find(o => !o.eliminated)?.value || '';
  
  return { profession, children, partner, wealth };
};

// Generate random marriage age (minAge to MAX_MARRIAGE_AGE)
export const MAX_MARRIAGE_AGE = 110;
export const MIN_PLAYER_AGE = 10;

export const generateRandomCycle = (minAge: number = 13): number => {
  const maxAge = minAge + 25;
  const range = maxAge - minAge + 1;
  return Math.floor(Math.random() * range) + minAge;
};

// Speed calculation based on player age
// Constants for easy adjustment
const BASE_SPEED_MS = 1000;     // Base speed: 1 second
const SPEED_DECREASE_MS = 300;  // Decrease per age bracket
const AGE_BRACKET = 20;         // Every 20 years
const MIN_SPEED_MS = 150;       // Minimum speed limit

export const calculateGameSpeed = (cycleNumber: number): number => {
  // Calculate how many brackets above 20
  const bracketsAbove20 = Math.max(0, Math.floor((cycleNumber - 1) / AGE_BRACKET));
  
  // Calculate speed reduction
  const reduction = bracketsAbove20 * SPEED_DECREASE_MS;
  
  // Calculate final speed
  const calculatedSpeed = BASE_SPEED_MS - reduction;
  
  // Ensure minimum speed
  return Math.max(calculatedSpeed, MIN_SPEED_MS);
};
