import { motion } from 'framer-motion';
import { Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from '@/components/SettingsDialog';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0 stars-bg opacity-50" />
      
      {/* Floating orbs decoration */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"
        animate={{ 
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"
        animate={{ 
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />

      {/* Header */}
      <header className="relative z-10 flex justify-end p-4">
        <SettingsDialog />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo/Icon */}
          <motion.div
            className="mb-6"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="text-7xl md:text-8xl">🔮</span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            className="text-5xl md:text-6xl font-display text-primary text-glow mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Destino
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-xl text-muted-foreground mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            O clássico jogo de papel
          </motion.p>
          
          {/* Description */}
          <motion.p 
            className="text-muted-foreground mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Descubra quando e com quem vai casar, quantos filhos terá, 
            qual será sua profissão e posição social. 
            Deixe o destino guiar sua jornada!
          </motion.p>

          {/* Play button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={() => navigate('/game')}
              className="btn-mystic px-10 py-7 text-xl"
            >
              <Play className="w-6 h-6 mr-3" />
              Começar Jogo
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div 
            className="mt-12 grid grid-cols-3 gap-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[
              { icon: '💼', label: 'Profissão' },
              { icon: '💍', label: 'Casamento' },
              { icon: '💰', label: 'Fortuna' },
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                className="p-3 card-mystic rounded-lg"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ delay: idx * 0.1 }}
              >
                <span className="text-2xl block mb-1">{item.icon}</span>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center space-y-2">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          Seus dados ficam apenas no seu dispositivo
        </p>
        <a 
          href="https://antonio-abrantes.github.io/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-primary/60 hover:text-primary transition-colors"
        >
          © 2025 ToniLab
        </a>
      </footer>
    </div>
  );
};

export default Index;
