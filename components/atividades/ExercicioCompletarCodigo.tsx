import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { dividirEmSegmentos } from '@/lib/licoes/codigo';
import type { ExercicioCompletarCodigo as Exercicio } from '@/lib/licoes/schemas';

import { ALVO_TOQUE, FONTE_CODIGO } from './estilo';
import type { PropsExercicio } from './tipos';

/**
 * Código com lacunas e um banco de fichas: tocar numa ficha preenche a próxima
 * lacuna vazia; tocar numa lacuna preenchida devolve a ficha ao banco.
 * As lacunas guardam o índice da ficha para suportar fichas com o mesmo texto.
 */
export function ExercicioCompletarCodigo({
  exercicio,
  travado,
  resultado,
  onChange,
}: PropsExercicio<Exercicio>) {
  const { cores, fonte } = useConfiguracao();
  const styles = useMemo(() => criarEstilos(cores, fonte), [cores, fonte]);
  const linhas = useMemo(() => dividirEmSegmentos(exercicio.codigo), [exercicio.codigo]);

  const [lacunas, setLacunas] = useState<(number | null)[]>(() =>
    exercicio.respostas.map(() => null),
  );

  const atualizar = useCallback(
    (proximas: (number | null)[]) => {
      setLacunas(proximas);
      onChange({
        tipo: 'completar-codigo',
        preenchimento: proximas.map((ficha) => (ficha === null ? null : exercicio.opcoes[ficha])),
      });
    },
    [exercicio.opcoes, onChange],
  );

  const usarFicha = (ficha: number) => {
    const vazia = lacunas.indexOf(null);
    if (travado || vazia === -1 || lacunas.includes(ficha)) return;
    atualizar(lacunas.map((valor, indice) => (indice === vazia ? ficha : valor)));
  };

  const limparLacuna = (indiceLacuna: number) => {
    if (travado || lacunas[indiceLacuna] === null) return;
    atualizar(lacunas.map((valor, indice) => (indice === indiceLacuna ? null : valor)));
  };

  const erradas = new Set(resultado?.lacunasErradas ?? []);
  const proximaVazia = lacunas.indexOf(null);

  return (
    <View style={styles.container}>
      <View style={styles.codigo} accessibilityLabel="Código com lacunas">
        {linhas.map((segmentos, numeroLinha) => (
          <View key={numeroLinha} style={styles.linha}>
            {segmentos.length === 0 && <Text style={styles.texto}> </Text>}
            {segmentos.map((segmento, indiceSegmento) => {
              if (segmento.tipo === 'texto') {
                return (
                  <Text key={indiceSegmento} style={styles.texto}>
                    {segmento.valor}
                  </Text>
                );
              }

              const ficha = lacunas[segmento.indice];
              const valor = ficha === null ? null : exercicio.opcoes[ficha];
              const status = resultado
                ? erradas.has(segmento.indice)
                  ? styles.lacunaErrada
                  : styles.lacunaCorreta
                : segmento.indice === proximaVazia
                  ? styles.lacunaAtiva
                  : null;

              return (
                <Pressable
                  key={indiceSegmento}
                  onPress={() => limparLacuna(segmento.indice)}
                  disabled={travado || valor === null}
                  accessibilityRole="button"
                  accessibilityLabel={
                    valor === null
                      ? `Lacuna ${segmento.indice + 1}, vazia`
                      : `Lacuna ${segmento.indice + 1}: ${valor}. Toque para remover.`
                  }
                  hitSlop={6}
                  style={[styles.lacuna, valor !== null && styles.lacunaPreenchida, status]}
                >
                  <Text style={[styles.textoLacuna, valor === null && styles.textoVazio]}>
                    {valor ?? '    '}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.banco} accessibilityLabel="Fichas disponíveis">
        {exercicio.opcoes.map((opcao, indice) => {
          const usada = lacunas.includes(indice);
          return (
            <Pressable
              key={`${opcao}-${indice}`}
              onPress={() => usarFicha(indice)}
              disabled={travado || usada}
              accessibilityRole="button"
              accessibilityLabel={usada ? `${opcao}, já usada` : `Usar ${opcao}`}
              accessibilityState={{ disabled: travado || usada }}
              style={({ pressed }) => [
                styles.ficha,
                usada && styles.fichaUsada,
                pressed && styles.fichaPressionada,
              ]}
            >
              <Text style={[styles.textoFicha, usada && styles.textoFichaUsada]}>{opcao}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    container: { gap: 20 },
    codigo: {
      backgroundColor: c.codigoFundo,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      gap: 6,
    },
    linha: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: 6 },
    texto: { fontFamily: FONTE_CODIGO, fontSize: f(14), lineHeight: f(22), color: c.codigoTexto },
    lacuna: {
      minWidth: 56,
      minHeight: 30,
      borderRadius: 8,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: c.primariaClara,
      paddingHorizontal: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 2,
    },
    lacunaAtiva: { borderColor: c.estrela },
    lacunaPreenchida: {
      borderStyle: 'solid',
      backgroundColor: c.superficie,
      borderColor: c.primaria,
    },
    lacunaCorreta: {
      borderStyle: 'solid',
      borderColor: c.sucesso,
      backgroundColor: c.sucessoFundo,
    },
    lacunaErrada: { borderStyle: 'solid', borderColor: c.perigo, backgroundColor: c.perigoFundo },
    textoLacuna: { fontFamily: FONTE_CODIGO, fontSize: f(14), fontWeight: 'bold', color: c.texto },
    textoVazio: { color: c.codigoTexto },
    banco: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    ficha: {
      minHeight: ALVO_TOQUE,
      minWidth: ALVO_TOQUE + 16,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderBottomWidth: 4,
      borderColor: c.borda,
      backgroundColor: c.superficie,
    },
    fichaUsada: { backgroundColor: c.fundo, borderColor: c.borda },
    fichaPressionada: { opacity: 0.8 },
    textoFicha: { fontFamily: FONTE_CODIGO, fontSize: f(15), fontWeight: 'bold', color: c.texto },
    textoFichaUsada: { color: 'transparent' },
  });
