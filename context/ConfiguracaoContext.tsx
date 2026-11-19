
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

// ============================================
// TIPOS
// ============================================

export type Tema = 'claro' | 'escuro';

export type Preferencias = {
  tema: Tema;
  altoContraste: boolean;
  fonteGrande: boolean;
  notificacoes: boolean;
  som: boolean;
};

// ============================================
// PREFERÊNCIAS PADRÃO
// ============================================

const PADRAO: Preferencias = {
  tema: 'claro',
  altoContraste: false,
  fonteGrande: false,
  notificacoes: true,
  som: true,
};

const CHAVE_STORAGE = '@educateach:preferencias';

// ============================================
// TEMA CLARO
// ============================================

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
  perigoFundo: '#FDECEA',
  sucesso: '#0E9F6E',
  sucessoFundo: '#E6F6EF',
  estrela: '#F59E0B',
  bloqueado: '#B9B9C5',
  acento: '#F59E0B',
  codigoFundo: '#1E1B2E',
  codigoTexto: '#ECE8F7',
  textoSobreCor: '#FFFFFF',
};

// ============================================
// TEMA ESCURO
// ============================================

const CORES_ESCURO: typeof CORES_NORMAL = {
  caixaSobrePrimaria: 'rgba(255,255,255,0.10)',
  fundo: '#171525',
  superficie: '#262238',
  texto: '#F2EEFF',
  textoSuave: '#B5AEC9',
  borda: '#3A344F',
  primaria: '#8278F5',
  primariaClara: '#383254',
  textoPrimaria: '#FFFFFF',
  iconeFundo: '#383254',
  perigo: '#FF7777',
  perigoFundo: '#49272D',
  sucesso: '#5DD6A0',
  sucessoFundo: '#1D3B32',
  estrela: '#FFC857',
  bloqueado: '#615C70',
  acento: '#FFC857',
  codigoFundo: '#100F1A',
  codigoTexto: '#ECE8F7',
  textoSobreCor: '#FFFFFF',
};

// ============================================
// ALTO CONTRASTE
// ============================================

const CORES_ALTO_CONTRASTE: typeof CORES_NORMAL = {
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
  perigoFundo: '#3B0A0A',
  sucesso: '#69F0AE',
  sucessoFundo: '#00331C',
  estrela: '#FFD600',
  bloqueado: '#5E5E5E',
  acento: '#FFD600',
  codigoFundo: '#000000',
  codigoTexto: '#FFFFFF',
  textoSobreCor: '#000000',
};

// ============================================
// TIPOS DO CONTEXTO
// ============================================

export type Cores = typeof CORES_NORMAL;

type ConfiguracaoContextType = Preferencias & {
  alterar: (
    chave: keyof Omit<Preferencias, 'tema'>,
    valor: boolean
  ) => void;

  alterarTema: (tema: Tema) => void;

  cores: Cores;

  fonte: (tamanho: number) => number;
};

// ============================================
// CONTEXTO
// ============================================

const ConfiguracaoContext = createContext<ConfiguracaoContextType>({
  ...PADRAO,

  alterar: () =>
    console.warn(
      'ConfiguracaoProvider ausente: a preferência não foi salva'
    ),

  alterarTema: () =>
    console.warn(
      'ConfiguracaoProvider ausente: o tema não foi alterado'
    ),

  cores: CORES_NORMAL,

  fonte: (tamanho: number) => tamanho,
});

// ============================================
// PROVIDER
// ============================================

export function ConfiguracaoProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [prefs, setPrefs] = useState<Preferencias>(PADRAO);

  // Carrega as preferências salvas.
  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const salvo = await AsyncStorage.getItem(CHAVE_STORAGE);

        if (salvo && ativo) {
          const preferenciasSalvas = JSON.parse(salvo);

          setPrefs({
            ...PADRAO,
            ...preferenciasSalvas,

            // Garante que apenas temas válidos sejam carregados.
            tema:
              preferenciasSalvas.tema === 'escuro'
                ? 'escuro'
                : 'claro',
          });
        }
      } catch (error) {
        console.warn(
          'Não foi possível carregar as preferências:',
          error
        );
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  // Salva as preferências no AsyncStorage.
  function salvarPreferencias(novas: Preferencias) {
    AsyncStorage.setItem(
      CHAVE_STORAGE,
      JSON.stringify(novas)
    ).catch((error) => {
      console.warn(
        'Não foi possível salvar as preferências:',
        error
      );
    });
  }

  // Altera as preferências booleanas.
  function alterar(
    chave: keyof Omit<Preferencias, 'tema'>,
    valor: boolean
  ) {
    setPrefs((atuais) => {
      const novas = {
        ...atuais,
        [chave]: valor,
      };

      salvarPreferencias(novas);

      return novas;
    });
  }

  // Altera o tema claro ou escuro.
  function alterarTema(novoTema: Tema) {
    setPrefs((atuais) => {
      const novas = {
        ...atuais,
        tema: novoTema,
      };

      salvarPreferencias(novas);

      return novas;
    });
  }

  // ============================================
  // SELEÇÃO DAS CORES
  // ============================================

  // Alto contraste tem prioridade sobre o tema.
  const cores: Cores = prefs.altoContraste
    ? CORES_ALTO_CONTRASTE
    : prefs.tema === 'escuro'
      ? CORES_ESCURO
      : CORES_NORMAL;

  // Aumenta o tamanho das fontes.
  const fonte = (tamanho: number) =>
    prefs.fonteGrande
      ? Math.round(tamanho * 1.25)
      : tamanho;

  return (
    <ConfiguracaoContext.Provider
      value={{
        ...prefs,
        alterar,
        alterarTema,
        cores,
        fonte,
      }}
    >
      {children}
    </ConfiguracaoContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useConfiguracao() {
  return useContext(ConfiguracaoContext);
}
