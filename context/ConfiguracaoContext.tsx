import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Preferencias = {
  altoContraste: boolean;
  fonteGrande: boolean;
  notificacoes: boolean;
  som: boolean;
};

const PADRAO: Preferencias = {
  altoContraste: false,
  fonteGrande: false,
  notificacoes: true,
  som: true,
};

const CHAVE_STORAGE = '@educateach:preferencias';

const CORES_NORMAL = {
    caixaSobrePrimaria: 'rgba(255,255,255,0.15)',
  fundo: '#F5F5F7',
  superficie: '#FFFFFF',
  texto: '#212121',
  textoSuave: '#757575',
  borda: '#E5E5E5',
  primaria: '#673AB7',
  primariaClara: '#D1C4E9',
  textoPrimaria: '#FFFFFF',
  iconeFundo: '#EDE7F6',
  perigo: '#E53935',
};

export type Cores = typeof CORES_NORMAL;

const CORES_ALTO_CONTRASTE: Cores = {
    caixaSobrePrimaria: 'rgba(0,0,0,0.15)',
  fundo: '#000000',
  superficie: '#121212',
  texto: '#FFFFFF',
  textoSuave: '#E0E0E0',
  borda: '#FFFFFF',
  primaria: '#FFD600',
  primariaClara: '#8A7500',
  textoPrimaria: '#000000',
  iconeFundo: '#2A2A2A',
  perigo: '#FF8A80',
};

type ConfiguracaoContextType = Preferencias & {
  alterar: (chave: keyof Preferencias, valor: boolean) => void;
  cores: Cores;
  fonte: (tamanho: number) => number;
};

const ConfiguracaoContext = createContext<ConfiguracaoContextType>({
    ...PADRAO,
    alterar: () => console.warn('ConfiguracaoProvider ausente: a preferência não foi salva'),
    cores: CORES_NORMAL,
    fonte: (tamanho: number) => tamanho,
});

export function ConfiguracaoProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferencias>(PADRAO);

  useEffect(() => {
    async function carregar() {
      try {
        const salvo = await AsyncStorage.getItem(CHAVE_STORAGE);
        if (salvo) {
          setPrefs({ ...PADRAO, ...JSON.parse(salvo) });
        }
      } catch {
        
      }
    }
    carregar();
  }, []);

  function alterar(chave: keyof Preferencias, valor: boolean) {
    const novas = { ...prefs, [chave]: valor };
    setPrefs(novas);
    AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(novas)).catch(() => {});
  }

  const cores = prefs.altoContraste ? CORES_ALTO_CONTRASTE : CORES_NORMAL;

  const fonte = (tamanho: number) => (prefs.fonteGrande ? Math.round(tamanho * 1.25) : tamanho);

  return (
    <ConfiguracaoContext.Provider value={{ ...prefs, alterar, cores, fonte }}>
      {children}
    </ConfiguracaoContext.Provider>
  );
}

export function useConfiguracao() {
    return useContext(ConfiguracaoContext);
}