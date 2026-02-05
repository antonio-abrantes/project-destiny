import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, LogOut, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { GameBoard } from '@/components/GameBoard';
import { ConfigWizard } from '@/components/ConfigWizard';
import { GameResult } from '@/components/GameResult';
import { LandscapeHint } from '@/components/LandscapeHint';
import { useGame, GameConfig } from '@/hooks/useGame';
import { saveGameResult, getUserSettings } from '@/lib/db';
import { useNavigate } from 'react-router-dom';
import { generateRandomCycle } from '@/lib/gameLogic';

type GamePhase = 'config' | 'playing' | 'finished';

const GamePage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>('config');
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [savedConfig, setSavedConfig] = useState<GameConfig | null>(null);
  const [showRestartConfig, setShowRestartConfig] = useState(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [playerAge, setPlayerAge] = useState<number>(20);

  // Load player settings
  useEffect(() => {
    const loadPlayerSettings = async () => {
      const settings = await getUserSettings();
      if (settings?.playerName) {
        setPlayerName(settings.playerName);
      }
      if (settings?.playerAge) {
        setPlayerAge(settings.playerAge);
      }
    };
    loadPlayerSettings();
  }, []);
  
  const {
    gameState,
    highlightedPosition,
    lastEliminated,
    initGame,
    playRound,
    resetGame,
    restartWithSameData,
    getResults,
  } = useGame(playerAge);

  const handleConfigComplete = useCallback(async (config: GameConfig) => {
    // Reload player settings (age might have changed in wizard)
    const settings = await getUserSettings();
    if (settings?.playerAge) {
      setPlayerAge(settings.playerAge);
    }
    setSavedConfig(config);
    initGame(config);
    setPhase('playing');
    setShowRestartConfig(false);
  }, [initGame]);

  const handlePlayRound = useCallback(() => {
    playRound();
  }, [playRound]);

  const handleExit = () => {
    resetGame();
    navigate('/');
  };

  const handlePlayAgain = () => {
    // Hide result first, then show config
    setPhase('config');
    setShowRestartConfig(true);
  };

  const handleNewGame = async () => {
    // Save current result
    const results = getResults();
    if (results) {
      await saveGameResult(results);
    }
    resetGame();
    setSavedConfig(null);
    setShowRestartConfig(false);
    setPhase('config');
  };

  const handleFinish = useCallback(async () => {
    const results = getResults();
    if (results) {
      await saveGameResult(results);
    }
    setPhase('finished');
  }, [getResults]);

  // Check if game finished
  if (gameState?.isFinished && phase === 'playing') {
    setTimeout(() => handleFinish(), 500);
  }

  const results = getResults();

  return (
    <div className="min-h-screen relative">
      {/* Exit button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowExitDialog(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="card-mystic border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Abandonar o Destino?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Todo o progresso atual será perdido. O jogo não será salvo no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Jogando</AlertDialogCancel>
            <AlertDialogAction onClick={handleExit}>
              Sair do Jogo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Config phase */}
      <AnimatePresence mode="wait">
        {phase === 'config' && !showRestartConfig && (
          <ConfigWizard
            onComplete={handleConfigComplete}
            onCancel={() => navigate('/')}
          />
        )}

        {showRestartConfig && savedConfig && (
          <ConfigWizard
            onComplete={handleConfigComplete}
            onCancel={() => setShowRestartConfig(false)}
            existingConfig={savedConfig}
          />
        )}

        {/* Playing phase */}
        {phase === 'playing' && gameState && !showRestartConfig && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-4 pt-16"
          >
            <GameBoard
              sides={gameState.sides}
              cycleNumber={gameState.cycleNumber}
              highlightedPosition={highlightedPosition}
              lastEliminated={lastEliminated}
            />

            <motion.div 
              className="mt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handlePlayRound}
                disabled={gameState.isPlaying || gameState.isFinished}
                className="btn-mystic px-8 py-6 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                {gameState.isPlaying ? 'Contando...' : 'Iniciar Rodada'}
              </Button>
            </motion.div>

            {/* Instructions */}
            <p className="mt-4 text-sm text-muted-foreground text-center max-w-md">
              Clique no botão para iniciar a contagem. Quando o ciclo terminar, 
              uma opção será eliminada até restar apenas uma de cada lado.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results overlay */}
      {phase === 'finished' && results && !showRestartConfig && gameState && (
        <GameResult
          profession={results.profession}
          children={results.children}
          partner={results.partner}
          wealth={results.wealth}
          marriageAge={gameState.cycleNumber}
          playerName={playerName}
          onPlayAgain={handlePlayAgain}
          onNewGame={handleNewGame}
        />
      )}

      {/* Landscape hint for mobile */}
      {phase === 'playing' && <LandscapeHint />}
    </div>
  );
};

export default GamePage;
