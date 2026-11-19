
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
import { LinearGradient } from 'expo-linear-gradient';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { useRanking } from '@/hooks/use-ranking';
import {
  DIFICULDADES,
  PONTOS_POR_DIFICULDADE,
  ROTULO_DIFICULDADE,
} from '@/lib/licoes/dificuldade';
import {
  formatarPontos,
  type ItemRanking,
  type SituacaoUsuario,
} from '@/lib/ranking/ranking';
import { FONTES } from '@/constants/fontes';
import { escurecer } from '@/lib/cores';

/** Cores das medalhas dos três primeiros colocados. */
const CORES_MEDALHA: Readonly<Record<number, string>> = {
  1: '#F59E0B',
  2: '#94A3B8',
  3: '#CD7F32',
};

type Estilos = ReturnType<typeof criarEstilos>;

export default function RankingScreen() {
  const { cores, fonte, altoContraste } = useConfiguracao();

  const styles = useMemo(
    () => criarEstilos(cores, fonte),
    [cores, fonte],
  );

  const coresGradiente = altoContraste
    ? [cores.primaria, cores.primaria]
    : [cores.primaria, escurecer(cores.primaria, 0.3)];

  const {
    itens,
    usuario,
    fonte: fonteRanking,
    aviso,
    carregando,
    erro,
    recarregar,
  } = useRanking();

  const renderItem = useCallback<ListRenderItem<ItemRanking>>(
    ({ item }) => (
      <LinhaJogador
        item={item}
        styles={styles}
        cores={cores}
      />
    ),
    [cores, styles],
  );

  if (carregando && itens.length === 0 && !erro) {
    return (
      <View
        style={styles.carregando}
        accessibilityLabel="Carregando ranking"
      >
        <ActivityIndicator
          size="large"
          color={cores.primaria}
        />

        <Text style={styles.carregandoTexto}>
          Preparando a classificação...
        </Text>
      </View>
    );
  }

  const cabecalho = (
    <View>
      {/* Banner principal */}
      <LinearGradient
        colors={coresGradiente as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerRanking}
      >
        <View style={styles.headerTopo}>
          <View style={styles.trofeuHeader}>
            <Ionicons
              name="trophy"
              size={30}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.headerInfo}>
            <Text
              style={styles.tituloRanking}
              accessibilityRole="header"
            >
              Ranking
            </Text>

            <Text style={styles.subtituloRanking}>
              Acompanhe sua posição e conquiste o topo!
            </Text>
          </View>
        </View>

        <View style={styles.headerRodape}>
          <View style={styles.headerFonteIcone}>
            <Ionicons
              name="globe-outline"
              size={14}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.headerFonte}>
            {fonteRanking === 'global'
              ? 'Ranking global do EducaTeach'
              : 'Ranking deste aparelho'}
          </Text>
        </View>

        <Ionicons
          name="trophy"
          size={110}
          color="rgba(255,255,255,0.13)"
          style={styles.trofeuDecorativo}
        />

        <View style={styles.bannerBase} />
      </LinearGradient>

      {/* Aviso de conexão */}
      {aviso && !erro && (
        <View
          style={styles.avisoCaixa}
          accessibilityLiveRegion="polite"
        >
          <View style={styles.avisoIcone}>
            <Ionicons
              name="cloud-offline-outline"
              size={19}
              color={cores.textoSuave}
            />
          </View>

          <Text style={styles.avisoTexto}>
            {aviso}
          </Text>
        </View>
      )}

      {/* Erro ou posição do usuário */}
      {erro ? (
        <View
          style={styles.erroCaixa}
          accessibilityLiveRegion="polite"
        >
          <View style={styles.erroIcone}>
            <Ionicons
              name="alert-circle-outline"
              size={26}
              color={cores.perigo}
            />
          </View>

          <Text style={styles.erroTitulo}>
            Não foi possível carregar o ranking
          </Text>

          <Text style={styles.erroTexto}>
            {erro}
          </Text>

          <Pressable
            onPress={recarregar}
            accessibilityRole="button"
            style={styles.erroBotao}
          >
            <Ionicons
              name="refresh"
              size={17}
              color="#FFFFFF"
            />

            <Text style={styles.erroBotaoTexto}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      ) : (
        usuario && (
          <CardSituacao
            usuario={usuario}
            styles={styles}
            cores={cores}
          />
        )
      )}

      {/* Cabeçalho da classificação */}
      <View style={styles.tituloListaContainer}>
        <View style={styles.listaTituloInfo}>
          <Text style={styles.listaTitulo}>
            Classificação
          </Text>

          <Text style={styles.listaSubtitulo}>
            Os alunos com mais pontos
          </Text>
        </View>

        <View style={styles.listaIcone}>
          <Ionicons
            name="podium-outline"
            size={23}
            color={cores.primaria}
          />
        </View>
      </View>
    </View>
  );

  const rodape = (
    <View style={styles.legenda}>
      <View style={styles.legendaTopo}>
        <View style={styles.legendaIcone}>
          <Ionicons
            name="sparkles"
            size={21}
            color={cores.estrela}
          />
        </View>

        <View style={styles.legendaInfo}>
          <Text style={styles.legendaTitulo}>
            Como ganhar pontos?
          </Text>

          <Text style={styles.legendaSubtitulo}>
            Aprenda e avance no ranking!
          </Text>
        </View>
      </View>

      <Text style={styles.legendaTexto}>
        Cada lição vale pontos de acordo com sua dificuldade.
        Acertar tudo de primeira garante o valor cheio; refazer
        só soma a diferença do seu melhor resultado.
      </Text>

      <View style={styles.legendaChips}>
        {DIFICULDADES.map((dificuldade) => (
          <View
            key={dificuldade}
            style={styles.legendaChip}
          >
            <Text style={styles.legendaChipTexto}>
              {ROTULO_DIFICULDADE[dificuldade]} ·{' '}
              {PONTOS_POR_DIFICULDADE[dificuldade]} pts
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const vazio = erro ? null : (
    <View style={styles.vazio}>
      <View style={styles.vazioIcone}>
        <Ionicons
          name="people-outline"
          size={36}
          color={cores.textoSuave}
        />
      </View>

      <Text style={styles.vazioTitulo}>
        Ainda não temos uma classificação!
      </Text>

      <Text style={styles.vazioTexto}>
        Complete uma lição e seja o primeiro a aparecer por aqui.
      </Text>
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

const separadorEstilo = StyleSheet.create({
  espaco: {
    height: 10,
  },
});

type PropsCard = {
  usuario: SituacaoUsuario;
  styles: Estilos;
  cores: Cores;
};

function CardSituacao({
  usuario,
  styles,
  cores,
}: PropsCard) {
  const {
    posicao,
    total,
    alvo,
    pontosParaSubir,
    progresso,
  } = usuario;

  const mensagem = alvo
    ? `Faltam ${formatarPontos(pontosParaSubir)} pts para passar ${alvo.nome}.`
    : total > 1
      ? 'Você está na liderança!'
      : 'Por enquanto, você é o único no ranking.';

  return (
    <View style={styles.ligaCard}>
      <View style={styles.ligaTopo}>
        <View style={styles.ligaIcone}>
          <Ionicons
            name="podium"
            size={25}
            color={cores.estrela}
          />
        </View>

        <View style={styles.ligaInfo}>
          <Text style={styles.ligaTitulo}>
            Sua posição
          </Text>

          <Text style={styles.ligaTexto}>
            {formatarPontos(usuario.pontos)} pontos acumulados
          </Text>
        </View>

        <View style={styles.posicaoDestaque}>
          <Text style={styles.ligaPosicao}>
            {posicao}º
          </Text>

          <Text style={styles.posicaoTotal}>
            de {total}
          </Text>
        </View>
      </View>

      <View style={styles.progressoCabecalho}>
        <Text style={styles.progressoRotulo}>
          Próxima posição
        </Text>

        <Text style={styles.progressoPercentual}>
          {Math.round(progresso * 100)}%
        </Text>
      </View>

      <View
        style={styles.progressoFundo}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Progresso até a próxima posição"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(progresso * 100),
        }}
      >
        <View
          style={[
            styles.progresso,
            { width: `${Math.round(progresso * 100)}%` },
          ]}
        />
      </View>

      <View style={styles.ligaMensagemContainer}>
        <Ionicons
          name="arrow-up-circle"
          size={18}
          color={cores.primaria}
        />

        <Text style={styles.ligaMensagem}>
          {mensagem}
        </Text>
      </View>
    </View>
  );
}

type PropsLinha = {
  item: ItemRanking;
  styles: Estilos;
  cores: Cores;
};

const LinhaJogador = memo(function LinhaJogador({
  item,
  styles,
  cores,
}: PropsLinha) {
  const corMedalha = CORES_MEDALHA[item.posicao];

  return (
    <View>
      {item.foraDosLideres && (
        <View
          style={styles.reticencias}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={cores.textoSuave}
          />
        </View>
      )}

      <View
        style={[
          styles.jogador,
          item.posicao === 1 && styles.jogadorPrimeiro,
          item.voce && styles.jogadorVoce,
        ]}
        accessible
        accessibilityLabel={`${item.posicao}º lugar: ${item.nome}${
          item.voce ? ' (você)' : ''
        }, ${item.pontos} pontos`}
      >
        <View style={styles.posicaoContainer}>
          {corMedalha ? (
            <View
              style={[
                styles.medalhaContainer,
                { backgroundColor: `${corMedalha}20` },
              ]}
            >
              <Ionicons
                name="medal"
                size={25}
                color={corMedalha}
              />
            </View>
          ) : (
            <Text style={styles.posicao}>
              {item.posicao}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.avatar,
            item.voce && styles.avatarVoce,
          ]}
        >
          <Ionicons
            name="person"
            size={22}
            color={item.voce ? cores.primaria : cores.textoSuave}
          />
        </View>

        <View style={styles.infoJogador}>
          <View style={styles.nomeLinha}>
            <Text
              style={[
                styles.nome,
                item.voce && styles.nomeVoce,
              ]}
              numberOfLines={1}
            >
              {item.nome}
            </Text>

            {item.voce && (
              <View style={styles.voceBadge}>
                <Text style={styles.voceTexto}>
                  Você
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.pontos}>
            {formatarPontos(item.pontos)} pts
          </Text>
        </View>

        {item.posicao === 1 && (
          <View style={styles.liderIcone}>
            <Ionicons
              name="trophy"
              size={19}
              color={CORES_MEDALHA[1]}
            />
          </View>
        )}
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
      paddingBottom: 40,
    },

    carregando: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.fundo,
      gap: 12,
    },

    carregandoTexto: {
      fontFamily: FONTES.texto,
      fontSize: f(14),
      color: c.textoSuave,
    },

    // Banner principal
    headerRanking: {
      borderRadius: 24,
      padding: 22,
      marginBottom: 20,
      overflow: 'hidden',
      minHeight: 160,
      justifyContent: 'space-between',
    },

    headerTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 2,
    },

    trofeuHeader: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.20)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },

    headerInfo: {
      flex: 1,
    },

    tituloRanking: {
      fontFamily: FONTES.titulo,
      fontSize: f(26),
      color: '#FFFFFF',
    },

    subtituloRanking: {
      fontFamily: FONTES.texto,
      fontSize: f(13),
      color: '#FFFFFF',
      marginTop: 4,
      opacity: 0.95,
    },

    headerRodape: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 20,
      zIndex: 2,
    },

    headerFonteIcone: {
      width: 25,
      height: 25,
      borderRadius: 9,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    headerFonte: {
      fontFamily: FONTES.texto,
      fontSize: f(12),
      color: '#FFFFFF',
    },

    trofeuDecorativo: {
      position: 'absolute',
      right: -15,
      bottom: -20,
    },

    bannerBase: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 7,
      backgroundColor: 'rgba(0,0,0,0.12)',
    },

    // Avisos
    avisoCaixa: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      backgroundColor: c.superficie,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 13,
      marginBottom: 16,
    },

    avisoIcone: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    avisoTexto: {
      flex: 1,
      fontFamily: FONTES.texto,
      fontSize: f(13),
      color: c.texto,
    },

    // Erros
    erroCaixa: {
      backgroundColor: c.perigoFundo,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 18,
      alignItems: 'center',
      gap: 10,
      marginBottom: 20,
    },

    erroIcone: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: c.superficie,
      alignItems: 'center',
      justifyContent: 'center',
    },

    erroTitulo: {
      fontFamily: FONTES.titulo,
      fontSize: f(16),
      color: c.texto,
      textAlign: 'center',
    },

    erroTexto: {
      fontFamily: FONTES.texto,
      color: c.perigo,
      fontSize: f(13),
      textAlign: 'center',
    },

    erroBotao: {
      minHeight: 44,
      paddingHorizontal: 18,
      borderRadius: 13,
      backgroundColor: c.perigo,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 4,
    },

    erroBotaoTexto: {
      fontFamily: FONTES.destaque,
      color: '#FFFFFF',
      fontSize: f(14),
    },

    // Situação do usuário
    ligaCard: {
      backgroundColor: c.superficie,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 17,
      marginBottom: 25,
    },

    ligaTopo: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    ligaIcone: {
      width: 49,
      height: 49,
      borderRadius: 16,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    ligaInfo: {
      flex: 1,
      marginLeft: 12,
    },

    ligaTitulo: {
      fontFamily: FONTES.titulo,
      fontSize: f(16),
      color: c.texto,
    },

    ligaTexto: {
      fontFamily: FONTES.texto,
      fontSize: f(12),
      color: c.textoSuave,
      marginTop: 3,
    },

    posicaoDestaque: {
      alignItems: 'center',
      marginLeft: 8,
      minWidth: 48,
    },

    ligaPosicao: {
      fontFamily: FONTES.destaque,
      color: c.primaria,
      fontSize: f(25),
    },

    posicaoTotal: {
      fontFamily: FONTES.texto,
      fontSize: f(11),
      color: c.textoSuave,
    },

    progressoCabecalho: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 21,
      marginBottom: 9,
    },

    progressoRotulo: {
      fontFamily: FONTES.destaque,
      fontSize: f(12),
      color: c.texto,
    },

    progressoPercentual: {
      fontFamily: FONTES.destaque,
      fontSize: f(12),
      color: c.primaria,
    },

    progressoFundo: {
      height: 11,
      backgroundColor: c.primariaClara,
      borderRadius: 999,
      overflow: 'hidden',
    },

    progresso: {
      height: '100%',
      backgroundColor: c.primaria,
      borderRadius: 999,
    },

    ligaMensagemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      backgroundColor: c.iconeFundo,
      borderRadius: 12,
      padding: 10,
    },

    ligaMensagem: {
      flex: 1,
      fontFamily: FONTES.texto,
      fontSize: f(12),
      color: c.textoSuave,
    },

    // Classificação
    tituloListaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
    },

    listaTituloInfo: {
      flex: 1,
    },

    listaTitulo: {
      fontFamily: FONTES.titulo,
      fontSize: f(21),
      color: c.texto,
    },

    listaSubtitulo: {
      fontFamily: FONTES.texto,
      fontSize: f(12),
      color: c.textoSuave,
      marginTop: 3,
    },

    listaIcone: {
      width: 45,
      height: 45,
      borderRadius: 15,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Jogadores
    jogador: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.superficie,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 12,
      minHeight: 74,
    },

    jogadorPrimeiro: {
      borderColor: CORES_MEDALHA[1],
      backgroundColor: c.superficie,
    },

    jogadorVoce: {
      backgroundColor: c.iconeFundo,
      borderColor: c.primaria,
      borderWidth: 2,
    },

    posicaoContainer: {
      width: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },

    medalhaContainer: {
      width: 36,
      height: 36,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },

    posicao: {
      fontFamily: FONTES.destaque,
      fontSize: f(15),
      color: c.texto,
    },

    avatar: {
      width: 43,
      height: 43,
      borderRadius: 15,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
    },

    avatarVoce: {
      backgroundColor: c.primariaClara,
    },

    infoJogador: {
      flex: 1,
      minWidth: 0,
    },

    nomeLinha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },

    nome: {
      fontFamily: FONTES.destaque,
      fontSize: f(14),
      color: c.texto,
      flexShrink: 1,
    },

    nomeVoce: {
      color: c.primaria,
    },

    voceBadge: {
      backgroundColor: c.primariaClara,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },

    voceTexto: {
      fontFamily: FONTES.destaque,
      fontSize: f(10),
      color: c.primaria,
    },

    pontos: {
      fontFamily: FONTES.texto,
      fontSize: f(12),
      color: c.textoSuave,
      marginTop: 4,
    },

    liderIcone: {
      width: 35,
      height: 35,
      borderRadius: 12,
      backgroundColor: '#F59E0B20',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },

    reticencias: {
      alignItems: 'center',
      paddingBottom: 10,
    },

    // Lista vazia
    vazio: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
      gap: 9,
    },

    vazioIcone: {
      width: 68,
      height: 68,
      borderRadius: 23,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 5,
    },

    vazioTitulo: {
      fontFamily: FONTES.titulo,
      fontSize: f(16),
      color: c.texto,
      textAlign: 'center',
    },

    vazioTexto: {
      fontFamily: FONTES.texto,
      fontSize: f(13),
      color: c.textoSuave,
      textAlign: 'center',
      lineHeight: f(20),
    },

    // Legenda de pontos
    legenda: {
      backgroundColor: c.superficie,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 17,
      marginTop: 20,
      gap: 13,
    },

    legendaTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    legendaIcone: {
      width: 43,
      height: 43,
      borderRadius: 14,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    legendaInfo: {
      flex: 1,
    },

    legendaTitulo: {
      fontFamily: FONTES.titulo,
      fontSize: f(16),
      color: c.texto,
    },

    legendaSubtitulo: {
      fontFamily: FONTES.texto,
      fontSize: f(11),
      color: c.textoSuave,
      marginTop: 2,
    },

    legendaTexto: {
      fontFamily: FONTES.texto,
      fontSize: f(13),
      color: c.textoSuave,
      lineHeight: f(20),
    },

    legendaChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    legendaChip: {
      backgroundColor: c.iconeFundo,
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 8,
    },

    legendaChipTexto: {
      fontFamily: FONTES.destaque,
      fontSize: f(12),
      color: c.primaria,
    },
  });
