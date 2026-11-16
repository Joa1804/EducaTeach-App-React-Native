import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { useLicao } from '@/hooks/use-licao';
import { respostaCompleta, type Resposta } from '@/lib/licoes/correcao';
import type { Licao } from '@/lib/licoes/schemas';

import { ALVO_TOQUE } from './estilo';
import { Exercicio, ROTULO_TIPO } from './Exercicio';
import { FeedbackCorrecao } from './FeedbackCorrecao';
import { ResultadoAtividade } from './ResultadoAtividade';

type Props = {
  licao: Licao;
  onSair: () => void;
};

function vibrar(correta: boolean) {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(
    correta ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
  ).catch(() => {
    // Sem motor de vibração (ex.: simulador): o feedback visual basta.
  });
}

/** Tela de uma lição em andamento: barra de progresso, exercício atual e feedback. */
export function LicaoPlayer({ licao, onSair }: Props) {
  const { cores, fonte } = useConfiguracao();
  const styles = useMemo(() => criarEstilos(cores, fonte), [cores, fonte]);
  const insets = useSafeAreaInsets();

  const licaoAtual = useLicao(licao);
  const { fase, exercicio, resultado, rodada, progresso, verificar, continuar } = licaoAtual;
  const [resposta, setResposta] = useState<Resposta | null>(null);

  // Barra de progresso animada na thread de UI.
  const largura = useSharedValue(0);
  useEffect(() => {
    largura.value = withTiming(progresso, { duration: 350 });
  }, [largura, progresso]);
  const estiloBarra = useAnimatedStyle(() => ({ width: `${largura.value * 100}%` }));

  useEffect(() => {
    if (resultado) vibrar(resultado.correta);
  }, [resultado]);

  const handleVerificar = useCallback(() => {
    if (resposta) verificar(resposta);
  }, [resposta, verificar]);

  const handleContinuar = useCallback(() => {
    setResposta(null);
    continuar();
  }, [continuar]);

  const handleRefazer = useCallback(() => {
    setResposta(null);
    licaoAtual.reiniciar();
  }, [licaoAtual]);

  if (fase === 'concluida' && licaoAtual.desempenho) {
    return (
      <View style={[styles.tela, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ResultadoAtividade
          licao={licao}
          desempenho={licaoAtual.desempenho}
          conclusao={licaoAtual.conclusao}
          salvando={licaoAtual.salvando}
          erro={licaoAtual.erroAoSalvar}
          onTentarSalvar={licaoAtual.tentarSalvarDeNovo}
          onRefazer={handleRefazer}
          onContinuar={onSair}
        />
      </View>
    );
  }

  if (!exercicio) return null;

  const podeVerificar = respostaCompleta(exercicio, resposta);

  return (
    <View style={[styles.tela, { paddingTop: insets.top }]}>
      <View style={styles.topo}>
        <Pressable
          onPress={onSair}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Sair da lição"
          style={styles.fechar}
        >
          <Ionicons name="close" size={28} color={cores.textoSuave} />
        </Pressable>
        <View
          style={styles.barraFundo}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Progresso da lição"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progresso * 100) }}
        >
          <Animated.View style={[styles.barra, estiloBarra]} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.corpo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.corpo}
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.tipo}>{ROTULO_TIPO[exercicio.tipo]}</Text>
          <Text style={styles.enunciado} accessibilityRole="header">
            {exercicio.enunciado}
          </Text>
          <Exercicio
            key={`${exercicio.id}-${rodada}`}
            exercicio={exercicio}
            travado={fase === 'feedback'}
            resultado={resultado}
            onChange={setResposta}
          />
        </ScrollView>

        {fase === 'feedback' && resultado ? (
          <View style={{ paddingBottom: insets.bottom + 12 }}>
            <FeedbackCorrecao
              exercicio={exercicio}
              resultado={resultado}
              onContinuar={handleContinuar}
            />
          </View>
        ) : (
          <View style={[styles.rodape, { paddingBottom: insets.bottom + 12 }]}>
            <Pressable
              onPress={handleVerificar}
              disabled={!podeVerificar}
              accessibilityRole="button"
              accessibilityState={{ disabled: !podeVerificar }}
              style={({ pressed }) => [
                styles.botao,
                !podeVerificar && styles.botaoDesabilitado,
                pressed && styles.pressionado,
              ]}
            >
              <Text style={[styles.textoBotao, !podeVerificar && styles.textoDesabilitado]}>
                Verificar
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    tela: { flex: 1, backgroundColor: c.fundo },
    topo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    fechar: {
      width: ALVO_TOQUE,
      height: ALVO_TOQUE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    barraFundo: {
      flex: 1,
      height: 14,
      borderRadius: 999,
      backgroundColor: c.primariaClara,
      overflow: 'hidden',
    },
    barra: { height: '100%', borderRadius: 999, backgroundColor: c.sucesso },
    corpo: { flex: 1 },
    conteudo: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 12 },
    tipo: {
      fontSize: f(13),
      fontWeight: 'bold',
      color: c.primaria,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    enunciado: { fontSize: f(20), fontWeight: 'bold', color: c.texto, marginBottom: 6 },
    rodape: {
      paddingHorizontal: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: c.borda,
      backgroundColor: c.fundo,
    },
    botao: {
      minHeight: ALVO_TOQUE + 6,
      borderRadius: 14,
      backgroundColor: c.sucesso,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botaoDesabilitado: { backgroundColor: c.borda },
    pressionado: { opacity: 0.85 },
    textoBotao: { color: c.textoSobreCor, fontSize: f(16), fontWeight: 'bold' },
    textoDesabilitado: { color: c.textoSuave },
  });
