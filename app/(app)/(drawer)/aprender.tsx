
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

import { SeloDificuldade } from '@/components/atividades/SeloDificuldade';
import { BarraProgresso, Etiqueta } from '@/components/ui';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { useTrilha } from '@/hooks/use-trilha';
import { ROTULO_DIFICULDADE } from '@/lib/licoes/dificuldade';
import type { EtapaTrilha } from '@/lib/licoes/trilha';

/** Deslocamento horizontal de cada etapa, desenhando o caminho em zigue-zague. */
const DESLOCAMENTOS = [0, -56, -80, -56, 0, 56, 80, 56] as const;

const ROTULO_STATUS: Readonly<Record<EtapaTrilha['status'], string>> = {
  concluida: 'Concluída',
  disponivel: 'Disponível',
  bloqueada: 'Bloqueada',
};

type Estilos = ReturnType<typeof criarEstilos>;

export default function AprenderScreen() {
  const { cores, fonte } = useConfiguracao();

  const styles = useMemo(
    () => criarEstilos(cores, fonte),
    [cores, fonte],
  );

  const router = useRouter();

  const {
    etapas,
    concluidas,
    total,
    proxima,
    carregando,
    erro,
    recarregar,
  } = useTrilha();

  const abrir = useCallback(
    (licaoId: string) =>
      router.push({
        pathname: '/atividades/[id]',
        params: { id: licaoId },
      }),
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

  const percentual =
    total === 0 ? 0 : Math.round((concluidas / total) * 100);

  const cabecalho = (
    <View>
      {/* Cartão da unidade */}
      <View style={styles.unidadeCard}>
        <View style={styles.unidadeTopo}>
          <View style={styles.unidadeIcone}>
            <Ionicons
              name="code-slash"
              size={30}
              color={cores.textoPrimaria}
            />
          </View>

          <View style={styles.unidadeEtiqueta}>
            <Etiqueta
              texto="UNIDADE 01"
              cor={cores.textoPrimaria}
            />
          </View>
        </View>

        <Text style={styles.unidadeTitulo}>
          Fundamentos de Programação
        </Text>

        <Text style={styles.unidadeDescricao}>
          Aprenda lógica com pseudocódigo, passo a passo.
        </Text>

        <View style={styles.progressoCabecalho}>
          <View style={styles.progressoTextos}>
            <Text style={styles.progressoRotulo}>
              Seu progresso
            </Text>

            <Text style={styles.progressoPercentual}>
              {percentual}%
            </Text>
          </View>

          <BarraProgresso
            valor={percentual / 100}
            segmentos={10}
            cor={cores.textoPrimaria}
            rotulo="Progresso da unidade"
          />

          <Text style={styles.progressoTexto}>
            {concluidas} de {total} lições concluídas
          </Text>
        </View>
      </View>

      {/* Título da jornada */}
      <View style={styles.tituloContainer}>
        <View style={styles.tituloIcone}>
          <Ionicons
            name="map"
            size={23}
            color={cores.primaria}
          />
        </View>

        <View style={styles.tituloTextos}>
          <Text style={styles.titulo}>
            Sua jornada
          </Text>

          <Text style={styles.tituloDescricao}>
            Complete as etapas e avance!
          </Text>
        </View>
      </View>

      {erro && (
        <View
          style={styles.erroCaixa}
          accessibilityLiveRegion="polite"
        >
          <Ionicons
            name="cloud-offline-outline"
            size={25}
            color={cores.perigo}
          />

          <View style={styles.erroConteudo}>
            <Text style={styles.erroTitulo}>
              Não foi possível carregar a trilha
            </Text>

            <Text style={styles.erroTexto}>
              {erro}
            </Text>
          </View>

          <Pressable
            onPress={recarregar}
            accessibilityRole="button"
            style={styles.erroBotao}
          >
            <Ionicons
              name="refresh"
              size={21}
              color={cores.perigo}
            />
          </Pressable>
        </View>
      )}
    </View>
  );

  const rodape =
    !carregando && !erro && concluidas === total ? (
      <View style={styles.final}>
        <View style={styles.finalIcone}>
          <Ionicons
            name="trophy"
            size={30}
            color={cores.estrela}
          />
        </View>

        <View style={styles.finalConteudo}>
          <Text style={styles.finalTitulo}>
            Jornada concluída!
          </Text>

          <Text style={styles.finalTexto}>
            Você concluiu todas as lições! Refaça as atividades
            para conquistar 3 estrelas.
          </Text>
        </View>
      </View>
    ) : null;

  // Enquanto não sabemos o progresso, não mostramos cadeados que podem estar errados.
  if (carregando && concluidas === 0 && !erro) {
    return (
      <View
        style={styles.carregando}
        accessibilityLabel="Carregando trilha"
      >
        <ActivityIndicator
          size="large"
          color={cores.primaria}
        />

        <Text style={styles.carregandoTexto}>
          Preparando sua jornada...
        </Text>
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

const EtapaNode = memo(function EtapaNode({
  etapa,
  atual,
  styles,
  cores,
  onAbrir,
}: PropsEtapa) {
  const { licao, indice, status, estrelas } = etapa;

  const bloqueada = status === 'bloqueada';
  const concluida = status === 'concluida';

  const deslocamento =
    DESLOCAMENTOS[indice % DESLOCAMENTOS.length];

  // Pulso suave na etapa atual, rodando na thread de UI.
  const escala = useSharedValue(1);

  useEffect(() => {
    if (!atual) {
      cancelAnimation(escala);
      escala.value = 1;
      return undefined;
    }

    escala.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1,
    );

    return () => cancelAnimation(escala);
  }, [atual, escala]);

  const estiloPulso = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));

  const icone = concluida
    ? 'checkmark'
    : bloqueada
      ? 'lock-closed'
      : licao.icone;

  const corNo = concluida
    ? cores.sucesso
    : bloqueada
      ? cores.bloqueado
      : cores.primaria;

  return (
    <View
      style={[
        styles.etapa,
        { transform: [{ translateX: deslocamento }] },
      ]}
    >
      {/* Indicador da próxima lição */}
      {atual && (
        <View style={styles.balao}>
          <View style={styles.balaoPonto} />

          <Text style={styles.balaoTexto}>
            {concluida ? 'REFAZER' : 'SUA PRÓXIMA LIÇÃO'}
          </Text>
        </View>
      )}

      {/* Botão circular */}
      <Pressable
        onPress={() => onAbrir(licao.id)}
        disabled={bloqueada}
        accessibilityRole="button"
        accessibilityLabel={`Lição ${indice + 1}: ${licao.titulo}, ${
          ROTULO_DIFICULDADE[licao.dificuldade]
        }, vale ${licao.pontos} pontos, ${ROTULO_STATUS[status]}${
          concluida
            ? `, ${estrelas} de 3 estrelas, melhor resultado ${etapa.pontos} pontos`
            : ''
        }`}
        accessibilityState={{ disabled: bloqueada }}
        hitSlop={6}
      >
        {({ pressed }) => (
          <Animated.View
            style={[
              styles.no,
              { backgroundColor: corNo },
              concluida && styles.noConcluido,
              bloqueada && styles.noBloqueado,
              pressed && !bloqueada && styles.noPressionado,
              estiloPulso,
            ]}
          >
            <Ionicons
              name={icone}
              size={31}
              color={bloqueada ? cores.textoSuave : '#FFFFFF'}
            />
          </Animated.View>
        )}
      </Pressable>

      {/* Estrelas conquistadas */}
      {concluida && (
        <View
          style={styles.estrelas}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {[1, 2, 3].map((numero) => (
            <Ionicons
              key={numero}
              name={
                numero <= estrelas
                  ? 'star'
                  : 'star-outline'
              }
              size={17}
              color={cores.estrela}
            />
          ))}
        </View>
      )}

      {/* Informações da lição */}
      <Text
        style={[
          styles.etapaTitulo,
          bloqueada && styles.textoBloqueado,
        ]}
        numberOfLines={1}
      >
        {licao.titulo}
      </Text>

      <Text
        style={styles.etapaDescricao}
        numberOfLines={2}
      >
        {licao.descricao} · {licao.exercicios.length} exercícios
      </Text>

      <View style={styles.etapaDificuldade}>
        <SeloDificuldade
          dificuldade={licao.dificuldade}
        />
      </View>
    </View>
  );
});

const criarEstilos = (
  c: Cores,
  f: (tamanho: number) => number,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.fundo,
    },

    content: {
      padding: 20,
      paddingBottom: 45,
    },

    carregando: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.fundo,
      gap: 12,
    },

    carregandoTexto: {
      color: c.textoSuave,
      fontSize: f(14),
    },

    // Cartão da unidade
    unidadeCard: {
      backgroundColor: c.primaria,
      borderRadius: 24,
      padding: 21,
      marginBottom: 28,
    },

    unidadeTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 17,
    },

    unidadeIcone: {
      width: 55,
      height: 55,
      borderRadius: 17,
      backgroundColor: c.caixaSobrePrimaria,
      alignItems: 'center',
      justifyContent: 'center',
    },

    unidadeEtiqueta: {
      backgroundColor: c.caixaSobrePrimaria,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },

    unidadeTitulo: {
      fontSize: f(21),
      fontWeight: 'bold',
      color: c.textoPrimaria,
      marginBottom: 5,
    },

    unidadeDescricao: {
      fontSize: f(14),
      color: c.textoPrimaria,
      opacity: 0.9,
      marginBottom: 20,
    },

    progressoCabecalho: {
      backgroundColor: c.caixaSobrePrimaria,
      borderRadius: 16,
      padding: 13,
      gap: 9,
    },

    progressoTextos: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    progressoRotulo: {
      fontSize: f(13),
      fontWeight: 'bold',
      color: c.textoPrimaria,
    },

    progressoPercentual: {
      fontSize: f(16),
      fontWeight: 'bold',
      color: c.textoPrimaria,
    },

    progressoTexto: {
      fontSize: f(12),
      color: c.textoPrimaria,
      opacity: 0.9,
    },

    // Título da jornada
    tituloContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 24,
    },

    tituloIcone: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    tituloTextos: {
      flex: 1,
    },

    titulo: {
      fontSize: f(20),
      fontWeight: 'bold',
      color: c.texto,
    },

    tituloDescricao: {
      fontSize: f(13),
      color: c.textoSuave,
      marginTop: 3,
    },

    // Erro
    erroCaixa: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.perigoFundo,
      borderRadius: 16,
      padding: 13,
      marginBottom: 18,
    },

    erroConteudo: {
      flex: 1,
    },

    erroTitulo: {
      fontSize: f(13),
      fontWeight: 'bold',
      color: c.perigo,
    },

    erroTexto: {
      fontSize: f(12),
      color: c.perigo,
      marginTop: 3,
    },

    erroBotao: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.superficie,
    },

    // Etapas
    etapa: {
      alignItems: 'center',
      alignSelf: 'center',
      width: 168,
      paddingVertical: 16,
    },

    balao: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.superficie,
      borderWidth: 1,
      borderColor: c.primaria,
      borderRadius: 12,
      paddingHorizontal: 11,
      paddingVertical: 7,
      marginBottom: 12,
    },

    balaoPonto: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: c.primaria,
    },

    balaoTexto: {
      color: c.primaria,
      fontWeight: 'bold',
      fontSize: f(11),
      letterSpacing: 0.4,
    },

    no: {
      width: 76,
      height: 76,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: c.superficie,
      borderBottomWidth: 8,
      borderBottomColor: 'rgba(0,0,0,0.20)',
      elevation: 4,
    },

    noConcluido: {
      borderColor: c.superficie,
    },

    noBloqueado: {
      borderColor: c.borda,
      elevation: 0,
    },

    noPressionado: {
      borderBottomWidth: 3,
      transform: [{ translateY: 4 }],
    },

    estrelas: {
      flexDirection: 'row',
      gap: 3,
      marginTop: 8,
    },

    etapaTitulo: {
      fontSize: f(15),
      fontWeight: 'bold',
      color: c.texto,
      marginTop: 8,
      textAlign: 'center',
    },

    textoBloqueado: {
      color: c.textoSuave,
    },

    etapaDescricao: {
      fontSize: f(12),
      color: c.textoSuave,
      textAlign: 'center',
      marginTop: 4,
      lineHeight: f(17),
    },

    etapaDificuldade: {
      marginTop: 8,
    },

    // Conclusão
    final: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      backgroundColor: c.superficie,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 16,
      marginTop: 20,
    },

    finalIcone: {
      width: 52,
      height: 52,
      borderRadius: 17,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    finalConteudo: {
      flex: 1,
    },

    finalTitulo: {
      fontSize: f(16),
      fontWeight: 'bold',
      color: c.texto,
      marginBottom: 4,
    },

    finalTexto: {
      flex: 1,
      fontSize: f(13),
      color: c.textoSuave,
      lineHeight: f(19),
    },
  });
