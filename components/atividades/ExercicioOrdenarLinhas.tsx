import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { embaralharDiferente } from '@/lib/licoes/embaralhar';
import type { ExercicioOrdenarLinhas as Exercicio } from '@/lib/licoes/schemas';

import { ALVO_TOQUE, FONTE_CODIGO } from './estilo';
import type { PropsExercicio } from './tipos';

/**
 * Monta o algoritmo tocando nas linhas embaralhadas na ordem certa. Tocar numa
 * linha já colocada devolve ela (e as seguintes ficam no lugar) para as opções.
 */
export function ExercicioOrdenarLinhas({
  exercicio,
  travado,
  resultado,
  onChange,
}: PropsExercicio<Exercicio>) {
  const { cores, fonte } = useConfiguracao();
  const styles = useMemo(() => criarEstilos(cores, fonte), [cores, fonte]);

  const porId = useMemo(
    () => new Map(exercicio.linhas.map((linha) => [linha.id, linha])),
    [exercicio.linhas],
  );

  // Embaralha uma vez por exibição; nunca começa já na ordem correta.
  const [embaralhadas] = useState(() =>
    embaralharDiferente(
      exercicio.linhas.map((linha) => linha.id),
      [exercicio.linhas.map((linha) => linha.id), ...exercicio.ordensAlternativas],
    ),
  );
  const [colocadas, setColocadas] = useState<string[]>([]);

  const atualizar = useCallback(
    (proximas: string[]) => {
      setColocadas(proximas);
      onChange(proximas.length === 0 ? null : { tipo: 'ordenar-linhas', ordem: proximas });
    },
    [onChange],
  );

  const colocar = (id: string) => {
    if (travado || colocadas.includes(id)) return;
    atualizar([...colocadas, id]);
  };

  const retirar = (id: string) => {
    if (travado) return;
    atualizar(colocadas.filter((atual) => atual !== id));
  };

  const disponiveis = embaralhadas.filter((id) => !colocadas.includes(id));
  const estiloResultado = resultado
    ? resultado.correta
      ? styles.montagemCorreta
      : styles.montagemErrada
    : null;

  return (
    <View style={styles.container}>
      <View style={[styles.montagem, estiloResultado]} accessibilityLabel="Seu algoritmo">
        {colocadas.length === 0 ? (
          <Text style={styles.dica}>
            Toque nas linhas abaixo na ordem em que devem ser executadas.
          </Text>
        ) : (
          colocadas.map((id, posicao) => {
            const linha = porId.get(id);
            if (!linha) return null;
            return (
              <Pressable
                key={id}
                onPress={() => retirar(id)}
                disabled={travado}
                accessibilityRole="button"
                accessibilityLabel={`Linha ${posicao + 1}: ${linha.texto}. Toque para remover.`}
                style={({ pressed }) => [styles.linhaColocada, pressed && styles.pressionada]}
              >
                <Text style={styles.numero}>{posicao + 1}</Text>
                <Text style={[styles.textoLinha, styles.textoColocado]}>{linha.texto}</Text>
              </Pressable>
            );
          })
        )}
      </View>

      <View style={styles.opcoes} accessibilityLabel="Linhas disponíveis">
        {disponiveis.map((id) => {
          const linha = porId.get(id);
          if (!linha) return null;
          return (
            <Pressable
              key={id}
              onPress={() => colocar(id)}
              disabled={travado}
              accessibilityRole="button"
              accessibilityLabel={`Adicionar: ${linha.texto}`}
              style={({ pressed }) => [styles.linhaOpcao, pressed && styles.pressionada]}
            >
              <Ionicons name="add-circle-outline" size={18} color={cores.primaria} />
              <Text style={styles.textoLinha}>{linha.texto}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    container: { gap: 18 },
    montagem: {
      minHeight: 120,
      borderRadius: 14,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: c.primariaClara,
      backgroundColor: c.superficie,
      padding: 10,
      gap: 8,
      justifyContent: 'center',
    },
    montagemCorreta: {
      borderStyle: 'solid',
      borderColor: c.sucesso,
      backgroundColor: c.sucessoFundo,
    },
    montagemErrada: { borderStyle: 'solid', borderColor: c.perigo, backgroundColor: c.perigoFundo },
    dica: { textAlign: 'center', color: c.textoSuave, fontSize: f(14), paddingHorizontal: 12 },
    linhaColocada: {
      minHeight: ALVO_TOQUE,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.codigoFundo,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    numero: { color: c.primariaClara, fontSize: f(12), fontWeight: 'bold', minWidth: 14 },
    opcoes: { gap: 8 },
    linhaOpcao: {
      minHeight: ALVO_TOQUE,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.superficie,
      borderWidth: 2,
      borderBottomWidth: 4,
      borderColor: c.borda,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    pressionada: { opacity: 0.8 },
    textoLinha: { flex: 1, fontFamily: FONTE_CODIGO, fontSize: f(14), color: c.texto },
    textoColocado: { color: c.codigoTexto },
  });
