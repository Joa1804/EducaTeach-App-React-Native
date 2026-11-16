import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExercicioMultiplaEscolha as Exercicio } from '@/lib/licoes/schemas';

import { Alternativa, type EstadoAlternativa } from './Alternativa';
import { BlocoCodigo } from './BlocoCodigo';
import type { PropsExercicio } from './tipos';

/** Textos curtos com símbolos de código ficam melhores em fonte monoespaçada. */
const PARECE_CODIGO = /[<>=+\-*/%()]|^\d+( \d+)*$/;

export function ExercicioMultiplaEscolha({
  exercicio,
  travado,
  resultado,
  onChange,
}: PropsExercicio<Exercicio>) {
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const selecionar = useCallback(
    (opcaoId: string) => {
      setSelecionada(opcaoId);
      onChange({ tipo: 'multipla-escolha', opcaoId });
    },
    [onChange],
  );

  const estadoDe = useCallback(
    (opcaoId: string): EstadoAlternativa => {
      if (!resultado) return opcaoId === selecionada ? 'selecionada' : 'normal';
      if (opcaoId === exercicio.respostaCorretaId) return 'correta';
      return opcaoId === selecionada ? 'errada' : 'normal';
    },
    [resultado, selecionada, exercicio.respostaCorretaId],
  );

  const opcoesCodigo = useMemo(
    () => exercicio.opcoes.every((opcao) => PARECE_CODIGO.test(opcao.texto)),
    [exercicio.opcoes],
  );

  return (
    <View style={styles.container}>
      {exercicio.codigo && <BlocoCodigo codigo={exercicio.codigo} />}
      <View style={styles.opcoes} accessibilityRole="radiogroup">
        {exercicio.opcoes.map((opcao) => (
          <Alternativa
            key={opcao.id}
            texto={opcao.texto}
            estado={estadoDe(opcao.id)}
            desabilitada={travado}
            codigo={opcoesCodigo}
            onPress={() => selecionar(opcao.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18 },
  opcoes: { gap: 10 },
});
