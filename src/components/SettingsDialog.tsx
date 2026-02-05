import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, Shield, Settings, User, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { GameResult, getGameHistory, clearGameHistory, getWealthLabel, getUserSettings, saveUserSettings } from '@/lib/db';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SettingsDialog = () => {
  const [history, setHistory] = useState<GameResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [savedName, setSavedName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      loadUserSettings();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    const results = await getGameHistory();
    setHistory(results);
  };

  const loadUserSettings = async () => {
    const settings = await getUserSettings();
    if (settings) {
      setPlayerName(settings.playerName);
      setSavedName(settings.playerName);
    }
  };

  const handleClearHistory = async () => {
    await clearGameHistory();
    setHistory([]);
  };

  const handleSaveName = async () => {
    const finalName = playerName.trim() || 'Anônimo';
    await saveUserSettings({
      playerName: finalName,
      isAnonymous: !playerName.trim(),
    });
    setSavedName(finalName);
  };

  const hasNameChanged = playerName !== savedName;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="card-mystic border-border max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-primary flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Gerencie seu perfil e histórico
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="text-xs">
              <User className="w-3 h-3 mr-1" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="w-3 h-3 mr-1" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="about" className="text-xs">
              <Info className="w-3 h-3 mr-1" />
              Sobre
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="flex-1 space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Seu Nome</label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Digite seu nome"
                className="input-mystic"
              />
              <p className="text-xs text-muted-foreground">
                Este nome será usado em todos os jogos futuros.
              </p>
            </div>
            {hasNameChanged && (
              <Button onClick={handleSaveName} className="w-full btn-mystic">
                Salvar Nome
              </Button>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 overflow-y-auto space-y-3 py-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl block mb-2">🌌</span>
                <p>Nenhum destino revelado ainda.</p>
                <p className="text-sm">Jogue para descobrir seu futuro!</p>
              </div>
            ) : (
              history.map((game, idx) => (
                <motion.div
                  key={game.id}
                  className="p-4 bg-muted/20 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(game.date), "dd 'de' MMM 'de' yyyy, HH:mm", { locale: ptBR })}
                    </span>
                    {game.playerName && (
                      <span className="text-xs text-primary font-medium">
                        {game.playerName}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">💼</span> {game.profession}
                    </div>
                    <div>
                      <span className="text-muted-foreground">💍</span> {game.partner}
                    </div>
                    <div>
                      <span className="text-muted-foreground">👶</span> {game.children} filhos
                    </div>
                    <div>
                      <span className="text-muted-foreground">💰</span> {getWealthLabel(game.wealth)}
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {history.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full mt-4">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Histórico
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="card-mystic border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">Limpar histórico?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Todos os destinos salvos serão apagados permanentemente. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearHistory}>
                      Apagar Tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="flex-1 space-y-4 py-4">
            <div className="text-center space-y-4">
              <span className="text-6xl">🔮</span>
              <h3 className="text-xl font-display text-primary">Destino</h3>
              <p className="text-sm text-muted-foreground">
                O clássico jogo de papel agora em versão digital
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Desenvolvido por</span>
                <a 
                  href="https://antonio-abrantes.github.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Antônio Abrantes
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Data de desenvolvimento</span>
                <span>Fevereiro 2025</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Versão</span>
                <span>1.0.0</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Privacy notice */}
        <div className="pt-4 border-t border-border mt-4">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Seus dados são armazenados apenas no seu dispositivo. 
              Não coletamos informações pessoais nem enviamos dados externos.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
