import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import type { ResultadoConclusao } from '@/hooks/use-concluir-atividade';
import type { Desempenho } from '@/lib/licoes/desempenho';
import type { Licao } from '@/lib/licoes/schemas';

import { ALVO_TOQUE } from './estilo';

type Props = {
  licao: Licao;
  desempenho: Desempenho;
  conclusao: ResultadoConclusao | null;
  salvando: boolean;
  erro: string | null;
  onTentarSalvar: () => void;
  onRefazer: () => void;
  onContinuar: () => void;
};

const TITULOS: Readonly<Record<Desempenho['estrelas'], string>> = {
  3: 'Perfeito!',
  2: 'Muito bem!',
  1: 'Lição concluída!',
};

/** Tela final da lição: estrelas, pontos e o estado do salvamento no banco. */
export function ResultadoAtividade({
  licao,
  desempenho,
  conclusao,
  salvando,
  erro,
  onTentarSalvar,
  onRefazer,
  onContinuar,
}: Props) {
  const { cores, fonte } = useConfiguracao();
  const styles = useMemo(() => criarEstilos(cores, fonte), [cores, fonte]);

  const pontosTexto = conclusao
    ? conclusao.primeiraVez
      ? `+${conclusao.pontosGanhos}`
      : conclusao.pontosGanhos > 0
        ? `+${conclusao.pontosGanhos}`
        : '0'
    : `${desempenho.pontos}`;

  const recorde =
    conclusao && !conclusao.primeiraVez
      ? conclusao.pontosGanhos > 0
        ? 'Novo recorde nesta lição!'
        : 'Seu recorde anterior foi mantido.'
      : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <Animated.View entering={ZoomIn.duration(300)} style={styles.trofeu}>
        <Ionicons name="trophy" size={56} color={cores.estrela} />
      </Animated.View>

      <Text style={styles.titulo} accessibilityRole="header">
        {TITULOS[desempenho.estrelas]}
      </Text>
      <Text style={styles.subtitulo}>{licao.titulo}</Text>

      <View
        style={styles.estrelas}
        accessible
        accessibilityLabel={`${desempenho.estrelas} de 3 estrelas`}
      >
        {[1, 2, 3].map((numero) => (
          <Ionicons
            key={numero}
            name={numero <= desempenho.estrelas ? 'star' : 'star-outline'}
            size={40}
            color={cores.estrela}
          />
        ))}
      </View>

      <View style={styles.estatisticas}>
        <Estatistica
          styles={styles}
          rotulo="Precisão"
          valor={`${desempenho.precisao}%`}
          icone="locate"
          cor={cores.primaria}
        />
        <Estatistica
          styles={styles}
          rotulo="Pontos"
          valor={pontosTexto}
          icone="flash"
          cor={cores.estrela}
        />
        <Estatistica
          styles={styles}
          rotulo="Moedas"
          valor={conclusao?.primeiraVez ? `+${licao.moedas}` : '0'}
          icone="cash"
          cor={cores.sucesso}
        />
      </View>

      <Text style={styles.detalhe}>
        {desempenho.acertosDePrimeira} de {desempenho.total} exercícios certos de primeira.
      </Text>

      {salvando && (
        <View style={styles.status} accessibilityLiveRegion="polite">
          <ActivityIndicator color={cores.primaria} />
          <Text style={styles.textoStatus}>Salvando seu progresso...</Text>
        </View>
      )}
      {!salvando && recorde && <Text style={styles.textoStatus}>{recorde}</Text>}
      {!salvando && erro && (
        <View style={styles.erroCaixa} accessibilityLiveRegion="polite">
          <Text style={styles.erroTexto}>{erro}</Text>
          <Pressable onPress={onTentarSalvar} accessibilityRole="button" style={styles.botaoErro}>
            <Text style={styles.textoBotaoErro}>Tentar salvar de novo</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.acoes}>
        <Pressable
          onPress={onContinuar}
          disabled={salvando}
          accessibilityRole="button"
          accessibilityState={{ disabled: salvando }}
          style={({ pressed }) => [
            styles.botao,
            salvando && styles.desabilitado,
            pressed && styles.pressionado,
          ]}
        >
          <Text style={styles.textoBotao}>Continuar trilha</Text>
        </Pressable>
        <Pressable
          onPress={onRefazer}
          disabled={salvando}
          accessibilityRole="button"
          style={({ pressed }) => [styles.botaoSecundario, pressed && styles.pressionado]}
        >
          <Text style={styles.textoBotaoSecundario}>Refazer lição</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

type PropsEstatistica = {
  styles: ReturnType<typeof criarEstilos>;
  rotulo: string;
  valor: string;
  icone: 'locate' | 'flash' | 'cash';
  cor: string;
};

function Estatistica({ styles, rotulo, valor, icone, cor }: PropsEstatistica) {
  return (
    <View style={styles.estatistica} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <Ionicons name={icone} size={20} color={cor} />
      <Text style={styles.valor}>{valor}</Text>
      <Text style={styles.rotulo}>{rotulo}</Text>
    </View>
  );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.fundo },
    conteudo: { padding: 20, paddingBottom: 40, alignItems: 'center', gap: 14 },
    trofeu: {
      width: 104,
      height: 104,
      borderRadius: 52,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
    },
    titulo: { fontSize: f(26), fontWeight: 'bold', color: c.texto, textAlign: 'center' },
    subtitulo: { fontSize: f(15), color: c.textoSuave, marginTop: -8 },
    estrelas: { flexDirection: 'row', gap: 6 },
    estatisticas: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
    estatistica: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
      backgroundColor: c.superficie,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.borda,
      paddingVertical: 12,
    },
    valor: { fontSize: f(20), fontWeight: 'bold', color: c.texto },
    rotulo: { fontSize: f(12), color: c.textoSuave },
    detalhe: { fontSize: f(14), color: c.textoSuave, textAlign: 'center' },
    status: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    textoStatus: { fontSize: f(14), color: c.texto, textAlign: 'center' },
    erroCaixa: {
      alignSelf: 'stretch',
      gap: 8,
      backgroundColor: c.perigoFundo,
      borderRadius: 12,
      padding: 12,
    },
    erroTexto: { fontSize: f(14), color: c.perigo, textAlign: 'center' },
    botaoErro: { minHeight: ALVO_TOQUE, alignItems: 'center', justifyContent: 'center' },
    textoBotaoErro: { color: c.perigo, fontWeight: 'bold', fontSize: f(15) },
    acoes: { alignSelf: 'stretch', gap: 10, marginTop: 8 },
    botao: {
      minHeight: ALVO_TOQUE + 6,
      borderRadius: 14,
      backgroundColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
    },
    desabilitado: { opacity: 0.6 },
    pressionado: { opacity: 0.85 },
    textoBotao: { color: c.textoPrimaria, fontSize: f(16), fontWeight: 'bold' },
    botaoSecundario: {
      minHeight: ALVO_TOQUE + 6,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textoBotaoSecundario: { color: c.primaria, fontSize: f(16), fontWeight: 'bold' },
  });
