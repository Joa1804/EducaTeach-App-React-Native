
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Cores, useConfiguracao } from '@/context/ConfiguracaoContext';
import { useUsuario } from '@/context/UsuarioContext';
import { useTrilha } from '@/hooks/use-trilha';
import type { EtapaTrilha } from '@/lib/licoes/trilha';

import {
  Etiqueta,
  BarraProgresso,
} from '@/components/ui';

const ROTULO_STATUS: Readonly<Record<EtapaTrilha['status'], string>> = {
  concluida: 'Concluída',
  disponivel: 'Disponível',
  bloqueada: 'Bloqueada',
};

export default function HomeScreen() {
  const { cores, fonte } = useConfiguracao();
  const styles = criarEstilos(cores, fonte);

  const { usuario } = useUsuario();
  const router = useRouter();

  const { etapas, concluidas, total, carregando } = useTrilha();

  const primeiroNome = usuario?.nome.trim().split(/\s+/)[0] ?? '';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho de boas-vindas com degradê */}
      <LinearGradient
        colors={['#6c63ff', '#8b7cf6', '#c4b5fd']}
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
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="star" size={20} color="#FFD45C" />

            <Text style={styles.statValue}>
              {usuario?.pontos ?? 0}
            </Text>

            <Text style={styles.statLabel}>Pontos</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="wallet" size={20} color="#FFD45C" />

            <Text style={styles.statValue}>
              {usuario?.moedas ?? 0}
            </Text>

            <Text style={styles.statLabel}>Moedas</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="book" size={20} color="#FFD45C" />

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

      {/* Resumo da trilha */}
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

      {/* Etapas da trilha */}
      <View style={styles.trilhaSection}>
        {etapas.map((etapa) => (
          <TrilhaCard
            key={etapa.licao.id}
            etapa={etapa}
            styles={styles}
            cores={cores}
            onPress={() =>
              router.push({
                pathname: '/atividades/[id]',
                params: { id: etapa.licao.id },
              })
            }
          />
        ))}

        {!carregando && etapas.length === 0 && (
          <View style={styles.emptyState}>
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
          </View>
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

  const corStatus =
    concluida
      ? cores.sucesso
      : bloqueada
        ? cores.textoSuave
        : cores.primaria;

  return (
    <View style={styles.trilhaCardWrapper}>
      <Pressable
        onPress={onPress}
        disabled={bloqueada}
        accessibilityRole="button"
        accessibilityLabel={`${licao.titulo}, ${info} · ${ROTULO_STATUS[status]}`}
        accessibilityState={{ disabled: bloqueada }}
        style={({ pressed }) => [
          styles.trilhaCard,
          bloqueada && styles.trilhaCardBloqueado,
          pressed && !bloqueada && styles.trilhaCardPressed,
        ]}
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
              color={cores.textoPrimaria}
            />
          </View>

          <View style={styles.trilhaCardText}>
            <Text
              style={styles.trilhaCardTitulo}
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
                name={estrela <= estrelas ? 'star' : 'star-outline'}
                size={17}
                color={
                  estrela <= estrelas
                    ? '#EBAF32'
                    : cores.textoSuave
                }
              />
            ))}
          </View>
        </View>

        <BarraProgresso
          valor={estrelas / 3}
          segmentos={3}
          rotulo={`Progresso da lição: ${progresso}%`}
        />
      </Pressable>
    </View>
  );
}

const criarEstilos = (
  c: Cores,
  f: (tamanho: number) => number
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

    // Cabeçalho com degradê
    greetingCard: {
      borderRadius: 24,
      padding: 22,
      marginBottom: 28,
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
      fontWeight: 'bold',
      color: '#FFFFFF',
    },

    greetingSubtitle: {
      fontSize: f(14),
      color: '#FFFFFF',
      marginTop: 5,
      opacity: 0.95,
    },

    greetingIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.20)',
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
      backgroundColor: 'rgba(255,255,255,0.20)',
      borderRadius: 16,
      paddingVertical: 13,
      paddingHorizontal: 8,
      alignItems: 'center',
      gap: 4,
    },

    statValue: {
      color: '#FFFFFF',
      fontSize: f(19),
      fontWeight: 'bold',
    },

    statLabel: {
      color: '#FFFFFF',
      fontSize: f(12),
    },

    // Cabeçalho da seção
    sectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
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
      fontWeight: 'bold',
      color: c.texto,
    },

    sectionSubtitle: {
      fontSize: f(13),
      color: c.textoSuave,
      marginTop: 2,
    },

    // Trilha
    trilhaSection: {
      gap: 12,
    },

    trilhaCardWrapper: {
      marginBottom: 2,
    },

    trilhaCard: {
      backgroundColor: c.superficie,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 16,
      gap: 15,
    },

    trilhaCardBloqueado: {
      opacity: 0.6,
    },

    trilhaCardPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.985 }],
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
      fontWeight: 'bold',
      color: c.texto,
    },

    trilhaCardInfo: {
      fontSize: f(12),
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
      backgroundColor: c.superficie,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 28,
      alignItems: 'center',
      gap: 10,
    },

    emptyTitle: {
      fontSize: f(17),
      fontWeight: 'bold',
      color: c.texto,
      textAlign: 'center',
    },

    emptySubtitle: {
      fontSize: f(13),
      color: c.textoSuave,
      textAlign: 'center',
      lineHeight: f(20),
    },
  });
