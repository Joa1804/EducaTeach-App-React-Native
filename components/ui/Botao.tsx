import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { FONTES } from '@/constants/fontes';
import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { corDoTexto, escurecer } from '@/lib/cores';

type Variante = 'primario' | 'sucesso' | 'secundario' | 'perigo';

type BotaoProps = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icone?: keyof typeof Ionicons.glyphMap;
  desabilitado?: boolean;
  carregando?: boolean;
  estilo?: StyleProp<ViewStyle>;
};

/**
 * Botão arredondado com "base" grossa (efeito 3D). Ao tocar, ele afunda alguns pixels.
 * Funciona no tema normal e no alto contraste.
 */
export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  desabilitado = false,
  carregando = false,
  estilo,
}: BotaoProps) {
  const { cores, fonte } = useConfiguracao();
  const styles = criarEstilos(fonte);
  const { fundo, borda, base, texto } = coresDaVariante(variante, cores);
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        styles.botao,
        { backgroundColor: fundo, borderColor: borda, borderBottomColor: base },
        pressed && !inativo && styles.pressionado,
        inativo && styles.inativo,
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator size="small" color={texto} />
      ) : (
        <View style={styles.conteudo}>
          {icone && <Ionicons name={icone} size={20} color={texto} />}
          <Text style={[styles.titulo, { color: texto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

function coresDaVariante(variante: Variante, c: Cores) {
  switch (variante) {
    case 'sucesso':
      return { fundo: c.sucesso, borda: c.sucesso, base: escurecer(c.sucesso), texto: corDoTexto(c.sucesso) };
    case 'perigo':
      return { fundo: c.perigo, borda: c.perigo, base: escurecer(c.perigo), texto: corDoTexto(c.perigo) };
    case 'secundario':
      return { fundo: c.superficie, borda: c.borda, base: c.borda, texto: c.primaria };
    default:
      return { fundo: c.primaria, borda: c.primaria, base: escurecer(c.primaria), texto: c.textoPrimaria };
  }
}

const criarEstilos = (f: (tamanho: number) => number) =>
  StyleSheet.create({
    botao: {
      minHeight: 48,
      borderRadius: 14,
      borderWidth: 2,
      borderBottomWidth: 5, // a "base" que dá o efeito 3D
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Afunda 3px: a base diminui 3 e a margem do topo aumenta 3, então a altura total não muda
    pressionado: {
      borderBottomWidth: 2,
      marginTop: 3,
    },
    inativo: {
      opacity: 0.5,
    },
    conteudo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    titulo: {
      fontFamily: FONTES.subtitulo,
      fontSize: f(16),
    },
  });