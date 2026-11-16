import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { LicaoPlayer } from '@/components/atividades/LicaoPlayer';
import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { buscarLicao } from '@/data/licoes';
import { useTrilha } from '@/hooks/use-trilha';
import { idLicaoParamSchema } from '@/lib/licoes/schemas';

type Acesso = 'verificando' | 'liberada' | 'bloqueada';

/**
 * Rota de uma lição. O `id` vem da URL (deep link, web), então é validado com Zod.
 * Antes de abrir, confere no progresso salvo se a lição já foi liberada.
 */
export default function AtividadeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cores, fonte } = useConfiguracao();
  const styles = useMemo(() => criarEstilos(cores, fonte), [cores, fonte]);

  const parametro = idLicaoParamSchema.safeParse(id);
  const licao = parametro.success ? buscarLicao(parametro.data) : null;

  const { etapas, carregando, erro, recarregar } = useTrilha();
  const etapa = licao ? etapas.find((item) => item.licao.id === licao.id) : undefined;
  const anterior = etapa && etapa.indice > 0 ? etapas[etapa.indice - 1] : undefined;

  const acessoAtual: Acesso =
    carregando || erro || !etapa
      ? 'verificando'
      : etapa.status === 'bloqueada'
        ? 'bloqueada'
        : 'liberada';

  // Depois de liberada, a lição fica liberada: recarregar o progresso (ex.: ao
  // voltar o foco para a tela) não pode desmontá-la no meio. Ajuste de estado
  // durante o render, como recomenda a documentação do React.
  const [liberadaUmaVez, setLiberadaUmaVez] = useState(false);
  if (!liberadaUmaVez && acessoAtual === 'liberada') setLiberadaUmaVez(true);
  const acesso: Acesso = liberadaUmaVez ? 'liberada' : acessoAtual;

  const voltar = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/aprender');
    }
  }, [router]);

  if (!licao) {
    return (
      <Aviso
        styles={styles}
        cores={cores}
        titulo="Atividade não encontrada"
        mensagem="Não encontramos essa atividade."
        icone="alert-circle-outline"
        acao="Voltar"
        onAcao={voltar}
      />
    );
  }

  if (acesso === 'liberada') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false, title: licao.titulo }} />
        <LicaoPlayer licao={licao} onSair={voltar} />
      </>
    );
  }

  if (erro) {
    return (
      <Aviso
        styles={styles}
        cores={cores}
        titulo={licao.titulo}
        mensagem={erro}
        icone="cloud-offline-outline"
        acao="Tentar novamente"
        onAcao={recarregar}
      />
    );
  }

  if (acesso === 'bloqueada') {
    return (
      <Aviso
        styles={styles}
        cores={cores}
        titulo={licao.titulo}
        mensagem={
          anterior
            ? `Conclua "${anterior.licao.titulo}" para liberar esta lição.`
            : 'Esta lição ainda está bloqueada.'
        }
        icone="lock-closed"
        acao="Ir para a trilha"
        onAcao={() => router.replace('/aprender')}
      />
    );
  }

  return (
    <View style={styles.centro} accessibilityLabel="Carregando lição">
      <Stack.Screen options={{ title: licao.titulo }} />
      <ActivityIndicator size="large" color={cores.primaria} />
    </View>
  );
}

type PropsAviso = {
  styles: ReturnType<typeof criarEstilos>;
  cores: Cores;
  titulo: string;
  mensagem: string;
  icone: 'alert-circle-outline' | 'cloud-offline-outline' | 'lock-closed';
  acao: string;
  onAcao: () => void;
};

function Aviso({ styles, cores, titulo, mensagem, icone, acao, onAcao }: PropsAviso) {
  return (
    <View style={styles.centro}>
      <Stack.Screen options={{ title: titulo }} />
      <Ionicons name={icone} size={48} color={cores.textoSuave} />
      <Text style={styles.mensagem} accessibilityLiveRegion="polite">
        {mensagem}
      </Text>
      <Pressable style={styles.botao} onPress={onAcao} accessibilityRole="button">
        <Text style={styles.botaoTexto}>{acao}</Text>
      </Pressable>
    </View>
  );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    centro: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      padding: 24,
      backgroundColor: c.fundo,
    },
    mensagem: { fontSize: f(16), color: c.texto, textAlign: 'center' },
    botao: {
      minHeight: 48,
      backgroundColor: c.primaria,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    botaoTexto: { color: c.textoPrimaria, fontSize: f(15), fontWeight: 'bold' },
  });
