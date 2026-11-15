import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { ATIVIDADE, type Atividade, type Dificuldade } from '@/data/atividade';
import { useConcluirAtividade, type ResultadoConclusao } from '@/hooks/use-concluir-atividade';

const ROTULO_DIFICULDADE: Readonly<Record<Dificuldade, string>> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

/**
 * O parâmetro de rota vem da URL (deep link, web), então é tratado como dado externo:
 * pode faltar, vir repetido (array) ou não corresponder a nenhuma atividade.
 */
function buscarAtividade(id: string | string[] | undefined): Atividade | null {
  const valor = Array.isArray(id) ? id[0] : id;
  if (!valor) return null;
  return ATIVIDADE.find((atividade) => atividade.id === valor) ?? null;
}

export default function AtividadeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cores, fonte } = useConfiguracao();
  const styles = criarEstilos(cores, fonte);
  const atividade = buscarAtividade(id);

  const { salvando, erro, concluir } = useConcluirAtividade();
  const [resultado, setResultado] = useState<ResultadoConclusao | null>(null);

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/aprender');
    }
  }

  async function handleConcluir() {
    if (!atividade) return;
    // O hook já ignora cliques repetidos enquanto salva.
    const retorno = await concluir(atividade);
    if (retorno) setResultado(retorno);
  }

  if (!atividade) {
    return (
      <View style={styles.vazio}>
        <Stack.Screen options={{ title: 'Atividade não encontrada' }} />
        <Ionicons name="alert-circle-outline" size={48} color={cores.textoSuave} />
        <Text style={styles.vazioTexto}>Não encontramos essa atividade.</Text>
        <Pressable style={styles.botao} onPress={voltar} accessibilityRole="button">
          <Text style={styles.botaoTexto}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: atividade.titulo }} />

      <View style={styles.cabecalho}>
        <View style={styles.icone}>
          <Ionicons name={atividade.icone} size={28} color={cores.textoPrimaria} />
        </View>
        <View style={styles.info}>
          <Text style={styles.titulo}>{atividade.titulo}</Text>
          <Text style={styles.subtitulo}>
            {ROTULO_DIFICULDADE[atividade.dificuldade]} · {atividade.pontos} pontos · {atividade.moedas}{' '}
            {atividade.moedas === 1 ? 'moeda' : 'moedas'}
          </Text>
        </View>
      </View>

      {resultado && (
        <View style={styles.aviso} accessibilityLiveRegion="polite">
          <Ionicons name="checkmark-circle" size={22} color="#10B981" />
          <Text style={styles.avisoTexto}>
            {resultado.primeiraVez
              ? `Atividade concluída! Você ganhou ${resultado.pontosGanhos} pontos.`
              : 'Você já tinha concluído esta atividade.'}
          </Text>
        </View>
      )}

      {erro && (
        <Text style={styles.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      )}

      <Pressable
        style={[styles.botao, salvando && styles.desabilitado]}
        onPress={handleConcluir}
        disabled={salvando}
        accessibilityRole="button"
        accessibilityState={{ busy: salvando, disabled: salvando }}
      >
        {salvando ? (
          <ActivityIndicator color={cores.textoPrimaria} />
        ) : (
          <Text style={styles.botaoTexto}>Concluir atividade</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.fundo },
    content: { padding: 25, paddingBottom: 40, gap: 20 },
    cabecalho: { flexDirection: 'row', alignItems: 'center' },
    icone: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    info: { flex: 1 },
    titulo: { fontSize: f(24), fontWeight: 'bold', color: c.texto },
    subtitulo: { fontSize: f(14), color: c.textoSuave, marginTop: 4 },
    aviso: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.superficie,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 16,
    },
    avisoTexto: { flex: 1, fontSize: f(15), color: c.texto },
    erro: { fontSize: f(14), color: c.perigo },
    botao: {
      backgroundColor: c.primaria,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
    },
    botaoTexto: { color: c.textoPrimaria, fontSize: f(15), fontWeight: 'bold' },
    desabilitado: { opacity: 0.7 },
    vazio: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: 25,
      backgroundColor: c.fundo,
    },
    vazioTexto: { fontSize: f(16), color: c.texto },
  });
