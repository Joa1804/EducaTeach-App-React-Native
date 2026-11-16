import { Ionicons } from '@expo/vector-icons';
import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';

import { ALVO_TOQUE, FONTE_CODIGO } from './estilo';

export type EstadoAlternativa = 'normal' | 'selecionada' | 'correta' | 'errada';

type Props = {
  texto: string;
  estado: EstadoAlternativa;
  desabilitada: boolean;
  /** Mostra o texto em fonte de código (ex.: condições, valores). */
  codigo?: boolean;
  onPress: () => void;
};

/** Opção de resposta de múltipla escolha. */
function AlternativaBase({ texto, estado, desabilitada, codigo = false, onPress }: Props) {
  const { cores, fonte } = useConfiguracao();
  const styles = useMemo(() => criarEstilos(cores, fonte), [cores, fonte]);

  const icone =
    estado === 'correta' ? 'checkmark-circle' : estado === 'errada' ? 'close-circle' : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitada}
      accessibilityRole="radio"
      accessibilityState={{
        selected: estado !== 'normal',
        disabled: desabilitada,
      }}
      style={({ pressed }) => [
        styles.alternativa,
        estado === 'selecionada' && styles.selecionada,
        estado === 'correta' && styles.correta,
        estado === 'errada' && styles.errada,
        pressed && !desabilitada && styles.pressionada,
      ]}
    >
      <Text style={[styles.texto, codigo && styles.textoCodigo]}>{texto}</Text>
      {icone && (
        <View accessibilityElementsHidden importantForAccessibility="no">
          <Ionicons
            name={icone}
            size={22}
            color={estado === 'correta' ? cores.sucesso : cores.perigo}
          />
        </View>
      )}
    </Pressable>
  );
}

export const Alternativa = memo(AlternativaBase);

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    alternativa: {
      minHeight: ALVO_TOQUE + 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.superficie,
      borderWidth: 2,
      borderBottomWidth: 4,
      borderColor: c.borda,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    selecionada: { borderColor: c.primaria, backgroundColor: c.iconeFundo },
    correta: { borderColor: c.sucesso, backgroundColor: c.sucessoFundo },
    errada: { borderColor: c.perigo, backgroundColor: c.perigoFundo },
    pressionada: { opacity: 0.85 },
    texto: { flex: 1, fontSize: f(16), color: c.texto },
    textoCodigo: { fontFamily: FONTE_CODIGO, fontSize: f(15) },
  });
