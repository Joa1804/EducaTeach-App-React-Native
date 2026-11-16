import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputSelectionChangeEvent,
} from 'react-native';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { TAMANHO_MINIMO_PSEUDOCODIGO } from '@/lib/licoes/correcao';
import type { ExercicioPseudocodigo as Exercicio } from '@/lib/licoes/schemas';

import { ALVO_TOQUE, FONTE_CODIGO } from './estilo';
import type { PropsExercicio } from './tipos';

/** Limite para evitar textos enormes colados no campo. */
const TAMANHO_MAXIMO = 1200;

type Selecao = { start: number; end: number };

/**
 * Campo livre para escrever pseudocódigo. As palavras-chave viram atalhos que
 * inserem o texto na posição do cursor (útil no teclado do celular).
 */
export function ExercicioPseudocodigo({
  exercicio,
  travado,
  resultado,
  onChange,
}: PropsExercicio<Exercicio>) {
  const { cores, fonte } = useConfiguracao();
  const styles = useMemo(() => criarEstilos(cores, fonte), [cores, fonte]);

  const [texto, setTexto] = useState('');
  const selecao = useRef<Selecao>({ start: 0, end: 0 });
  const campo = useRef<TextInputInstance>(null);

  const atualizar = useCallback(
    (novo: string) => {
      const limitado = novo.slice(0, TAMANHO_MAXIMO);
      setTexto(limitado);
      onChange({ tipo: 'escrever-pseudocodigo', texto: limitado });
    },
    [onChange],
  );

  const aoMudarSelecao = (evento: TextInputSelectionChangeEvent) => {
    selecao.current = evento.nativeEvent.selection;
  };

  const inserir = (palavra: string) => {
    if (travado) return;
    const { start, end } = selecao.current;
    const inicio = Math.min(start, texto.length);
    const fim = Math.min(Math.max(end, inicio), texto.length);
    const antes = texto.slice(0, inicio);
    const precisaEspaco = antes.length > 0 && !/\s$/.test(antes) && palavra !== '"';
    const trecho = `${precisaEspaco ? ' ' : ''}${palavra}${palavra === '"' ? '' : ' '}`;
    const novo = `${antes}${trecho}${texto.slice(fim)}`;
    const cursor = inicio + trecho.length;
    selecao.current = { start: cursor, end: cursor };
    atualizar(novo);
    campo.current?.focus();
  };

  const faltam = Math.max(0, TAMANHO_MINIMO_PSEUDOCODIGO - texto.replace(/\s/g, '').length);

  return (
    <View style={styles.container}>
      {exercicio.palavrasChave.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.atalhos}
        >
          {exercicio.palavrasChave.map((palavra) => (
            <Pressable
              key={palavra}
              onPress={() => inserir(palavra)}
              disabled={travado}
              accessibilityRole="button"
              accessibilityLabel={`Inserir ${palavra}`}
              style={({ pressed }) => [styles.atalho, pressed && styles.pressionado]}
            >
              <Text style={styles.textoAtalho}>{palavra}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <TextInput
        ref={campo}
        value={texto}
        onChangeText={atualizar}
        onSelectionChange={aoMudarSelecao}
        editable={!travado}
        multiline
        maxLength={TAMANHO_MAXIMO}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        textAlignVertical="top"
        placeholder={'Escreva seu pseudocódigo aqui...\nEx.: leia x'}
        placeholderTextColor={cores.textoSuave}
        accessibilityLabel="Editor de pseudocódigo"
        style={[
          styles.editor,
          resultado && (resultado.correta ? styles.editorCorreto : styles.editorErrado),
        ]}
      />

      {!resultado && faltam > 0 && texto.length > 0 && (
        <Text style={styles.dica}>Escreva um pouco mais para poder verificar.</Text>
      )}
    </View>
  );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    container: { gap: 12 },
    atalhos: { gap: 8, paddingVertical: 2 },
    atalho: {
      minHeight: ALVO_TOQUE - 6,
      minWidth: ALVO_TOQUE - 6,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: c.iconeFundo,
      borderWidth: 1,
      borderColor: c.primariaClara,
    },
    pressionado: { opacity: 0.75 },
    textoAtalho: {
      fontFamily: FONTE_CODIGO,
      fontSize: f(14),
      color: c.primaria,
      fontWeight: 'bold',
    },
    editor: {
      minHeight: 170,
      maxHeight: 320,
      backgroundColor: c.codigoFundo,
      color: c.codigoTexto,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: c.codigoFundo,
      padding: 14,
      fontFamily: FONTE_CODIGO,
      fontSize: f(15),
      lineHeight: f(22),
    },
    editorCorreto: { borderColor: c.sucesso },
    editorErrado: { borderColor: c.perigo },
    dica: { fontSize: f(13), color: c.textoSuave },
  });
