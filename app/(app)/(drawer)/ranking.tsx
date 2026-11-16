import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { useRanking } from '@/hooks/use-ranking';
import { DIFICULDADES, PONTOS_POR_DIFICULDADE, ROTULO_DIFICULDADE } from '@/lib/licoes/dificuldade';
import { formatarPontos, type ItemRanking, type SituacaoUsuario } from '@/lib/ranking/ranking';

/** Ouro, prata e bronze para os três primeiros. */
const CORES_MEDALHA: Readonly<Record<number, string>> = {
  1: '#F59E0B',
  2: '#94A3B8',
  3: '#CD7F32',
};

type Estilos = ReturnType<typeof criarEstilos>;

export default function RankingScreen() {
  const { cores, fonte } = useConfiguracao();
  const styles = useMemo(() => criarEstilos(cores, fonte), [cores, fonte]);
  const { itens, usuario, fonte: fonteRanking, aviso, carregando, erro, recarregar } = useRanking();

  const renderItem = useCallback<ListRenderItem<ItemRanking>>(
    ({ item }) => <LinhaJogador item={item} styles={styles} cores={cores} />,
    [cores, styles],
  );

  if (carregando && itens.length === 0 && !erro) {
    return (
      <View style={styles.carregando} accessibilityLabel="Carregando ranking">
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  const cabecalho = (
    <View>
      <View style={styles.headerRanking}>
        <View style={styles.trofeuHeader}>
          <Ionicons name="trophy" size={26} color={cores.textoPrimaria} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.tituloRanking} accessibilityRole="header">
            Ranking
          </Text>
          <Text style={styles.subtituloRanking}>
            {fonteRanking === 'global'
              ? 'Alunos de todo o EducaTeach'
              : 'Usuários cadastrados neste aparelho'}
          </Text>
        </View>
      </View>

      {aviso && !erro && (
        <View style={styles.avisoCaixa} accessibilityLiveRegion="polite">
          <Ionicons name="cloud-offline-outline" size={18} color={cores.textoSuave} />
          <Text style={styles.avisoTexto}>{aviso}</Text>
        </View>
      )}

      {erro ? (
        <View style={styles.erroCaixa} accessibilityLiveRegion="polite">
          <Text style={styles.erroTexto}>{erro}</Text>
          <Pressable onPress={recarregar} accessibilityRole="button" style={styles.erroBotao}>
            <Text style={styles.erroBotaoTexto}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        usuario && <CardSituacao usuario={usuario} styles={styles} cores={cores} />
      )}

      <Text style={styles.listaTitulo}>Classificação</Text>
    </View>
  );

  const rodape = (
    <View style={styles.legenda}>
      <View style={styles.legendaTopo}>
        <Ionicons name="sparkles" size={20} color={cores.estrela} />
        <Text style={styles.legendaTitulo}>Como ganhar pontos</Text>
      </View>
      <Text style={styles.legendaTexto}>
        Cada lição vale pontos pela dificuldade. Acertar tudo de primeira garante o valor cheio;
        refazer só soma a diferença do seu melhor resultado.
      </Text>
      <View style={styles.legendaChips}>
        {DIFICULDADES.map((dificuldade) => (
          <View key={dificuldade} style={styles.legendaChip}>
            <Text style={styles.legendaChipTexto}>
              {ROTULO_DIFICULDADE[dificuldade]} · {PONTOS_POR_DIFICULDADE[dificuldade]} pts
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const vazio = erro ? null : (
    <View style={styles.vazio}>
      <Ionicons name="people-outline" size={32} color={cores.textoSuave} />
      <Text style={styles.vazioTexto}>Ninguém pontuou ainda. Comece uma lição!</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={erro ? [] : itens}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      ItemSeparatorComponent={Separador}
      ListHeaderComponent={cabecalho}
      ListEmptyComponent={vazio ?? undefined}
      ListFooterComponent={rodape}
      refreshing={carregando && itens.length > 0}
      onRefresh={recarregar}
      showsVerticalScrollIndicator={false}
    />
  );
}

function Separador() {
  return <View style={separadorEstilo.espaco} />;
}

const separadorEstilo = StyleSheet.create({ espaco: { height: 12 } });

type PropsCard = { usuario: SituacaoUsuario; styles: Estilos; cores: Cores };

function CardSituacao({ usuario, styles, cores }: PropsCard) {
  const { posicao, total, alvo, pontosParaSubir, progresso } = usuario;
  const mensagem = alvo
    ? `Faltam ${formatarPontos(pontosParaSubir)} pts para passar ${alvo.nome}.`
    : total > 1
      ? 'Você está na liderança!'
      : 'Por enquanto, você é o único no ranking.';

  return (
    <View style={styles.ligaCard}>
      <View style={styles.ligaTopo}>
        <View style={styles.ligaIcone}>
          <Ionicons name="podium" size={22} color={cores.estrela} />
        </View>
        <View style={styles.ligaInfo}>
          <Text style={styles.ligaTitulo}>Sua posição</Text>
          <Text style={styles.ligaTexto}>{formatarPontos(usuario.pontos)} pontos</Text>
        </View>
        <Text style={styles.ligaPosicao} accessibilityLabel={`${posicao}º lugar de ${total}`}>
          {posicao}º de {total}
        </Text>
      </View>

      <View
        style={styles.progressoFundo}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Progresso até a próxima posição"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progresso * 100) }}
      >
        <View style={[styles.progresso, { width: `${Math.round(progresso * 100)}%` }]} />
      </View>
      <Text style={styles.ligaMensagem}>{mensagem}</Text>
    </View>
  );
}

type PropsLinha = { item: ItemRanking; styles: Estilos; cores: Cores };

const LinhaJogador = memo(function LinhaJogador({ item, styles, cores }: PropsLinha) {
  const corMedalha = CORES_MEDALHA[item.posicao];

  return (
    <View>
      {item.foraDosLideres && (
        <View style={styles.reticencias} accessibilityElementsHidden importantForAccessibility="no">
          <Ionicons name="ellipsis-vertical" size={18} color={cores.textoSuave} />
        </View>
      )}
      <View
        style={[styles.jogador, item.voce && styles.jogadorVoce]}
        accessible
        accessibilityLabel={`${item.posicao}º lugar: ${item.nome}${
          item.voce ? ' (você)' : ''
        }, ${item.pontos} pontos`}
      >
        <View style={styles.posicaoContainer}>
          {corMedalha ? (
            <Ionicons name="medal" size={24} color={corMedalha} />
          ) : (
            <Text style={styles.posicao}>{item.posicao}</Text>
          )}
        </View>

        <View style={[styles.avatar, item.voce && styles.avatarVoce]}>
          <Ionicons name="person" size={22} color={item.voce ? cores.primaria : cores.textoSuave} />
        </View>

        <View style={styles.infoJogador}>
          <View style={styles.nomeLinha}>
            <Text style={[styles.nome, item.voce && styles.nomeVoce]} numberOfLines={1}>
              {item.nome}
            </Text>
            {item.voce && (
              <View style={styles.voceBadge}>
                <Text style={styles.voceTexto}>Você</Text>
              </View>
            )}
          </View>
          <Text style={styles.pontos}>{formatarPontos(item.pontos)} pts</Text>
        </View>
      </View>
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

    headerRanking: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.superficie,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 16,
      marginBottom: 16,
    },
    trofeuHeader: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    headerInfo: { flex: 1 },
    tituloRanking: { fontSize: f(22), fontWeight: 'bold', color: c.texto },
    subtituloRanking: { fontSize: f(14), color: c.textoSuave, marginTop: 4 },

    erroCaixa: {
      backgroundColor: c.perigoFundo,
      borderRadius: 12,
      padding: 12,
      gap: 6,
      marginBottom: 16,
    },
    avisoCaixa: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.iconeFundo,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },
    avisoTexto: { flex: 1, fontSize: f(13), color: c.texto },
    erroTexto: { color: c.perigo, fontSize: f(14), textAlign: 'center' },
    erroBotao: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    erroBotaoTexto: { color: c.perigo, fontWeight: 'bold', fontSize: f(15) },

    ligaCard: {
      backgroundColor: c.superficie,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 16,
      marginBottom: 20,
    },
    ligaTopo: { flexDirection: 'row', alignItems: 'center' },
    ligaIcone: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ligaInfo: { flex: 1, marginLeft: 12 },
    ligaTitulo: { fontWeight: 'bold', fontSize: f(16), color: c.texto },
    ligaTexto: { fontSize: f(13), color: c.textoSuave, marginTop: 2 },
    ligaPosicao: { fontWeight: 'bold', color: c.primaria, fontSize: f(16), marginLeft: 8 },
    progressoFundo: {
      height: 10,
      backgroundColor: c.primariaClara,
      borderRadius: 999,
      overflow: 'hidden',
      marginTop: 16,
    },
    progresso: { height: '100%', backgroundColor: c.primaria, borderRadius: 999 },
    ligaMensagem: { fontSize: f(13), color: c.textoSuave, marginTop: 8 },

    listaTitulo: { fontSize: f(18), fontWeight: 'bold', color: c.texto, marginBottom: 12 },
    jogador: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.superficie,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 12,
    },
    jogadorVoce: { backgroundColor: c.iconeFundo, borderColor: c.primaria, borderWidth: 2 },
    posicaoContainer: { width: 30, alignItems: 'center', justifyContent: 'center' },
    posicao: { fontSize: f(14), fontWeight: 'bold', color: c.texto },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
    },
    avatarVoce: { backgroundColor: c.primariaClara },
    infoJogador: { flex: 1, minWidth: 0 },
    nomeLinha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    nome: { fontSize: f(15), fontWeight: 'bold', color: c.texto, flexShrink: 1 },
    nomeVoce: { color: c.primaria },
    voceBadge: {
      backgroundColor: c.primariaClara,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    voceTexto: { fontSize: f(11), fontWeight: 'bold', color: c.primaria },
    pontos: { fontSize: f(13), color: c.textoSuave, marginTop: 3 },
    reticencias: { alignItems: 'center', paddingBottom: 12 },

    vazio: { alignItems: 'center', gap: 8, paddingVertical: 24 },
    vazioTexto: { fontSize: f(14), color: c.textoSuave, textAlign: 'center' },

    legenda: {
      backgroundColor: c.superficie,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 14,
      marginTop: 20,
      gap: 8,
    },
    legendaTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendaTitulo: { fontSize: f(15), fontWeight: 'bold', color: c.texto },
    legendaTexto: { fontSize: f(13), color: c.textoSuave },
    legendaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    legendaChip: {
      backgroundColor: c.iconeFundo,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    legendaChipTexto: { fontSize: f(12), fontWeight: '600', color: c.primaria },
  });
