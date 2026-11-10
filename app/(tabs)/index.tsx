import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppShell from '../../components/appshell';
import { Cores, useConfiguracao} from '../../context/ConfiguracaoContext';
import React from 'react';

export default function HomeScreen() {
  const {cores, fonte} = useConfiguracao();
  const styles = criarEstilos(cores, fonte);

  return (
    <AppShell titulo="Início" paginaAtiva="inicio">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.greetingCard}>
          <Text style={styles.greeting}>Olá, Maria Silva! 👋</Text>
          <Text style={styles.greetingSubtitle}>Continue sua jornada de programação!</Text>
          <View style={styles.statsRow}>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>1250</Text>
              <Text style={styles.statLabel}>Pontos</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statValue}>Nível 5</Text>
              <Text style={styles.statLabel}>Progresso</Text>
            </View>
          </View>
        </View>

        <View style={styles.trilhaSection}>
          <View style={styles.trilhaHeader}>
            <Ionicons name="book" size={20} color="#212121" />
            <Text style={styles.trilhaTitle}>Sua Trilha de Aprendizado</Text>
          </View>
          <TrilhaCard styles={styles} numero={1} titulo="Comandos Básicos" info="8 módulos · Iniciante" progresso={100} />
          <TrilhaCard styles={styles} numero={2} titulo="Repetições e Loops" info="6 módulos · Iniciante" progresso={60} />
        </View>
      </ScrollView>
    </AppShell>
  );
}

function TrilhaCard({ numero, titulo, info, progresso, styles }: { numero: number; titulo: string; info: string; progresso: number; styles: ReturnType<typeof criarEstilos> }) {
  return (
    <View style={styles.trilhaCard}>
      <View style={styles.trilhaCardTop}>
        <View style={styles.trilhaNumero}>
          <Text style={styles.trilhaNumeroText}>{numero}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.trilhaCardTitulo}>{titulo}</Text>
          <Text style={styles.trilhaCardInfo}>{info}</Text>
        </View>
        <Text style={styles.trilhaCardProgresso}>{progresso}%</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progresso}%` }]} />
      </View>
    </View>
  );
}


const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.fundo },
    content: { padding: 25, paddingBottom: 40 },

    greetingCard: { backgroundColor: c.primaria, borderRadius: 20, padding: 24, marginBottom: 20 },
    greeting: { fontSize: f(22), fontWeight: 'bold', color: c.textoPrimaria },
    greetingSubtitle: { fontSize: f(14), color: c.textoPrimaria, marginTop: 4, marginBottom: 20 },
    statsRow: { flexDirection: 'row', gap: 12 },
    statBox: {
      backgroundColor: c.caixaSobrePrimaria,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flex: 1,
    },
    statValue: { color: c.textoPrimaria, fontSize: f(20), fontWeight: 'bold' },
    statLabel: { color: c.textoPrimaria, fontSize: f(13), marginTop: 2 },

    trilhaSection: {
      backgroundColor: c.superficie,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 20,
      marginBottom: 20,
    },
    trilhaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    trilhaTitle: { fontSize: f(18), fontWeight: 'bold', color: c.texto },

    trilhaCard: { backgroundColor: c.iconeFundo, borderRadius: 14, padding: 16, marginBottom: 12 },
    trilhaCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    trilhaNumero: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    trilhaNumeroText: { color: c.textoPrimaria, fontWeight: 'bold', fontSize: f(14) },
    trilhaCardTitulo: { fontWeight: 'bold', fontSize: f(15), color: c.texto },
    trilhaCardInfo: { color: c.textoSuave, fontSize: f(13), marginTop: 2 },
    trilhaCardProgresso: { fontWeight: 'bold', color: c.primaria, fontSize: f(15) },
    progressBarBg: { height: 6, backgroundColor: c.primariaClara, borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: c.primaria },
  });