import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppShell from '../../components/appshell';
import React from 'react';

type ProjetosScreenProps = {
    id: string;
    titulo: string;
    data: string;
    curtidas: number;
    cometarios: number;
    icone: keyof typeof Ionicons.glyphMap;
    corFundo: string;
}

const PROJETOS: ProjetosScreenProps[] = [
    {id: '1', titulo: 'Meu Primeiro Projeto', data: '2024-11-01', curtidas: 10, cometarios: 5, icone: 'game-controller', corFundo: '#7C6FF0'},
    {id: '2', titulo: 'Animação de gato', data: '2023-02-01', curtidas: 20, cometarios: 10, icone: 'paw', corFundo: '#8F7DF5'},
    {id: '3', titulo: 'Quiz de Matematica', data: '2023-03-01', curtidas: 30, cometarios: 15, icone: 'calculator', corFundo: '#9B7BE8'},
]

export default function ProjetosScreen() {
    return (
        <AppShell titulo="Meus Projetos" paginaAtiva="projetos">
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitulo}>Meus Projetos</Text>
                    <TouchableOpacity style={styles.novoProjetoButton}>
                        <Ionicons name="code-slash" size={16} color="#fff" />
                        <Text style={styles.novoProjetoText}>Novo Projeto</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    {PROJETOS.map((projeto) => (
                       <ProjetoCard key={projeto.id} projeto={projeto} />
                    ))}
                </View>
            </ScrollView>
        </AppShell>
    );
}


function ProjetoCard({ projeto }: { projeto: ProjetosScreenProps }) {
    return (
        <View style={styles.card}>
            <View style={[styles.cardImagem, { backgroundColor: projeto.corFundo }]}>
                <Ionicons name={projeto.icone} size={48} color="#fff" />
            </View>
            <View style={styles.cardAcoes}>
                <View style={styles.acaoItem}>
                    <Ionicons name="thumbs-up-outline" size={16} color="#757575" />
                    <Text style={styles.acaoTexto}>{projeto.curtidas}</Text>
                </View>
                <View style={styles.acaoItem}>
                    <Ionicons name="chatbubble-outline" size={16} color="#757575" />
                    <Text style={styles.acaoTexto}>{projeto.cometarios}</Text>
                </View>
                 <TouchableOpacity style={styles.acaoItem}>
                    <Ionicons name="share-social-outline" size={16} color="#757575" />
                </TouchableOpacity>
            </View>
        </View>
    );
}


const BLUE = '#2563EB';
 
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { 
    padding: 25, 
    paddingBottom: 40 
},
 
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitulo: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  novoProjetoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BLUE,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  novoProjetoText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
 
  card: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden', 
  },
  cardImagem: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { padding: 14 },
  cardTitulo: { fontWeight: 'bold', fontSize: 15, color: '#212121', marginBottom: 4 },
  cardData: { color: '#757575', fontSize: 13, marginBottom: 10 },
  cardAcoes: { flexDirection: 'row', gap: 14 },
  acaoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  acaoTexto: { color: '#757575', fontSize: 13 },
});