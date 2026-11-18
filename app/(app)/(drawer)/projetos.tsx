
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';

type Projeto = {
  id: string;
  titulo: string;
  data: string;
  curtidas: number;
  comentarios: number;
  icone: keyof typeof Ionicons.glyphMap;
  corFundo: string;
};

const PROJETOS: Projeto[] = [
  {
    id: '1',
    titulo: 'Meu Primeiro Projeto',
    data: '2024-11-01',
    curtidas: 10,
    comentarios: 5,
    icone: 'game-controller',
    corFundo: '#7C6FF0',
  },
  {
    id: '2',
    titulo: 'Animação de gato',
    data: '2023-02-01',
    curtidas: 20,
    comentarios: 10,
    icone: 'paw',
    corFundo: '#8F7DF5',
  },
  {
    id: '3',
    titulo: 'Quiz de Matemática',
    data: '2023-03-01',
    curtidas: 30,
    comentarios: 15,
    icone: 'calculator',
    corFundo: '#9B7BE8',
  },
];

export default function ProjetosScreen() {
  const { cores, fonte } = useConfiguracao();
  const styles = criarEstilos(cores, fonte);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.headerTextoContainer}>
          <Text style={styles.headerTitulo}>
            Meus Projetos
          </Text>

          <Text style={styles.headerSubtitulo}>
            Suas ideias ganham vida aqui!
          </Text>
        </View>

        <TouchableOpacity
          style={styles.novoProjetoButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Criar novo projeto"
        >
          <Ionicons
            name="add"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* Cartão de destaque */}
      <View style={styles.resumoCard}>
        <View style={styles.resumoTopo}>
          <View style={styles.resumoIcone}>
            <Ionicons
              name="folder-open"
              size={25}
              color={cores.primaria}
            />
          </View>

          <View style={styles.resumoEtiqueta}>
            <Text style={styles.resumoEtiquetaTexto}>
              GALERIA
            </Text>
          </View>
        </View>

        <Text style={styles.resumoTitulo}>
          Seu espaço criativo!
        </Text>

        <Text style={styles.resumoTexto}>
          Você já criou {PROJETOS.length} projetos.
          Continue explorando e criando coisas incríveis!
        </Text>

        <View style={styles.resumoRodape}>
          <View style={styles.resumoNumeroContainer}>
            <Ionicons
              name="layers"
              size={18}
              color={cores.textoPrimaria}
            />

            <Text style={styles.resumoNumero}>
              {PROJETOS.length}
            </Text>

            <Text style={styles.resumoNumeroTexto}>
              projetos
            </Text>
          </View>

          <Ionicons
            name="sparkles"
            size={27}
            color={cores.textoPrimaria}
          />
        </View>
      </View>

      {/* Cabeçalho da galeria */}
      <View style={styles.projetosHeader}>
        <View>
          <Text style={styles.projetosTitulo}>
            Minha galeria
          </Text>

          <Text style={styles.projetosSubtitulo}>
            Explore suas criações
          </Text>
        </View>

        <TouchableOpacity
          style={styles.filtroButton}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={cores.primaria}
          />

          <Text style={styles.filtroTexto}>
            Todos
          </Text>

          <Ionicons
            name="chevron-down"
            size={14}
            color={cores.primaria}
          />
        </TouchableOpacity>
      </View>

      {/* Galeria de projetos */}
      <View style={styles.grid}>
        {PROJETOS.map((projeto) => (
          <ProjetoCard
            key={projeto.id}
            projeto={projeto}
            styles={styles}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function formatarData(data: string) {
  const partes = data.split('-');

  if (partes.length !== 3) {
    return data;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

function ProjetoCard({
  projeto,
  styles,
}: {
  projeto: Projeto;
  styles: ReturnType<typeof criarEstilos>;
}) {
  return (
    <View style={styles.card}>
      {/* Capa do projeto */}
      <View
        style={[
          styles.cardImagem,
          { backgroundColor: projeto.corFundo },
        ]}
      >
        <View style={styles.cardImagemDecoracao}>
          <Ionicons
            name="shapes"
            size={90}
            color="rgba(255,255,255,0.10)"
          />
        </View>

        <View style={styles.iconeProjeto}>
          <Ionicons
            name={projeto.icone}
            size={38}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.tagProjeto}>
          <Ionicons
            name="code-slash"
            size={12}
            color="#FFFFFF"
          />

          <Text style={styles.tagTexto}>
            Projeto
          </Text>
        </View>

        <TouchableOpacity
          style={styles.opcoesProjeto}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Mais opções do projeto"
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={21}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* Informações */}
      <View style={styles.cardInfo}>
        <Text
          style={styles.cardTitulo}
          numberOfLines={2}
        >
          {projeto.titulo}
        </Text>

        <View style={styles.dataContainer}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={styles.cardData.color as string}
          />

          <Text style={styles.cardData}>
            {formatarData(projeto.data)}
          </Text>
        </View>

        <View style={styles.divisor} />

        {/* Interações */}
        <View style={styles.cardAcoes}>
          <View style={styles.acaoItem}>
            <Ionicons
              name="heart"
              size={17}
              color="#EF6B85"
            />

            <Text style={styles.acaoTexto}>
              {projeto.curtidas}
            </Text>
          </View>

          <View style={styles.acaoItem}>
            <Ionicons
              name="chatbubble"
              size={16}
              color="#8B7AE8"
            />

            <Text style={styles.acaoTexto}>
              {projeto.comentarios}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.compartilhar}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Compartilhar projeto"
          >
            <Ionicons
              name="share-social-outline"
              size={18}
              color={styles.corPrimaria.color as string}
            />
          </TouchableOpacity>
        </View>

        {/* Abrir projeto */}
        <TouchableOpacity
          style={styles.abrirButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${projeto.titulo}`}
        >
          <Text style={styles.abrirTexto}>
            Abrir projeto
          </Text>

          <Ionicons
            name="arrow-forward"
            size={17}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function criarEstilos(
  c: Cores,
  fonte: (tamanho: number) => number,
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.fundo,
    },

    content: {
      padding: 20,
      paddingBottom: 45,
    },

    // Cabeçalho
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 23,
    },

    headerTextoContainer: {
      flex: 1,
      marginRight: 12,
    },

    headerTitulo: {
      fontSize: fonte(24),
      fontWeight: 'bold',
      color: c.texto,
    },

    headerSubtitulo: {
      fontSize: fonte(13),
      color: c.textoSuave,
      marginTop: 4,
    },

    novoProjetoButton: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 4,
      borderBottomColor: 'rgba(0,0,0,0.18)',
    },

    // Resumo
    resumoCard: {
      backgroundColor: c.primaria,
      borderRadius: 23,
      padding: 20,
      marginBottom: 28,
    },

    resumoTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 17,
    },

    resumoIcone: {
      width: 49,
      height: 49,
      borderRadius: 16,
      backgroundColor: c.caixaSobrePrimaria,
      alignItems: 'center',
      justifyContent: 'center',
    },

    resumoEtiqueta: {
      backgroundColor: c.caixaSobrePrimaria,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 9,
    },

    resumoEtiquetaTexto: {
      color: c.textoPrimaria,
      fontSize: fonte(10),
      fontWeight: 'bold',
      letterSpacing: 1,
    },

    resumoTitulo: {
      fontSize: fonte(21),
      fontWeight: 'bold',
      color: c.textoPrimaria,
    },

    resumoTexto: {
      fontSize: fonte(13),
      color: c.textoPrimaria,
      opacity: 0.9,
      marginTop: 6,
      lineHeight: fonte(19),
    },

    resumoRodape: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 19,
    },

    resumoNumeroContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.caixaSobrePrimaria,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 12,
    },

    resumoNumero: {
      color: c.textoPrimaria,
      fontSize: fonte(17),
      fontWeight: 'bold',
    },

    resumoNumeroTexto: {
      color: c.textoPrimaria,
      fontSize: fonte(12),
    },

    // Galeria
    projetosHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },

    projetosTitulo: {
      fontSize: fonte(20),
      fontWeight: 'bold',
      color: c.texto,
    },

    projetosSubtitulo: {
      fontSize: fonte(12),
      color: c.textoSuave,
      marginTop: 3,
    },

    filtroButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 11,
      paddingVertical: 9,
      backgroundColor: c.superficie,
      borderWidth: 1,
      borderColor: c.borda,
      borderRadius: 12,
    },

    filtroTexto: {
      fontSize: fonte(12),
      color: c.primaria,
      fontWeight: 'bold',
    },

    // Grid responsivo
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
    },

    // Cartão do projeto
    card: {
      flexBasis: '47%',
      flexGrow: 1,
      minWidth: 145,
      maxWidth: '100%',
      backgroundColor: c.superficie,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: c.borda,
      overflow: 'hidden',
    },

    cardImagem: {
      height: 130,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    },

    cardImagemDecoracao: {
      position: 'absolute',
      right: -18,
      bottom: -25,
      transform: [{ rotate: '-15deg' }],
    },

    iconeProjeto: {
      width: 70,
      height: 70,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.20)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    tagProjeto: {
      position: 'absolute',
      top: 10,
      left: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 9,
      paddingVertical: 6,
      backgroundColor: 'rgba(0,0,0,0.17)',
      borderRadius: 9,
    },

    tagTexto: {
      color: '#FFFFFF',
      fontSize: fonte(10),
      fontWeight: 'bold',
    },

    opcoesProjeto: {
      position: 'absolute',
      top: 9,
      right: 9,
      width: 31,
      height: 31,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.17)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Informações
    cardInfo: {
      padding: 13,
    },

    cardTitulo: {
      fontSize: fonte(14),
      fontWeight: 'bold',
      color: c.texto,
      minHeight: fonte(36),
    },

    dataContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 7,
      marginBottom: 12,
    },

    cardData: {
      color: c.textoSuave,
      fontSize: fonte(11),
    },

    divisor: {
      height: 1,
      backgroundColor: c.borda,
      marginBottom: 12,
    },

    // Interações
    cardAcoes: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    acaoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    acaoTexto: {
      color: c.textoSuave,
      fontSize: fonte(12),
      fontWeight: '600',
    },

    compartilhar: {
      marginLeft: 'auto',
      width: 31,
      height: 31,
      borderRadius: 10,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    corPrimaria: {
      color: c.primaria,
    },

    // Botão abrir
    abrirButton: {
      marginTop: 13,
      paddingVertical: 11,
      paddingHorizontal: 8,
      borderRadius: 11,
      backgroundColor: c.primaria,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 7,
    },

    abrirTexto: {
      color: '#FFFFFF',
      fontSize: fonte(12),
      fontWeight: 'bold',
    },
  });
}
