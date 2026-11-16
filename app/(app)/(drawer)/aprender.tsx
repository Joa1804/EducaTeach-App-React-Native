import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { useTrilha } from '@/hooks/use-trilha';
import type { EtapaTrilha } from '@/lib/licoes/trilha';

/** Deslocamento horizontal de cada etapa, desenhando o caminho em zigue-zague. */
const DESLOCAMENTOS = [0, -56, -80, -56, 0, 56, 80, 56] as const;

const ROTULO_STATUS: Readonly<Record<EtapaTrilha['status'], string>> = {
  concluida: 'concluída',
  disponivel: 'disponível',
  bloqueada: 'bloqueada',
};

type Estilos = ReturnType<typeof criarEstilos>;

export default function AprenderScreen() {
  const { cores, fonte } = useConfiguracao();
  const styles = useMemo(() => criarEstilos(cores, fonte), [cores, fonte]);
  const router = useRouter();
  const { etapas, concluidas, total, proxima, carregando, erro, recarregar } = useTrilha();

  const abrir = useCallback(
    (licaoId: string) => router.push({ pathname: '/atividades/[id]', params: { id: licaoId } }),
    [router],
  );

  const renderItem = useCallback<ListRenderItem<EtapaTrilha>>(
    ({ item }) => (
      <EtapaNode
        etapa={item}
        atual={item.licao.id === proxima?.licao.id}
        styles={styles}
        cores={cores}
        onAbrir={abrir}
      />
    ),
    [abrir, cores, proxima?.licao.id, styles],
  );

  const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

  const cabecalho = (
    <View>
      <View style={styles.unidadeCard}>
        <View style={styles.unidadeIcone}>
          <Ionicons name="code-slash" size={30} color={cores.primaria} />
        </View>
        <View style={styles.unidadeInfo}>
          <Text style={styles.unidadeTitulo}>Fundamentos de Programação</Text>
          <Text style={styles.unidadeDescricao}>Lógica com pseudocódigo, passo a passo.</Text>
          <View style={styles.progressoContainer}>
            <View
              style={styles.progressoFundo}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel="Progresso da unidade"
              accessibilityValue={{ min: 0, max: total, now: concluidas }}
            >
              <View style={[styles.progresso, { width: `${percentual}%` }]} />
            </View>
            <Text style={styles.progressoTexto}>
              {concluidas} de {total}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tituloContainer}>
        <Ionicons name="map" size={22} color={cores.primaria} />
        <Text style={styles.titulo}>Sua Jornada</Text>
      </View>

      {erro && (
        <View style={styles.erroCaixa} accessibilityLiveRegion="polite">
          <Text style={styles.erroTexto}>{erro}</Text>
          <Pressable onPress={recarregar} accessibilityRole="button" style={styles.erroBotao}>
            <Text style={styles.erroBotaoTexto}>Tentar novamente</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  const rodape =
    !carregando && !erro && concluidas === total ? (
      <View style={styles.final}>
        <Ionicons name="ribbon" size={28} color={cores.estrela} />
        <Text style={styles.finalTexto}>
          Você concluiu a trilha! Refaça as lições para ganhar 3 estrelas.
        </Text>
      </View>
    ) : null;

  // Enquanto não sabemos o progresso, não mostramos cadeados que podem estar errados.
  if (carregando && concluidas === 0 && !erro) {
    return (
      <View style={styles.carregando} accessibilityLabel="Carregando trilha">
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={erro ? [] : etapas}
      keyExtractor={(etapa) => etapa.licao.id}
      renderItem={renderItem}
      ListHeaderComponent={cabecalho}
      ListFooterComponent={rodape ?? undefined}
      showsVerticalScrollIndicator={false}
    />
  );
}

type PropsEtapa = {
  etapa: EtapaTrilha;
  atual: boolean;
  styles: Estilos;
  cores: Cores;
  onAbrir: (licaoId: string) => void;
};

const EtapaNode = memo(function EtapaNode({ etapa, atual, styles, cores, onAbrir }: PropsEtapa) {
  const { licao, indice, status, estrelas } = etapa;
  const bloqueada = status === 'bloqueada';
  const concluida = status === 'concluida';
  const deslocamento = DESLOCAMENTOS[indice % DESLOCAMENTOS.length];

  // Pulso suave na etapa atual, rodando na thread de UI.
  const escala = useSharedValue(1);
  useEffect(() => {
    if (!atual) {
      cancelAnimation(escala);
      escala.value = 1;
      return undefined;
    }
    escala.value = withRepeat(
      withSequence(withTiming(1.07, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
    );
    return () => cancelAnimation(escala);
  }, [atual, escala]);
  const estiloPulso = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  const icone = concluida ? 'checkmark' : bloqueada ? 'lock-closed' : licao.icone;

  return (
    <View style={[styles.etapa, { transform: [{ translateX: deslocamento }] }]}>
      {atual && (
        <View style={styles.balao}>
          <Text style={styles.balaoTexto}>{concluida ? 'REFAZER' : 'COMEÇAR'}</Text>
        </View>
      )}
      <Pressable
        onPress={() => onAbrir(licao.id)}
        disabled={bloqueada}
        accessibilityRole="button"
        accessibilityLabel={`Lição ${indice + 1}: ${licao.titulo}, ${ROTULO_STATUS[status]}${
          concluida ? `, ${estrelas} de 3 estrelas` : ''
        }`}
        accessibilityState={{ disabled: bloqueada }}
        hitSlop={6}
      >
        {({ pressed }) => (
          <Animated.View
            style={[
              styles.no,
              concluida && styles.noConcluido,
              bloqueada && styles.noBloqueado,
              pressed && styles.noPressionado,
              estiloPulso,
            ]}
          >
            <Ionicons name={icone} size={30} color={bloqueada ? cores.textoSuave : '#FFFFFF'} />
          </Animated.View>
        )}
      </Pressable>

      {concluida && (
        <View style={styles.estrelas} accessibilityElementsHidden importantForAccessibility="no">
          {[1, 2, 3].map((numero) => (
            <Ionicons
              key={numero}
              name={numero <= estrelas ? 'star' : 'star-outline'}
              size={16}
              color={cores.estrela}
            />
          ))}
        </View>
      )}
      <Text style={[styles.etapaTitulo, bloqueada && styles.textoBloqueado]} numberOfLines={1}>
        {licao.titulo}
      </Text>
      <Text style={styles.etapaDescricao} numberOfLines={2}>
        {licao.descricao} · {licao.exercicios.length} exercícios
      </Text>
    </View>
  );
});

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.fundo },
    content: { padding: 16, paddingBottom: 40 },
    carregando: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.fundo,
    },

    unidadeCard: {
      flexDirection: 'row',
      backgroundColor: c.superficie,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 16,
      marginBottom: 20,
      alignItems: 'center',
    },
    unidadeIcone: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    unidadeInfo: { flex: 1 },
    unidadeTitulo: { fontSize: f(19), fontWeight: 'bold', color: c.texto, marginBottom: 4 },
    unidadeDescricao: { fontSize: f(14), color: c.textoSuave, marginBottom: 8 },
    progressoContainer: { flexDirection: 'row', alignItems: 'center' },
    progressoFundo: {
      flex: 1,
      height: 8,
      backgroundColor: c.primariaClara,
      borderRadius: 999,
      overflow: 'hidden',
      marginRight: 10,
    },
    progresso: { height: '100%', backgroundColor: c.primaria, borderRadius: 999 },
    progressoTexto: { fontSize: f(12), color: c.textoSuave, fontWeight: '600' },

    tituloContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    titulo: { fontSize: f(18), fontWeight: 'bold', color: c.texto },

    erroCaixa: { backgroundColor: c.perigoFundo, borderRadius: 12, padding: 12, gap: 6 },
    erroTexto: { color: c.perigo, fontSize: f(14), textAlign: 'center' },
    erroBotao: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    erroBotaoTexto: { color: c.perigo, fontWeight: 'bold', fontSize: f(15) },

    etapa: { alignItems: 'center', alignSelf: 'center', width: 168, paddingVertical: 14 },
    balao: {
      backgroundColor: c.superficie,
      borderWidth: 2,
      borderColor: c.borda,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: 8,
    },
    balaoTexto: { color: c.primaria, fontWeight: 'bold', fontSize: f(12), letterSpacing: 0.5 },
    no: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 6,
      borderBottomColor: 'rgba(0,0,0,0.2)',
    },
    noConcluido: { backgroundColor: c.sucesso },
    noBloqueado: { backgroundColor: c.bloqueado },
    noPressionado: { borderBottomWidth: 2, marginTop: 4 },
    estrelas: { flexDirection: 'row', gap: 2, marginTop: 6 },
    etapaTitulo: { fontSize: f(15), fontWeight: 'bold', color: c.texto, marginTop: 6 },
    textoBloqueado: { color: c.textoSuave },
    etapaDescricao: { fontSize: f(12), color: c.textoSuave, textAlign: 'center', marginTop: 2 },

    final: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.superficie,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 14,
      marginTop: 12,
    },
    finalTexto: { flex: 1, fontSize: f(14), color: c.texto },
  });
