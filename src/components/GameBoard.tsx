import { motion, AnimatePresence } from 'framer-motion';
import { GameSide } from '@/lib/gameLogic';
import { getWealthLabel } from '@/lib/db';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  sides: GameSide[];
  cycleNumber: number;
  highlightedPosition: { sideIndex: number; optionIndex: number } | null;
  lastEliminated: { sideIndex: number; optionIndex: number } | null;
}

const OptionBox = ({ 
  value, 
  eliminated, 
  isHighlighted, 
  isEliminating,
  isWealth = false,
}: { 
  value: string; 
  eliminated: boolean; 
  isHighlighted: boolean;
  isEliminating: boolean;
  isWealth?: boolean;
}) => {
  const displayValue = isWealth ? getWealthLabel(value) : value;
  
  return (
    <motion.div
      className={cn(
        "option-box px-3 py-2 rounded-lg text-center min-w-[60px] font-body text-sm md:text-base transition-all duration-300",
        eliminated && "eliminated opacity-40 scale-95",
        isHighlighted && !eliminated && "active",
        !eliminated && !isHighlighted && "hover:border-primary/50"
      )}
      animate={isEliminating ? {
        scale: [1, 1.2, 0.95],
        opacity: [1, 1, 0.4],
      } : {}}
      transition={{ duration: 0.5 }}
    >
      <span className={cn(
        "transition-all duration-300",
        eliminated && "line-through text-muted-foreground"
      )}>
        {displayValue}
      </span>
    </motion.div>
  );
};

export const GameBoard = ({ 
  sides, 
  cycleNumber, 
  highlightedPosition,
  lastEliminated,
}: GameBoardProps) => {
  const professions = sides[0];
  const children = sides[1];
  const partners = sides[2];
  const wealth = sides[3];

  const isOptionHighlighted = (sideIndex: number, optionIndex: number) => {
    return highlightedPosition?.sideIndex === sideIndex && highlightedPosition?.optionIndex === optionIndex;
  };

  const isOptionEliminating = (sideIndex: number, optionIndex: number) => {
    return lastEliminated?.sideIndex === sideIndex && lastEliminated?.optionIndex === optionIndex;
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Stars background decoration */}
      <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none" />
      
      <div className="relative flex flex-col items-center gap-4 p-4 md:p-8">
        {/* Top - Children */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs md:text-sm text-muted-foreground font-display uppercase tracking-wider">
            {children.label}
          </span>
          <div className="flex gap-2 md:gap-4">
            {children.options.map((opt, idx) => (
              <OptionBox
                key={idx}
                value={opt.value}
                eliminated={opt.eliminated}
                isHighlighted={isOptionHighlighted(1, idx)}
                isEliminating={isOptionEliminating(1, idx)}
              />
            ))}
          </div>
        </div>

        {/* Middle row - Professions | Center | Partners */}
        <div className="flex items-center gap-4 md:gap-8 w-full justify-center">
          {/* Left - Professions */}
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm text-muted-foreground font-display uppercase tracking-wider writing-vertical-lr rotate-180">
              {professions.label}
            </span>
            <div className="flex flex-col gap-2">
              {professions.options.map((opt, idx) => (
                <OptionBox
                  key={idx}
                  value={opt.value}
                  eliminated={opt.eliminated}
                  isHighlighted={isOptionHighlighted(0, idx)}
                  isEliminating={isOptionEliminating(0, idx)}
                />
              ))}
            </div>
          </div>

          {/* Center - Cycle Number */}
          <motion.div 
            className="card-mystic rounded-xl p-8 md:p-12 flex items-center justify-center animate-pulse-glow"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-5xl md:text-7xl font-display text-primary text-glow">
              {cycleNumber}
            </span>
          </motion.div>

          {/* Right - Partners */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-2">
              {partners.options.map((opt, idx) => (
                <OptionBox
                  key={idx}
                  value={opt.value}
                  eliminated={opt.eliminated}
                  isHighlighted={isOptionHighlighted(2, idx)}
                  isEliminating={isOptionEliminating(2, idx)}
                />
              ))}
            </div>
            <span className="text-xs md:text-sm text-muted-foreground font-display uppercase tracking-wider writing-vertical-lr">
              {partners.label}
            </span>
          </div>
        </div>

        {/* Bottom - Wealth */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2 md:gap-4">
            {wealth.options.map((opt, idx) => (
              <OptionBox
                key={idx}
                value={opt.value}
                eliminated={opt.eliminated}
                isHighlighted={isOptionHighlighted(3, idx)}
                isEliminating={isOptionEliminating(3, idx)}
                isWealth
              />
            ))}
          </div>
          <span className="text-xs md:text-sm text-muted-foreground font-display uppercase tracking-wider">
            {wealth.label}
          </span>
        </div>
      </div>
    </div>
  );
};
