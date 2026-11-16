import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import type { ResultadoCorrecao } from '@/lib/licoes/correcao';
import type { Exercicio } from '@/lib/licoes/schemas';

import { ALVO_TOQUE, FONTE_CODIGO } from './estilo';

type Props = {
  exercicio: Exercicio;
  resultado: ResultadoCorrecao;
  onContinuar: () => void;
};

const MENSAGENS_ACERTO = ['Muito bem!', 'Mandou bem!', 'Excelente!', 'Isso aí!'] as const;

function rotuloResposta(exercicio: Exercicio, correta: boolean): string {
  if (exercicio.tipo === 'escrever-pseudocodigo') return 'Uma solução possível:';
  return correta ? 'Resposta:' : 'Resposta correta:';
}

/** Painel inferior, no estilo Duolingo, com o resultado da verificação. */
export function FeedbackCorrecao({ exercicio, resultado, onContinuar }: Props) {
  const { cores, fonte } = useConfiguracao();
  const styles = useMemo(() => criarEstilos(cores, fonte), [cores, fonte]);
  const { correta } = resultado;

  // Mensagem estável para o mesmo exercício, sem sortear a cada render.
  const titulo = correta
    ? MENSAGENS_ACERTO[exercicio.id.length % MENSAGENS_ACERTO.length]
    : 'Ainda não...';

  // Em múltipla escolha a opção certa já fica destacada; repetir só se errou.
  const mostrarResposta =
    resultado.respostaEsperada.length > 0 &&
    (exercicio.tipo === 'escrever-pseudocodigo' ||
      (!correta && exercicio.tipo !== 'multipla-escolha'));

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      style={[styles.painel, correta ? styles.painelCorreto : styles.painelErrado]}
      accessibilityLiveRegion="assertive"
    >
      <ScrollView style={styles.rolagem} contentContainerStyle={styles.conteudo}>
        <View style={styles.cabecalho}>
          <Ionicons
            name={correta ? 'checkmark-circle' : 'close-circle'}
            size={28}
            color={correta ? cores.sucesso : cores.perigo}
          />
          <Text
            style={[styles.titulo, { color: correta ? cores.sucesso : cores.perigo }]}
            accessibilityRole="header"
          >
            {titulo}
          </Text>
        </View>

        {resultado.requisitos && (
          <View style={styles.checklist} accessibilityLabel="O que foi verificado">
            {resultado.requisitos.map((requisito) => (
              <View
                key={requisito.id}
                style={styles.requisito}
                accessible
                accessibilityLabel={`${requisito.descricao}: ${requisito.atendido ? 'ok' : 'faltou'}`}
              >
                <Ionicons
                  name={requisito.atendido ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={requisito.atendido ? cores.sucesso : cores.perigo}
                />
                <Text style={styles.textoRequisito}>{requisito.descricao}</Text>
              </View>
            ))}
          </View>
        )}

        {mostrarResposta && (
          <View style={styles.resposta}>
            <Text style={styles.rotulo}>{rotuloResposta(exercicio, correta)}</Text>
            <Text style={styles.codigo} selectable>
              {resultado.respostaEsperada}
            </Text>
          </View>
        )}

        <Text style={styles.explicacao}>{exercicio.explicacao}</Text>
        {!correta && (
          <Text style={styles.aviso}>Este exercício vai aparecer de novo no fim da lição.</Text>
        )}
      </ScrollView>

      <Pressable
        onPress={onContinuar}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.botao,
          { backgroundColor: correta ? cores.sucesso : cores.perigo },
          pressed && styles.pressionado,
        ]}
      >
        <Text style={styles.textoBotao}>{correta ? 'Continuar' : 'Entendi'}</Text>
      </Pressable>
    </Animated.View>
  );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    painel: {
      borderTopWidth: 2,
      paddingHorizontal: 16,
      paddingTop: 14,
      gap: 12,
    },
    painelCorreto: { backgroundColor: c.sucessoFundo, borderTopColor: c.sucesso },
    painelErrado: { backgroundColor: c.perigoFundo, borderTopColor: c.perigo },
    rolagem: { maxHeight: 260 },
    conteudo: { gap: 10 },
    cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    titulo: { fontSize: f(20), fontWeight: 'bold' },
    checklist: { gap: 6 },
    requisito: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    textoRequisito: { flex: 1, fontSize: f(14), color: c.texto },
    resposta: { gap: 6 },
    rotulo: { fontSize: f(14), fontWeight: 'bold', color: c.texto },
    codigo: {
      fontFamily: FONTE_CODIGO,
      fontSize: f(13),
      lineHeight: f(20),
      color: c.codigoTexto,
      backgroundColor: c.codigoFundo,
      borderRadius: 10,
      padding: 10,
      overflow: 'hidden',
    },
    explicacao: { fontSize: f(14), lineHeight: f(20), color: c.texto },
    aviso: { fontSize: f(13), color: c.textoSuave, fontStyle: 'italic' },
    botao: {
      minHeight: ALVO_TOQUE + 6,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressionado: { opacity: 0.85 },
    textoBotao: { color: c.textoSobreCor, fontSize: f(16), fontWeight: 'bold' },
  });
