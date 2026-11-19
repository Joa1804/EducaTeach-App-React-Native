import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { FONTES } from '@/constants/fontes';
import { useConfiguracao } from '@/context/ConfiguracaoContext';
import { comAlfa, escurecer } from '@/lib/cores';

type EtiquetaProps = {
  texto: string;
  /** Cor base da etiqueta, ex.: cores.sucesso. Se omitida, usa a cor primária. */
  cor?: string;
  estilo?: StyleProp<ViewStyle>;
};

/** Selo pequeno (categoria, nível, status). Fundo suave e texto em fonte pixel. */
export function Etiqueta({ texto, cor, estilo }: EtiquetaProps) {
  const { cores, fonte, altoContraste } = useConfiguracao();
  const base = cor ?? cores.primaria;

  // No tema claro o texto fica mais escuro para ler bem sobre o fundo suave
  const corTexto = altoContraste ? base : escurecer(base, 0.3);

  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: comAlfa(base, 0.15),
          borderRadius: 8,
          paddingVertical: 3,
          paddingHorizontal: 8,
        },
        estilo,
      ]}
    >
      <Text style={{ color: corTexto, fontFamily: FONTES.destaque, fontSize: fonte(12) }}>{texto}</Text>
    </View>
  );
}