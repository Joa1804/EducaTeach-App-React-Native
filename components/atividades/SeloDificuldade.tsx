import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import {
  PONTOS_POR_DIFICULDADE,
  ROTULO_DIFICULDADE,
  type Dificuldade,
} from '@/lib/licoes/dificuldade';

type Props = {
  dificuldade: Dificuldade;
  /** Mostra também quantos pontos a dificuldade vale (padrão: sim). */
  comPontos?: boolean;
};

function coresDoSelo(c: Cores): Readonly<Record<Dificuldade, { fundo: string; texto: string }>> {
  return {
    facil: { fundo: c.sucessoFundo, texto: c.sucesso },
    medio: { fundo: c.iconeFundo, texto: c.primaria },
    dificil: { fundo: c.perigoFundo, texto: c.perigo },
  };
}

/** Etiqueta "Fácil · 50 pts" usada na trilha e no resultado da lição. */
export function SeloDificuldade({ dificuldade, comPontos = true }: Props) {
  const { cores, fonte } = useConfiguracao();
  const paleta = useMemo(() => coresDoSelo(cores)[dificuldade], [cores, dificuldade]);
  const rotulo = ROTULO_DIFICULDADE[dificuldade];
  const pontos = PONTOS_POR_DIFICULDADE[dificuldade];

  return (
    <View
      style={[styles.selo, { backgroundColor: paleta.fundo }]}
      accessible
      accessibilityLabel={`Dificuldade ${rotulo}${comPontos ? `, vale ${pontos} pontos` : ''}`}
    >
      <Text style={[styles.texto, { color: paleta.texto, fontSize: fonte(12) }]}>
        {rotulo}
        {comPontos ? ` · ${pontos} pts` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  selo: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  texto: { fontWeight: 'bold' },
});
