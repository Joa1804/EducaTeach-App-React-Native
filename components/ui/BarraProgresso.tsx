import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useConfiguracao } from '@/context/ConfiguracaoContext';
import { comAlfa } from '@/lib/cores';

type BarraProgressoProps = {
  /** Progresso de 0 a 1 (ex.: 0.6 = 60%). */
  valor: number;
  /** Quantidade de blocos da barra. */
  segmentos?: number;
  /** Cor dos blocos cheios. Se omitida, usa a cor primária. */
  cor?: string;
  /** Texto lido por leitores de tela (ex.: "Progresso da lição"). */
  rotulo?: string;
  estilo?: StyleProp<ViewStyle>;
};

/** Barra de progresso feita de blocos, como uma barra de XP de jogo pixel. */
export function BarraProgresso({
  valor,
  segmentos = 10,
  cor,
  rotulo = 'Progresso',
  estilo,
}: BarraProgressoProps) {
  const { cores } = useConfiguracao();
  const base = cor ?? cores.primaria;

  const limitado = Math.min(1, Math.max(0, valor));
  const cheios = Math.round(limitado * segmentos);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={rotulo}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(limitado * 100) }}
      style={[{ flexDirection: 'row', gap: 3 }, estilo]}
    >
      {Array.from({ length: segmentos }, (_, indice) => (
        <View
          key={indice}
          style={{
            flex: 1,
            height: 12,
            borderRadius: 3,
            // bloco cheio na cor da barra; vazio na mesma cor, bem suave
            backgroundColor: indice < cheios ? base : comAlfa(base, 0.25),
          }}
        />
      ))}
    </View>
  );
}