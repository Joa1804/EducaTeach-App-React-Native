import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import  Svg, {Path} from 'react-native-svg';
import AppShell from '../../components/appshell';
import { FASES } from '@/data/frase';
import React from 'react';

export default function AprenderScreen() {
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
            />
          ))}

        </View>

      </ScrollView>

    </AppShell>
  );
}

function FaseNode({fase, index}: {fase: typeof FASES[0]; index: number}) {

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

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    padding: 25,
    paddingBottom: 50,
  },

  /* UNIDADE */

  unidadeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 25,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 3,
  },

  unidadeIcone: {
    width: 64,
    height: 64,
    borderRadius: 32,

    backgroundColor: '#EDE7F6',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 16,
  },

  unidadeInfo: {
    flex: 1,
  },

  unidadeTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  unidadeDescricao: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },

  progressoContainer: {
    marginTop: 12,

    flexDirection: 'row',
    alignItems: 'center',
  },

  progressoFundo: {
    height: 8,
    flex: 1,

    backgroundColor: '#E2E8F0',
    borderRadius: 10,

    overflow: 'hidden',
  },

  progresso: {
    width: '40%',
    height: '100%',

    backgroundColor: '#673AB7',
    borderRadius: 10,
  },

  progressoTexto: {
    marginLeft: 10,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  /* TÍTULO */

  tituloContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 10,
  },

  titulo: {
    marginLeft: 8,

    fontSize: 22,
    fontWeight: 'bold',

    color: '#1E293B',
  },

  /* MAPA */

  mapa: {
    height: 900,

    position: 'relative',

    backgroundColor: '#FFFFFF',

    borderRadius: 20,

    overflow: 'hidden',

    paddingVertical: 10,
  },

  caminho: {
    position: 'absolute',

    top: 0,
    left: 0,
  },

  /* FASE */

  faseContainer: {
    position: 'absolute',

    transform: [
      {
        translateX: -45,
      },
    ],

    width: 180,

    alignItems: 'center',
  },

  faseNode: {
    width: 70,
    height: 70,

    borderRadius: 35,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 5,
    borderColor: '#FFFFFF',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,

    elevation: 4,
  },

  faseConcluida: {
    backgroundColor: '#2FA84F',
  },

  faseAtual: {
    backgroundColor: '#673AB7',

    transform: [
      {
        scale: 1.1,
      },
    ],
  },

  faseBloqueada: {
    backgroundColor: '#94A3B8',
  },

  faseInfo: {
    marginTop: 8,

    backgroundColor: '#FFFFFF',

    borderRadius: 10,

    paddingVertical: 7,
    paddingHorizontal: 12,

    alignItems: 'center',

    maxWidth: 170,
  },

  faseTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  faseDescricao: {
    marginTop: 2,

    fontSize: 11,
    color: '#64748B',

    textAlign: 'center',
  },

  estrelas: {
    flexDirection: 'row',

    marginTop: 4,

    gap: 2,
  },

});