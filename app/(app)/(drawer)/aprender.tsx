
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
import { LinearGradient } from 'expo-linear-gradient';

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
import { escurecer } from '@/lib/cores';
import { ROTULO_DIFICULDADE } from '@/lib/licoes/dificuldade';
import type { EtapaTrilha } from '@/lib/licoes/trilha';

const DESLOCAMENTOS = [0, -56, -80, -56, 0, 56, 80, 56] as const;

const ROTULO_STATUS: Readonly<Record<EtapaTrilha['status'], string>> = {
  concluida: 'Concluída',
  disponivel: 'Disponível',
  bloqueada: 'Bloqueada',
};

type Estilos = ReturnType<typeof criarEstilos>;

export default function AprenderScreen() {
  const { cores, fonte, altoContraste } = useConfiguracao();

  const styles = useMemo(
    () => criarEstilos(cores, fonte, altoContraste),
    [cores, fonte, altoContraste],
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

  const continuar = useCallback(() => {
    if (proxima) {
      abrir(proxima.licao.id);
    }
  }, [abrir, proxima]);

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
      <LinearGradient
        colors={
          altoContraste
            ? [cores.primaria, cores.primaria]
            : [cores.primaria, escurecer(cores.primaria, 0.3)]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.unidadeCard}
      >
        <View style={styles.unidadeBase} />

        <View style={styles.unidadeTopo}>
          <View style={styles.unidadeIcone}>
            <Ionicons
              name="code-slash"
              size={29}
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
            <View>
              <Text style={styles.progressoRotulo}>
                Seu progresso
              </Text>

              <Text style={styles.progressoSubtitulo}>
                Continue avançando!
              </Text>
            </View>

            <View style={styles.percentualContainer}>
              <Text style={styles.progressoPercentual}>
                {percentual}%
              </Text>
            </View>
          </View>

          <BarraProgresso
            valor={percentual / 100}
            segmentos={10}
            cor={cores.textoPrimaria}
            rotulo="Progresso da unidade"
          />

          <View style={styles.progressoRodape}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={cores.textoPrimaria}
            />

            <Text style={styles.progressoTexto}>
              {concluidas} de {total} lições concluídas
            </Text>
          </View>
        </View>

        {proxima && (
          <Pressable
            onPress={continuar}
            style={({ pressed }) => [
              styles.continuarBotao,
              pressed && styles.continuarBotaoPressionado,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Continuar para a lição ${proxima.licao.titulo}`}
          >
            <View style={styles.continuarIcone}>
              <Ionicons
                name="play"
                size={17}
                color={cores.primaria}
              />
            </View>

            <View style={styles.continuarTextos}>
              <Text style={styles.continuarRotulo}>
                CONTINUAR APRENDENDO
              </Text>

              <Text style={styles.continuarTitulo} numberOfLines={1}>
                {proxima.licao.titulo}
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={20}
              color={cores.primaria}
            />
          </Pressable>
        )}
      </LinearGradient>

      <View style={styles.jornadaCabecalho}>
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

        <View style={styles.contadorEtapas}>
          <Text style={styles.contadorNumero}>
            {concluidas}/{total}
          </Text>

          <Text style={styles.contadorLegenda}>
            etapas
          </Text>
        </View>
      </View>

      {erro && (
        <View
          style={styles.erroCaixa}
          accessibilityLiveRegion="polite"
        >
          <View style={styles.erroIcone}>
            <Ionicons
              name="cloud-offline-outline"
              size={23}
              color={cores.perigo}
            />
          </View>

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
            accessibilityLabel="Tentar carregar novamente"
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
            size={29}
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

  if (carregando && concluidas === 0 && !erro) {
    return (
      <View
        style={styles.carregando}
        accessibilityLabel="Carregando trilha"
      >
        <View style={styles.carregandoIcone}>
          <ActivityIndicator
            size="large"
            color={cores.primaria}
          />
        </View>

        <Text style={styles.carregandoTitulo}>
          Preparando sua jornada
        </Text>

        <Text style={styles.carregandoTexto}>
          Estamos organizando suas lições...
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

  const progresso = Math.round((estrelas / 3) * 100);

  return (
    <View
      style={[
        styles.etapa,
        { transform: [{ translateX: deslocamento }] },
      ]}
    >
      {atual && (
        <View style={styles.balao}>
          <View style={styles.balaoPonto} />

          <Text style={styles.balaoTexto}>
            {concluida ? 'REFAZER LIÇÃO' : 'SUA PRÓXIMA LIÇÃO'}
          </Text>
        </View>
      )}

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
              estiloPulso,
              pressed && !bloqueada && styles.noPressionado,
            ]}
          >
            <Ionicons
              name={icone}
              size={30}
              color={bloqueada ? cores.textoSuave : '#FFFFFF'}
            />
          </Animated.View>
        )}
      </Pressable>

      {concluida && (
        <View
          style={styles.estrelas}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {[1, 2, 3].map((numero) => (
            <Ionicons
              key={numero}
              name={numero <= estrelas ? 'star' : 'star-outline'}
              size={17}
              color={cores.estrela}
            />
          ))}
        </View>
      )}

      <Text
        style={[
          styles.etapaTitulo,
          bloqueada && styles.textoBloqueado,
        ]}
        numberOfLines={1}
      >
        {licao.titulo}
      </Text>

      <Text style={styles.etapaDescricao} numberOfLines={2}>
        {licao.descricao} · {licao.exercicios.length} exercícios
      </Text>

      <View style={styles.etapaDificuldade}>
        <SeloDificuldade dificuldade={licao.dificuldade} />
      </View>

      {concluida && (
        <View style={styles.progressoIndividual}>
          <BarraProgresso
            valor={estrelas / 3}
            segmentos={3}
            cor={cores.estrela}
            rotulo={`Progresso da lição ${licao.titulo}: ${progresso}%`}
          />
        </View>
      )}
    </View>
  );
});

const criarEstilos = (
  c: Cores,
  f: (tamanho: number) => number,
  altoContraste: boolean,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.fundo,
    },

    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 45,
    },

    carregando: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.fundo,
      padding: 24,
    },

    carregandoIcone: {
      width: 70,
      height: 70,
      borderRadius: 23,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },

    carregandoTitulo: {
      color: c.texto,
      fontSize: f(17),
      fontWeight: 'bold',
    },

    carregandoTexto: {
      color: c.textoSuave,
      fontSize: f(13),
      marginTop: 6,
    },

    unidadeCard: {
      borderRadius: 25,
      padding: 21,
      marginBottom: 30,
      overflow: 'hidden',
      elevation: altoContraste ? 0 : 5,
    },

    unidadeBase: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 9,
      backgroundColor: 'rgba(0,0,0,0.13)',
    },

    unidadeTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 19,
    },

    unidadeIcone: {
      width: 54,
      height: 54,
      borderRadius: 18,
      backgroundColor: c.caixaSobrePrimaria,
      alignItems: 'center',
      justifyContent: 'center',
    },

    unidadeEtiqueta: {
      backgroundColor: c.caixaSobrePrimaria,
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 11,
    },

    unidadeTitulo: {
      fontSize: f(21),
      fontWeight: 'bold',
      color: c.textoPrimaria,
      marginBottom: 6,
    },

    unidadeDescricao: {
      fontSize: f(13),
      color: c.textoPrimaria,
      opacity: 0.9,
      lineHeight: f(19),
      marginBottom: 20,
    },

    progressoCabecalho: {
      backgroundColor: c.caixaSobrePrimaria,
      borderRadius: 17,
      padding: 14,
      gap: 12,
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

    progressoSubtitulo: {
      fontSize: f(11),
      color: c.textoPrimaria,
      opacity: 0.8,
      marginTop: 3,
    },

    percentualContainer: {
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: c.caixaSobrePrimaria,
    },

    progressoPercentual: {
      fontSize: f(17),
      fontWeight: 'bold',
      color: c.textoPrimaria,
    },

    progressoRodape: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    progressoTexto: {
      fontSize: f(11),
      color: c.textoPrimaria,
      opacity: 0.9,
    },

    continuarBotao: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.superficie,
      borderRadius: 16,
      padding: 12,
      marginTop: 15,
      gap: 11,
    },

    continuarBotaoPressionado: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },

    continuarIcone: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    continuarTextos: {
      flex: 1,
    },

    continuarRotulo: {
      color: c.textoSuave,
      fontSize: f(9),
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },

    continuarTitulo: {
      color: c.texto,
      fontSize: f(13),
      fontWeight: 'bold',
      marginTop: 3,
    },

    jornadaCabecalho: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 22,
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
      fontSize: f(19),
      fontWeight: 'bold',
      color: c.texto,
    },

    tituloDescricao: {
      fontSize: f(12),
      color: c.textoSuave,
      marginTop: 3,
    },

    contadorEtapas: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.superficie,
      borderWidth: 1,
      borderColor: c.borda,
      borderRadius: 13,
      minWidth: 55,
      paddingHorizontal: 9,
      paddingVertical: 7,
    },

    contadorNumero: {
      fontSize: f(14),
      fontWeight: 'bold',
      color: c.primaria,
    },

    contadorLegenda: {
      fontSize: f(10),
      color: c.textoSuave,
      marginTop: 1,
    },

    erroCaixa: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.perigoFundo,
      borderRadius: 16,
      padding: 13,
      marginBottom: 18,
    },

    erroIcone: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.superficie,
      alignItems: 'center',
      justifyContent: 'center',
    },

    erroConteudo: {
      flex: 1,
    },

    erroTitulo: {
      fontSize: f(12),
      fontWeight: 'bold',
      color: c.perigo,
    },

    erroTexto: {
      fontSize: f(11),
      color: c.perigo,
      marginTop: 3,
    },

    erroBotao: {
      width: 38,
      height: 38,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.superficie,
    },

    etapa: {
      alignItems: 'center',
      alignSelf: 'center',
      width: 175,
      paddingVertical: 15,
    },

    balao: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      backgroundColor: c.superficie,
      borderWidth: 1,
      borderColor: c.primaria,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginBottom: 13,
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
      fontSize: f(10),
      letterSpacing: 0.3,
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
    },

    estrelas: {
      flexDirection: 'row',
      gap: 4,
      marginTop: 8,
    },

    etapaTitulo: {
      fontSize: f(14),
      fontWeight: 'bold',
      color: c.texto,
      marginTop: 9,
      textAlign: 'center',
    },

    textoBloqueado: {
      color: c.textoSuave,
    },

    etapaDescricao: {
      fontSize: f(11),
      color: c.textoSuave,
      textAlign: 'center',
      marginTop: 4,
      lineHeight: f(16),
    },

    etapaDificuldade: {
      marginTop: 8,
    },

    progressoIndividual: {
      width: 95,
      marginTop: 9,
    },

    final: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      backgroundColor: c.superficie,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 16,
      marginTop: 22,
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
      fontSize: f(12),
      color: c.textoSuave,
      lineHeight: f(18),
    },
  });
