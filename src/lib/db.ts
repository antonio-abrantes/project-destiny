import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface GameResult {
  id?: number;
  playerName?: string;
  profession: string;
  children: number;
  partner: string;
  wealth: string;
  date: Date;
}

export interface UserSettings {
  id: string;
  playerName: string;
  playerAge: number;
  isAnonymous: boolean;
}

export interface AppSettings {
  id: string;
  value: string;
}

interface DestinoDB extends DBSchema {
  games: {
    key: number;
    value: GameResult;
    indexes: { 'by-date': Date };
  };
  userSettings: {
    key: string;
    value: UserSettings;
  };
  appSettings: {
    key: string;
    value: AppSettings;
  };
}

let dbPromise: Promise<IDBPDatabase<DestinoDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<DestinoDB>('destino-db', 2, {
      upgrade(db, oldVersion) {
        // Version 1: games store
        if (oldVersion < 1) {
          const store = db.createObjectStore('games', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('by-date', 'date');
        }
        
        // Version 2: userSettings and appSettings stores
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('userSettings')) {
            db.createObjectStore('userSettings', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('appSettings')) {
            db.createObjectStore('appSettings', { keyPath: 'id' });
          }
        }
      },
    });
  }
  return dbPromise;
};

export const saveGameResult = async (result: Omit<GameResult, 'id' | 'date'>): Promise<number> => {
  const db = await getDB();
  const userSettings = await getUserSettings();
  return db.add('games', {
    ...result,
    playerName: userSettings?.playerName || 'Anônimo',
    date: new Date(),
  });
};

export const getGameHistory = async (): Promise<GameResult[]> => {
  const db = await getDB();
  const results = await db.getAllFromIndex('games', 'by-date');
  return results.reverse(); // Most recent first
};

export const clearGameHistory = async (): Promise<void> => {
  const db = await getDB();
  await db.clear('games');
};

export const getWealthLabel = (code: string): string => {
  switch (code) {
    case 'P': return 'Pobre';
    case 'R': return 'Rico';
    case 'M': return 'Milionário';
    default: return code;
  }
};

// User Settings functions
export const getUserSettings = async (): Promise<UserSettings | undefined> => {
  const db = await getDB();
  return db.get('userSettings', 'current');
};

export const saveUserSettings = async (settings: Omit<UserSettings, 'id'>): Promise<void> => {
  const db = await getDB();
  await db.put('userSettings', { ...settings, id: 'current' });
};

export const clearUserSettings = async (): Promise<void> => {
  const db = await getDB();
  await db.delete('userSettings', 'current');
};

// App Settings functions (for future configurations)
export const getAppSetting = async (key: string): Promise<string | undefined> => {
  const db = await getDB();
  const setting = await db.get('appSettings', key);
  return setting?.value;
};

export const setAppSetting = async (key: string, value: string): Promise<void> => {
  const db = await getDB();
  await db.put('appSettings', { id: key, value });
};
