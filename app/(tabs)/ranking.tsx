import {View,Text,StyleSheet,ScrollView,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppShell from '../../components/appshell';
import { useConfiguracao, type Cores } from '../../context/ConfiguracaoContext';
import React from 'react';

const PURPLE = '#673AB7';

type Jogador = {
    posicao: number;
    nome: string;
    pontos: number;
    voce?: boolean;
};

const jogadores: Jogador[] = [
    {
        posicao: 1,
        nome: 'Pedro Santos',
        pontos: 2100,
    },
    {
        posicao: 2,
        nome: 'João Oliveira',
        pontos: 1850,
    },
    {
        posicao: 3,
        nome: 'Maria Silva',
        pontos: 1250,
        voce: true,
    },
    {
        posicao: 4,
        nome: 'Ana Costa',
        pontos: 1100,
    },
    {
        posicao: 5,
        nome: 'Carlos Souza',
        pontos: 980,
    },
    {
        posicao: 6,
        nome: 'Lucas Almeida',
        pontos: 850,
    },
];

export default function RankingScreen() {
       const { cores, fonte } = useConfiguracao();
        const styles = criarEstilos(cores, fonte);

    return (
        <AppShell titulo="Ranking" paginaAtiva="ranking">

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >

                {/* CABEÇALHO */}

                <View style={styles.headerRanking}>

                    <View style={styles.trofeuHeader}>
                        <Ionicons
                            name="trophy"
                            size={26}
                            color="#FFFFFF"
                        />
                    </View>

                    <View style={styles.headerInfo}>

                        <Text style={styles.tituloRanking}>
                            Ranking semanal
                        </Text>

                        <Text style={styles.subtituloRanking}>
                            Veja como você está se saindo!
                        </Text>

                    </View>

                </View>


                {/* CARD DA LIGA */}

                <View style={styles.ligaCard}>

                    <View style={styles.ligaTopo}>

                        <View style={styles.ligaIcone}>
                            <Ionicons
                                name="trophy"
                                size={22}
                                color="#F59E0B"
                            />
                        </View>

                        <View style={styles.ligaInfo}>

                            <Text style={styles.ligaTitulo}>
                                Liga da Semana
                            </Text>

                            <Text style={styles.ligaTexto}>
                                Continue ganhando XP!
                            </Text>

                        </View>

                        <Text style={styles.ligaPosicao}>
                            3º de 6
                        </Text>

                    </View>


                    {/* PROGRESSO */}

                    <View style={styles.progressoFundo}>
                        <View style={styles.progresso} />
                    </View>

                </View>


                {/* TÍTULO DA LISTA */}

                <Text style={styles.listaTitulo}>
                    Classificação
                </Text>


                {/* LISTA */}

                <View style={styles.lista}>

                    {jogadores.map((jogador) => (

                        <View
                            key={jogador.posicao}
                            style={[
                                styles.jogador,
                                jogador.voce && styles.jogadorVoce,
                            ]}
                        >

                            {/* POSIÇÃO */}

                            <View style={styles.posicaoContainer}>

                                {jogador.posicao === 1 ? (
                                    <Ionicons
                                        name="medal"
                                        size={24}
                                        color="#F59E0B"
                                    />
                                ) : jogador.posicao === 2 ? (
                                    <Ionicons
                                        name="medal"
                                        size={24}
                                        color="#94A3B8"
                                    />
                                ) : jogador.posicao === 3 ? (
                                    <Ionicons
                                        name="medal"
                                        size={24}
                                        color="#CD7F32"
                                    />
                                ) : (
                                    <Text style={styles.posicao}>
                                        {jogador.posicao}
                                    </Text>
                                )}

                            </View>


                            {/* AVATAR */}

                            <View
                                style={[
                                    styles.avatar,
                                    jogador.voce && styles.avatarVoce,
                                ]}
                            >

                                <Ionicons
                                    name="person"
                                    size={23}
                                    color={
                                        jogador.voce
                                            ? PURPLE
                                            : '#64748B'
                                    }
                                />

                            </View>


                            {/* NOME */}

                            <View style={styles.infoJogador}>

                                <View style={styles.nomeLinha}>

                                    <Text
                                        style={[
                                            styles.nome,
                                            jogador.voce &&
                                                styles.nomeVoce,
                                        ]}
                                    >
                                        {jogador.nome}
                                    </Text>

                                    {jogador.voce && (
                                        <View style={styles.voceBadge}>
                                            <Text style={styles.voceTexto}>
                                                Você
                                            </Text>
                                        </View>
                                    )}

                                </View>

                                <Text style={styles.pontos}>
                                    {jogador.pontos} XP
                                </Text>

                            </View>


                            {/* SETA */}

                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color="#CBD5E1"
                            />

                        </View>

                    ))}

                </View>


                {/* MENSAGEM FINAL */}

                <View style={styles.mensagem}>

                    <Ionicons
                        name="sparkles"
                        size={21}
                        color="#F59E0B"
                    />

                    <Text style={styles.mensagemTexto}>
                        Continue aprendendo para subir no ranking!
                    </Text>

                </View>

            </ScrollView>

        </AppShell>
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

    headerRanking: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.superficie,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 18,
      marginBottom: 20,
    },
    trofeuHeader: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    headerInfo: { flex: 1 },
    tituloRanking: { fontSize: f(22), fontWeight: 'bold', color: c.texto },
    subtituloRanking: { fontSize: f(14), color: c.textoSuave, marginTop: 4 },

    ligaCard: {
      backgroundColor: c.superficie,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 18,
      marginBottom: 20,
    },
    ligaTopo: { flexDirection: 'row', alignItems: 'center' },
    ligaIcone: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: c.primariaClara,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ligaInfo: { flex: 1, marginLeft: 12 },
    ligaTitulo: { fontWeight: 'bold', fontSize: f(16), color: c.texto },
    ligaTexto: { fontSize: f(13), color: c.textoSuave, marginTop: 2 },
    ligaPosicao: { fontWeight: 'bold', color: c.primaria, fontSize: f(16) },
    progressoFundo: {
      height: 10,
      backgroundColor: c.primariaClara,
      borderRadius: 999,
      overflow: 'hidden',
      marginTop: 18,
    },
    progresso: { width: '60%', height: '100%', backgroundColor: c.primaria, borderRadius: 999 },

    listaTitulo: { fontSize: f(18), fontWeight: 'bold', color: c.texto, marginBottom: 12 },
    lista: { gap: 12 },
    jogador: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.superficie,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 14,
    },
    jogadorVoce: {
      backgroundColor: c.caixaSobrePrimaria,
      borderColor: c.primariaClara,
    },
    posicaoContainer: { width: 30, alignItems: 'center', justifyContent: 'center' },
    posicao: {
      fontSize: f(14),
      fontWeight: 'bold',
      color: c.texto,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 12,
    },
    avatarVoce: { backgroundColor: c.primariaClara },
    infoJogador: { flex: 1 },
    nomeLinha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    nome: { fontSize: f(15), fontWeight: 'bold', color: c.texto },
    nomeVoce: { color: c.primaria },
    voceBadge: {
      backgroundColor: c.primariaClara,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    voceTexto: { fontSize: f(11), fontWeight: 'bold', color: c.primaria },
    pontos: { fontSize: f(13), color: c.textoSuave, marginTop: 3 },

    mensagem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.caixaSobrePrimaria,
      borderRadius: 12,
      padding: 14,
      marginTop: 20,
    },
    mensagemTexto: { fontSize: f(14), color: c.texto, flexShrink: 1 },
  });