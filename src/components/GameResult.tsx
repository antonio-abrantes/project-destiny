import { motion } from 'framer-motion';
import { Heart, Briefcase, Users, Coins, RefreshCw, Home, Cake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWealthLabel } from '@/lib/db';
import { useEffect } from 'react';

interface GameResultProps {
  profession: string;
  children: number;
  partner: string;
  wealth: string;
  marriageAge: number;
  playerName?: string;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export const GameResult = ({
  profession,
  children,
  partner,
  wealth,
  marriageAge,
  playerName,
  onPlayAgain,
  onNewGame,
}: GameResultProps) => {
  useEffect(() => {
    // Fire confetti using dynamic import
    const fireConfetti = async () => {
      const confetti = (await import('canvas-confetti')).default;
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#D4AF37', '#9B59B6', '#3498DB'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#D4AF37', '#9B59B6', '#3498DB'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    };

    fireConfetti();
  }, []);

  const displayName = playerName && playerName !== 'Anônimo' ? playerName : null;

  const resultItems = [
    { icon: Briefcase, label: 'Profissão', value: profession, color: 'text-cosmic-blue' },
    { icon: Heart, label: 'Vai casar com', value: partner, color: 'text-pink-400' },
    { icon: Cake, label: 'Idade do casamento', value: `${marriageAge} anos`, color: 'text-orange-400' },
    { icon: Users, label: 'Filhos', value: String(children), color: 'text-green-400' },
    { icon: Coins, label: 'Fortuna', value: getWealthLabel(wealth), color: 'text-primary' },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="card-mystic rounded-2xl p-8 max-w-md w-full text-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-6xl">🔮</span>
          <h2 className="text-3xl font-display text-primary text-glow mt-4 mb-2">
            {displayName ? `Parabéns, ${displayName}!` : 'Parabéns!'}
          </h2>
          <p className="text-muted-foreground mb-6">
            Seu destino foi selado! As estrelas revelaram seu futuro...
          </p>
        </motion.div>

        <div className="space-y-4 mb-8">
          {resultItems.map((item, idx) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
            >
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <div className="text-left flex-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </span>
                <p className="font-display text-lg">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={onPlayAgain}
            className="flex-1 btn-mystic"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Jogar Novamente
          </Button>
          <Button
            onClick={onNewGame}
            variant="outline"
            className="flex-1 border-primary/30 hover:bg-primary/10"
          >
            <Home className="w-4 h-4 mr-2" />
            Novo Jogo
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
