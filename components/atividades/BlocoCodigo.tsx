import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';

import { FONTE_CODIGO } from './estilo';

type Props = {
  codigo: string;
  /** Rótulo lido por leitores de tela antes do código. */
  rotulo?: string;
};

/** Trecho de pseudocódigo somente leitura, com quebra de linha para telas estreitas. */
export function BlocoCodigo({ codigo, rotulo = 'Trecho de código' }: Props) {
  const { cores, fonte } = useConfiguracao();
  const styles = useMemo(() => criarEstilos(cores, fonte), [cores, fonte]);

  return (
    <View style={styles.bloco} accessible accessibilityLabel={`${rotulo}: ${codigo}`}>
      <Text style={styles.codigo} selectable>
        {codigo}
      </Text>
    </View>
  );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    bloco: {
      backgroundColor: c.codigoFundo,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
    },
    codigo: {
      fontFamily: FONTE_CODIGO,
      fontSize: f(14),
      lineHeight: f(21),
      color: c.codigoTexto,
    },
  });
