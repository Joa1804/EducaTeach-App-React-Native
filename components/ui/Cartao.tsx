import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useConfiguracao } from '@/context/ConfiguracaoContext';
import { escurecer } from '@/lib/cores';

type CartaoProps = {
  children: ReactNode;
  /** Borda na cor de destaque (use para a lição atual, o item selecionado, etc.). */
  destaque?: boolean;
  estilo?: StyleProp<ViewStyle>;
};

/** Cartão arredondado com borda e uma base mais grossa, no mesmo estilo dos botões. */
export function Cartao({ children, destaque = false, estilo }: CartaoProps) {
  const { cores } = useConfiguracao();

  const borda = destaque ? cores.primaria : cores.borda;
  const base = destaque ? escurecer(cores.primaria) : escurecer(cores.borda, 0.12);

  return (
    <View
      style={[
        {
          backgroundColor: cores.superficie,
          borderRadius: 20,
          borderWidth: 2,
          borderBottomWidth: 5,
          borderColor: borda,
          borderBottomColor: base,
          padding: 16,
        },
        estilo,
      ]}
    >
      {children}
    </View>
  );
}