import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import  Svg, {Path} from 'react-native-svg';
import AppShell from '../../components/appshell';
import { FASES } from '@/data/frase';
import { useConfiguracao, type Cores } from '../../context/ConfiguracaoContext';
import React from 'react';

export default function AprenderScreen() {

     const { cores, fonte } = useConfiguracao();
   const styles = criarEstilos(cores, fonte);

  return (
    <AppShell titulo="Aprender" paginaAtiva="aprender">
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* CABEÇALHO DA UNIDADE */}
        <View style={styles.unidadeCard}>

          <View style={styles.unidadeIcone}>
            <Ionicons name="code-slash" size={30} color="#673AB7"/>
          </View>

          <View style={styles.unidadeInfo}>

            <Text style={styles.unidadeTitulo}>
              Fundamentos de Programação
            </Text>

            <Text style={styles.unidadeDescricao}>
              Aprenda programação através de desafios!
            </Text>

            <View style={styles.progressoContainer}>

              <View style={styles.progressoFundo}>
                <View style={styles.progresso} />
              </View>

              <Text style={styles.progressoTexto}>
                2 de 5 fases
              </Text>

            </View>

          </View>

        </View>

        {/* TÍTULO */}
        <View style={styles.tituloContainer}>
          <Ionicons name="map" size={24} color="#673AB7" />

          <Text style={styles.titulo}>
            Sua Jornada
          </Text>
        </View>

        {/* MAPA */}
        <View style={styles.mapa}>

          {/* CAMINHO */}
          <Svg width="100%" height="900" viewBox="0 0 400 900" style={styles.caminho}>
            <Path
              d="
                M 200 0
                C 200 0, 200 100, 200 100
                S 200 200, 200 200
                S 200 300, 200 300
                S 200 400, 200 400
                S 200 500, 200 500
                S 200 600, 200 600
                S 200 700, 200 700
                S 200 800, 200 800
                S 200 900, 200 900
              "
              fill="none"
              stroke="#D8CCF2"
              strokeWidth="8"
              strokeLinecap="round"
            />

          </Svg>

          {/* FASES */}
          {FASES.map((fase, index) => (
            <FaseNode
              key={fase.id}
              fase={fase}
              index={index}
              styles={styles}
            />
          ))}

        </View>

      </ScrollView>

    </AppShell>
  );
}

function FaseNode({
  fase,
  index,
  styles,
}: {
  fase: typeof FASES[0];
  index: number;
  styles: ReturnType<typeof criarEstilos>;
}) {

  const posicoes = [
    {top: 40, left: '50%'},
    {top: 205, left: '25%' },
    {top: 375, left: '50%' },
    { top: 545, left: '25%'},
    { top: 715, left: '50%'},
  ];

  const posicao = posicoes[index];

  const bloqueada = fase.status === 'bloqueado';
  const atual = fase.status === 'em-andamento';
  const concluida = fase.status === 'concluido';

  return (
    <TouchableOpacity
      disabled={bloqueada}
      style={[
        styles.faseContainer,
        {
          top: posicao.top,
          left: posicao.left,
        },
      ]}
    >

      {/* CÍRCULO */}
      <View
        style={[
          styles.faseNode,

          concluida && styles.faseConcluida,
          atual && styles.faseAtual,
          bloqueada && styles.faseBloqueada,
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
          size={26}
          color="#FFFFFF"
        />

      </View>

      {/* INFORMAÇÕES */}
      <View style={styles.faseInfo}>

        <Text style={styles.faseTitulo}>
          {fase.titulo}
        </Text>

        <Text style={styles.faseDescricao}>
          {fase.descricao}
        </Text>

        {/* ESTRELAS */}
        {fase.estrelas !== undefined && (
          <View style={styles.estrelas}>

            {[1, 2, 3].map((estrela) => (
              <Ionicons
                key={estrela}
                name={
                  estrela <= fase.estrelas!
                    ? 'star'
                    : 'star-outline'
                }
                size={15}
                color="#F59E0B"
              />
            ))}

          </View>
        )}

      </View>

    </TouchableOpacity>
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

    unidadeCard: {
      flexDirection: 'row',
      backgroundColor: c.superficie,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 18,
      marginBottom: 20,
      alignItems: 'center',
    },
    unidadeIcone: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    unidadeInfo: { flex: 1 },
    unidadeTitulo: { fontSize: f(21), fontWeight: 'bold', color: c.texto, marginBottom: 4 },
    unidadeDescricao: { fontSize: f(14), color: c.textoSuave, marginBottom: 8 },
    progressoContainer: { flexDirection: 'row', alignItems: 'center' },
    progressoFundo: {
      flex: 1,
      height: 8,
      backgroundColor: c.primariaClara,
      borderRadius: 999,
      overflow: 'hidden',
      marginRight: 10,
    },
    progresso: { height: '100%', width: '40%', backgroundColor: c.primaria, borderRadius: 999 },
    progressoTexto: { fontSize: f(12), color: c.textoSuave, fontWeight: '600' },

    tituloContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    titulo: { fontSize: f(18), fontWeight: 'bold', color: c.texto },

    mapa: {
      position: 'relative',
      height: 840,
      marginTop: 8,
    },
    caminho: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    faseContainer: {
      position: 'absolute',
      width: 190,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 2,
    },
    faseNode: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    },
    faseConcluida: { backgroundColor: '#10B981' },
    faseAtual: { backgroundColor: c.primaria },
    faseBloqueada: { backgroundColor: '#B9B9C5' },
    faseInfo: {
      flex: 1,
      marginLeft: 12,
      backgroundColor: c.superficie,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 12,
    },
    faseTitulo: { fontSize: f(15), fontWeight: 'bold', color: c.texto, marginBottom: 2 },
    faseDescricao: { fontSize: f(12), color: c.textoSuave, lineHeight: 16 },
    estrelas: { flexDirection: 'row', marginTop: 8, gap: 2 },
  });