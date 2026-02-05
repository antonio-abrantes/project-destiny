import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, Wand2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { generateRandomChildren, generateSequentialChildren, generateRandomCycle, MAX_MARRIAGE_AGE, MIN_PLAYER_AGE } from '@/lib/gameLogic';
import { GameConfig } from '@/hooks/useGame';
import { getUserSettings, saveUserSettings } from '@/lib/db';

interface ConfigWizardProps {
  onComplete: (config: GameConfig) => void;
  onCancel: () => void;
  existingConfig?: GameConfig | null;
}

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export const ConfigWizard = ({ onComplete, onCancel, existingConfig }: ConfigWizardProps) => {
  const [step, setStep] = useState(existingConfig ? 5 : 0);
  const [direction, setDirection] = useState(1);
  
  // Player state
  const [playerName, setPlayerName] = useState('');
  const [playerAge, setPlayerAge] = useState<number>(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loadedSettings, setLoadedSettings] = useState(false);
  
  // Config state
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [optionCount, setOptionCount] = useState(3);
  const [useRandomChildren, setUseRandomChildren] = useState(false);
  const [professions, setProfessions] = useState<string[]>(existingConfig?.professions || []);
  const [partners, setPartners] = useState<string[]>(existingConfig?.partners || []);
  const [children, setChildren] = useState<number[]>(existingConfig?.children || []);
  const [cycleNumber, setCycleNumber] = useState<number>(0);
  const [useDestinyCycle, setUseDestinyCycle] = useState(true);

  // Load saved user settings
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getUserSettings();
      if (settings) {
        setPlayerName(settings.playerName);
        setPlayerAge(settings.playerAge || 0);
        setIsAnonymous(settings.isAnonymous);
      }
      setLoadedSettings(true);
    };
    loadSettings();
  }, []);

  const totalSteps = existingConfig ? 1 : 6;

  const nextStep = async () => {
    setDirection(1);
    
    // Save player settings when leaving step 0
    if (step === 0) {
      const finalName = playerName.trim() || 'Anônimo';
      const finalIsAnonymous = !playerName.trim();
      await saveUserSettings({
        playerName: finalName,
        playerAge: playerAge,
        isAnonymous: finalIsAnonymous,
      });
      setPlayerName(finalName);
      setIsAnonymous(finalIsAnonymous);
    }
    
    if (step === 1) {
      // After mode selection, initialize arrays
      const count = isCustomMode ? optionCount : 3;
      if (professions.length === 0) {
        setProfessions(Array(count).fill(''));
        setPartners(Array(count).fill(''));
        setChildren(useRandomChildren 
          ? generateRandomChildren(count) 
          : generateSequentialChildren(count)
        );
      }
    }
    
    if (step === 2 && !existingConfig) {
      // After children config, regenerate if needed
      const count = isCustomMode ? optionCount : 3;
      setChildren(useRandomChildren 
        ? generateRandomChildren(count) 
        : generateSequentialChildren(count)
      );
    }
    
    setStep(s => Math.min(s + 1, existingConfig ? 5 : 5));
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, existingConfig ? 5 : 0));
  };

  const handleComplete = () => {
    const finalCycle = useDestinyCycle ? generateRandomCycle(playerAge) : cycleNumber;
    onComplete({
      professions: existingConfig?.professions || professions,
      children: existingConfig?.children || children,
      partners: existingConfig?.partners || partners,
      cycleNumber: finalCycle,
    });
  };

  const updateProfession = (index: number, value: string) => {
    const newProf = [...professions];
    newProf[index] = value;
    setProfessions(newProf);
  };

  const updatePartner = (index: number, value: string) => {
    const newPartners = [...partners];
    newPartners[index] = value;
    setPartners(newPartners);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return playerAge >= MIN_PLAYER_AGE; // Age is required
      case 1: return true;
      case 2: return true;
      case 3: return professions.every(p => p.trim().length > 0);
      case 4: return partners.every(p => p.trim().length > 0);
      case 5: return useDestinyCycle || (cycleNumber >= playerAge && cycleNumber <= MAX_MARRIAGE_AGE);
      default: return true;
    }
  };

  const renderStep = () => {
    if (existingConfig && step === 5) {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Wand2 className="w-12 h-12 mx-auto text-primary" />
            <h2 className="text-2xl font-display text-primary">Novo Destino</h2>
            <p className="text-muted-foreground">
              Com quantos anos você acha que vai casar?
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 card-mystic rounded-lg">
              <span className="font-body">Deixar o destino decidir</span>
              <Switch
                checked={useDestinyCycle}
                onCheckedChange={setUseDestinyCycle}
              />
            </div>

            {!useDestinyCycle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm text-muted-foreground mb-2">
                  Idade de casamento ({playerAge}-{MAX_MARRIAGE_AGE} anos)
                </label>
                <Input
                  type="number"
                  min={playerAge}
                  max={MAX_MARRIAGE_AGE}
                  value={cycleNumber || ''}
                  onChange={(e) => setCycleNumber(parseInt(e.target.value) || 0)}
                  className="input-mystic"
                  placeholder="Digite sua idade..."
                />
              </motion.div>
            )}
          </div>
        </div>
      );
    }

    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <User className="w-12 h-12 mx-auto text-primary animate-float" />
              <h2 className="text-2xl font-display text-primary">Quem é Você?</h2>
              <p className="text-muted-foreground">
                Informe sua idade e nome (opcional)
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">
                  Sua idade <span className="text-destructive">*</span>
                </label>
                <Select
                  value={playerAge ? String(playerAge) : ''}
                  onValueChange={(v) => setPlayerAge(parseInt(v))}
                >
                  <SelectTrigger className="input-mystic">
                    <SelectValue placeholder="Selecione sua idade" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from({ length: MAX_MARRIAGE_AGE - MIN_PLAYER_AGE + 1 }, (_, i) => MIN_PLAYER_AGE + i).map(age => (
                      <SelectItem key={age} value={String(age)}>{age} anos</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">
                  Seu nome (opcional)
                </label>
                <Input
                  value={playerName === 'Anônimo' ? '' : playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="input-mystic text-center text-lg"
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {playerName.trim() && playerName !== 'Anônimo'
                  ? `O destino será revelado para ${playerName}` 
                  : 'Se não preencher, continuará como Anônimo'}
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Sparkles className="w-12 h-12 mx-auto text-primary animate-float" />
              <h2 className="text-2xl font-display text-primary">Modo de Jogo</h2>
              <p className="text-muted-foreground">
                Como você deseja descobrir seu destino?
              </p>
            </div>

            <div className="grid gap-4">
              <motion.button
                className={`p-6 card-mystic rounded-xl text-left transition-all ${
                  !isCustomMode ? 'ring-2 ring-primary shadow-glow' : ''
                }`}
                onClick={() => setIsCustomMode(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="font-display text-lg text-primary mb-2">Modo Clássico</h3>
                <p className="text-sm text-muted-foreground">
                  3 opções por lado, como na brincadeira tradicional
                </p>
              </motion.button>

              <motion.button
                className={`p-6 card-mystic rounded-xl text-left transition-all ${
                  isCustomMode ? 'ring-2 ring-primary shadow-glow' : ''
                }`}
                onClick={() => setIsCustomMode(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="font-display text-lg text-primary mb-2">Modo Customizado</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha até 7 opções por lado para mais possibilidades
                </p>
              </motion.button>
            </div>

            {isCustomMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <label className="block text-sm text-muted-foreground">
                  Quantas opções por lado?
                </label>
                <Select
                  value={String(optionCount)}
                  onValueChange={(v) => setOptionCount(parseInt(v))}
                >
                  <SelectTrigger className="input-mystic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} opções</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-4xl">👶</span>
              <h2 className="text-2xl font-display text-primary">Quantidade de Filhos</h2>
              <p className="text-muted-foreground">
                Como definir as opções de filhos?
              </p>
            </div>

            <div className="grid gap-4">
              <motion.button
                className={`p-6 card-mystic rounded-xl text-left transition-all ${
                  !useRandomChildren ? 'ring-2 ring-primary shadow-glow' : ''
                }`}
                onClick={() => setUseRandomChildren(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="font-display text-lg text-primary mb-2">Sequencial</h3>
                <p className="text-sm text-muted-foreground">
                  1, 2, 3... em ordem crescente
                </p>
              </motion.button>

              <motion.button
                className={`p-6 card-mystic rounded-xl text-left transition-all ${
                  useRandomChildren ? 'ring-2 ring-primary shadow-glow' : ''
                }`}
                onClick={() => setUseRandomChildren(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="font-display text-lg text-primary mb-2">Deixar o Destino Decidir</h3>
                <p className="text-sm text-muted-foreground">
                  Números aleatórios entre 1 e 12
                </p>
              </motion.button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-4xl">💼</span>
              <h2 className="text-2xl font-display text-primary">Profissões</h2>
              <p className="text-muted-foreground">
                O que o destino reserva para sua carreira?
              </p>
            </div>

            <div className="space-y-3">
              {professions.map((prof, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Input
                    value={prof}
                    onChange={(e) => updateProfession(idx, e.target.value)}
                    placeholder={`Profissão ${idx + 1}`}
                    className="input-mystic"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-4xl">💍</span>
              <h2 className="text-2xl font-display text-primary">Com Quem Vai Casar?</h2>
              <p className="text-muted-foreground">
                Digite os nomes dos possíveis amores do seu destino
              </p>
            </div>

            <div className="space-y-3">
              {partners.map((partner, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Input
                    value={partner}
                    onChange={(e) => updatePartner(idx, e.target.value)}
                    placeholder={`Nome ${idx + 1}`}
                    className="input-mystic"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-4xl">💒</span>
              <h2 className="text-2xl font-display text-primary">Idade de Casamento</h2>
              <p className="text-muted-foreground">
                Com quantos anos você acha que vai casar?
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 card-mystic rounded-lg">
                <span className="font-body">Deixar o destino decidir</span>
                <Switch
                  checked={useDestinyCycle}
                  onCheckedChange={setUseDestinyCycle}
                />
              </div>

              {!useDestinyCycle && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm text-muted-foreground mb-2">
                    Idade de casamento ({playerAge}-{MAX_MARRIAGE_AGE} anos)
                  </label>
                  <Input
                    type="number"
                    min={playerAge}
                    max={MAX_MARRIAGE_AGE}
                    value={cycleNumber || ''}
                    onChange={(e) => setCycleNumber(parseInt(e.target.value) || 0)}
                    className="input-mystic"
                    placeholder="Digite sua idade..."
                  />
                </motion.div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!loadedSettings && !existingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Progress indicator */}
        {!existingConfig && (
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <motion.div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === step ? 'bg-primary w-8' : idx < step ? 'bg-primary/50' : 'bg-muted'
                }`}
                animate={{ scale: idx === step ? 1.2 : 1 }}
              />
            ))}
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {(step > 0 && !existingConfig) ? (
            <Button
              variant="ghost"
              onClick={prevStep}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
          )}

          {(step < 5 && !existingConfig) ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="btn-mystic"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed()}
              className="btn-mystic"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Revelar Destino
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
