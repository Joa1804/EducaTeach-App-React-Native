
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BarraProgresso,
  Botao,
  Cartao,
  Etiqueta,
} from '@/components/ui';

import { FONTES } from '@/constants/fontes';
import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { useUsuario } from '@/context/UsuarioContext';
import { useTrilha } from '@/hooks/use-trilha';
import { escurecer } from '@/lib/cores';
import type { EtapaTrilha } from '@/lib/licoes/trilha';

const ROTULO_STATUS: Readonly<Record<EtapaTrilha['status'], string>> = {
  concluida: 'Concluída',
  disponivel: 'Disponível',
  bloqueada: 'Bloqueada',
};

export default function HomeScreen() {
  const { cores, fonte, altoContraste } = useConfiguracao();

  const styles = criarEstilos(cores, fonte, altoContraste);

  const { usuario } = useUsuario();
  const router = useRouter();

  const { etapas, concluidas, total, carregando } = useTrilha();

  const primeiroNome = usuario?.nome.trim().split(/\s+/)[0] ?? '';

  // Próxima lição disponível
  const proxima = etapas.find((etapa) => etapa.status === 'disponivel');

  // Degradê adaptado à configuração de acessibilidade
  const degrade: [string, string] = altoContraste
    ? [cores.primaria, cores.primaria]
    : [cores.primaria, escurecer(cores.primaria, 0.3)];

  const corIconeStat = altoContraste
    ? cores.textoPrimaria
    : cores.estrela;

  function abrirLicao(id: string) {
    router.push({
      pathname: '/atividades/[id]',
      params: { id },
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Banner de boas-vindas */}
      <View style={styles.greetingBase}>
        <LinearGradient
          colors={degrade}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.greetingCard}
        >
          <View style={styles.greetingTop}>
            <View style={styles.greetingTextContainer}>
              <Text style={styles.greeting}>
                Olá{primeiroNome ? `, ${primeiroNome}` : ''}! 👋
              </Text>

              <Text style={styles.greetingSubtitle}>
                Que tal aprender algo novo hoje?
              </Text>
            </View>

            <View style={styles.greetingIcon}>
              <Ionicons
                name="school"
                size={34}
                color={cores.textoPrimaria}
              />
            </View>
          </View>

          {/* Estatísticas do aluno */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons
                name="star"
                size={20}
                color={corIconeStat}
              />

              <Text style={styles.statValue}>
                {usuario?.pontos ?? 0}
              </Text>

              <Text style={styles.statLabel}>Pontos</Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons
                name="wallet"
                size={20}
                color={corIconeStat}
              />

              <Text style={styles.statValue}>
                {usuario?.moedas ?? 0}
              </Text>

              <Text style={styles.statLabel}>Moedas</Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons
                name="book"
                size={20}
                color={corIconeStat}
              />

              <Text style={styles.statValue}>
                {carregando ? '…' : `${concluidas}/${total}`}
              </Text>

              <Text
                style={styles.statLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Lições
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Botão para continuar aprendendo */}
      {proxima && (
        <Botao
          titulo={`Continuar: ${proxima.licao.titulo}`}
          icone="play"
          variante="sucesso"
          onPress={() => abrirLicao(proxima.licao.id)}
          estilo={styles.botaoContinuar}
        />
      )}

      {/* Cabeçalho da jornada */}
      <View style={styles.sectionHeading}>
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIcon}>
            <Ionicons
              name="map"
              size={22}
              color={cores.primaria}
            />
          </View>

          <View>
            <Text style={styles.sectionTitle}>
              Sua jornada
            </Text>

            <Text style={styles.sectionSubtitle}>
              Continue de onde parou!
            </Text>
          </View>
        </View>

        <Etiqueta texto={`${concluidas}/${total}`} />
      </View>

      {/* Progresso geral da jornada */}
      {total > 0 && (
        <BarraProgresso
          valor={concluidas / total}
          segmentos={Math.min(total, 10)}
          rotulo={`Jornada: ${concluidas} de ${total} lições concluídas`}
          estilo={styles.barraJornada}
        />
      )}

      {/* Lista de lições */}
      <View style={styles.trilhaSection}>
        {etapas.map((etapa) => (
          <TrilhaCard
            key={etapa.licao.id}
            etapa={etapa}
            styles={styles}
            cores={cores}
            onPress={() => abrirLicao(etapa.licao.id)}
          />
        ))}

        {!carregando && etapas.length === 0 && (
          <Cartao estilo={styles.emptyState}>
            <Ionicons
              name="book-outline"
              size={42}
              color={cores.textoSuave}
            />

            <Text style={styles.emptyTitle}>
              Sua jornada está começando!
            </Text>

            <Text style={styles.emptySubtitle}>
              As lições aparecerão aqui quando estiverem disponíveis.
            </Text>
          </Cartao>
        )}
      </View>
    </ScrollView>
  );
}

type PropsTrilhaCard = {
  etapa: EtapaTrilha;
  onPress: () => void;
  styles: ReturnType<typeof criarEstilos>;
  cores: Cores;
};

function TrilhaCard({
  etapa,
  onPress,
  styles,
  cores,
}: PropsTrilhaCard) {
  const { licao, indice, status, estrelas } = etapa;

  const bloqueada = status === 'bloqueada';
  const concluida = status === 'concluida';

  const progresso = Math.round((estrelas / 3) * 100);

  const info = `${licao.exercicios.length} exercícios`;

  const corStatus = concluida
    ? cores.sucesso
    : bloqueada
      ? cores.textoSuave
      : cores.primaria;

  return (
    <Pressable
      onPress={onPress}
      disabled={bloqueada}
      accessibilityRole="button"
      accessibilityLabel={`${licao.titulo}, ${info} · ${ROTULO_STATUS[status]}, ${estrelas} de 3 estrelas`}
      accessibilityState={{ disabled: bloqueada }}
      style={({ pressed }) =>
        pressed && !bloqueada
          ? styles.trilhaCardPressed
          : undefined
      }
    >
      <Cartao
        destaque={status === 'disponivel'}
        estilo={styles.trilhaCard}
      >
        <View style={styles.trilhaCardTop}>
          <View
            style={[
              styles.trilhaNumero,
              concluida && styles.trilhaNumeroConcluido,
              bloqueada && styles.trilhaNumeroBloqueado,
            ]}
          >
            <Ionicons
              name={
                concluida
                  ? 'checkmark'
                  : bloqueada
                    ? 'lock-closed'
                    : 'play'
              }
              size={19}
              color={
                bloqueada
                  ? cores.textoSuave
                  : cores.textoPrimaria
              }
            />
          </View>

          <View style={styles.trilhaCardText}>
            <Text
              style={[
                styles.trilhaCardTitulo,
                bloqueada && styles.textoBloqueado,
              ]}
              numberOfLines={2}
            >
              {licao.titulo}
            </Text>

            <Text style={styles.trilhaCardInfo}>
              Etapa {indice + 1} · {info}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={cores.textoSuave}
          />
        </View>

        <View style={styles.trilhaCardFooter}>
          <View style={styles.trilhaStatus}>
            <Etiqueta
              texto={ROTULO_STATUS[status]}
              cor={corStatus}
            />
          </View>

          <View style={styles.estrelas}>
            {[1, 2, 3].map((estrela) => (
              <Ionicons
                key={estrela}
                name={
                  estrela <= estrelas
                    ? 'star'
                    : 'star-outline'
                }
                size={17}
                color={
                  estrela <= estrelas
                    ? cores.estrela
                    : cores.textoSuave
                }
              />
            ))}
          </View>
        </View>

        {/* Progresso individual da lição */}
        <BarraProgresso
          valor={estrelas / 3}
          segmentos={3}
          rotulo={`Progresso da lição: ${progresso}%`}
        />
      </Cartao>
    </Pressable>
  );
}

const criarEstilos = (
  c: Cores,
  f: (tamanho: number) => number,
  altoContraste: boolean,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.fundo,
    },

    content: {
      padding: 20,
      paddingBottom: 40,
    },

    // Banner de boas-vindas
    greetingBase: {
      borderRadius: 24,
      backgroundColor: altoContraste
        ? c.primaria
        : escurecer(c.primaria, 0.35),
      paddingBottom: 5,
      marginBottom: 20,
    },

    greetingCard: {
      borderRadius: 24,
      padding: 22,
    },

    greetingTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },

    greetingTextContainer: {
      flex: 1,
      marginRight: 12,
    },

    greeting: {
      fontSize: f(24),
      fontFamily: FONTES.titulo,
      color: c.textoPrimaria,
    },

    greetingSubtitle: {
      fontSize: f(14),
      fontFamily: FONTES.texto,
      color: c.textoPrimaria,
      marginTop: 5,
    },

    greetingIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: c.caixaSobrePrimaria,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Estatísticas
    statsRow: {
      flexDirection: 'row',
      gap: 10,
    },

    statBox: {
      flex: 1,
      backgroundColor: c.caixaSobrePrimaria,
      borderRadius: 16,
      paddingVertical: 13,
      paddingHorizontal: 8,
      alignItems: 'center',
      gap: 4,
    },

    statValue: {
      color: c.textoPrimaria,
      fontSize: f(19),
      fontFamily: FONTES.destaque,
    },

    statLabel: {
      color: c.textoPrimaria,
      fontSize: f(12),
      fontFamily: FONTES.texto,
    },

    botaoContinuar: {
      marginBottom: 28,
    },

    // Cabeçalho da jornada
    sectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },

    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    sectionIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    sectionTitle: {
      fontSize: f(19),
      fontFamily: FONTES.titulo,
      color: c.texto,
    },

    sectionSubtitle: {
      fontSize: f(13),
      fontFamily: FONTES.texto,
      color: c.textoSuave,
      marginTop: 2,
    },

    barraJornada: {
      marginBottom: 16,
    },

    // Lista de lições
    trilhaSection: {
      gap: 12,
    },

    trilhaCard: {
      gap: 14,
    },

    trilhaCardPressed: {
      transform: [{ translateY: 3 }],
    },

    trilhaCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    trilhaNumero: {
      width: 43,
      height: 43,
      borderRadius: 15,
      backgroundColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
    },

    trilhaNumeroConcluido: {
      backgroundColor: c.sucesso,
    },

    trilhaNumeroBloqueado: {
      backgroundColor: c.iconeFundo,
    },

    trilhaCardText: {
      flex: 1,
    },

    trilhaCardTitulo: {
      fontSize: f(16),
      fontFamily: FONTES.titulo,
      color: c.texto,
    },

    textoBloqueado: {
      color: c.textoSuave,
    },

    trilhaCardInfo: {
      fontSize: f(12),
      fontFamily: FONTES.texto,
      color: c.textoSuave,
      marginTop: 4,
    },

    trilhaCardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    trilhaStatus: {
      flex: 1,
      alignItems: 'flex-start',
    },

    estrelas: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },

    // Estado vazio
    emptyState: {
      padding: 28,
      alignItems: 'center',
      gap: 10,
    },

    emptyTitle: {
      fontSize: f(17),
      fontFamily: FONTES.titulo,
      color: c.texto,
      textAlign: 'center',
    },

    emptySubtitle: {
      fontSize: f(13),
      fontFamily: FONTES.texto,
      color: c.textoSuave,
      textAlign: 'center',
      lineHeight: f(20),
    },
  });
