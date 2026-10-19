import {View,Text,StyleSheet,ScrollView,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppShell from '../../components/appshell';
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


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    content: {
        padding: 20,
        paddingBottom: 40,
    },

    headerRanking: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },

    trofeuHeader: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: PURPLE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerInfo: {
        marginLeft: 12,
    },

    tituloRanking: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
    },

    subtituloRanking: {
        marginTop: 3,
        fontSize: 13,
        color: '#64748B',
    },

    ligaCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 24,

        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    ligaTopo: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    ligaIcone: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
    },

    ligaInfo: {
        flex: 1,
        marginLeft: 12,
    },

    ligaTitulo: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
    },

    ligaTexto: {
        marginTop: 3,
        fontSize: 12,
        color: '#64748B',
    },

    ligaPosicao: {
        fontSize: 15,
        fontWeight: 'bold',
        color: PURPLE,
    },

    progressoFundo: {
        height: 9,
        marginTop: 16,
        backgroundColor: '#EDE9FE',
        borderRadius: 10,
        overflow: 'hidden',
    },

    progresso: {
        width: '58%',
        height: '100%',
        backgroundColor: PURPLE,
        borderRadius: 10,
    },

    listaTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 10,
    },

    lista: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    jogador: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },

    jogadorVoce: {
        backgroundColor: '#F3E8FF',
        borderRadius: 12,
        borderBottomWidth: 0,
        marginVertical: 3,
    },

    posicaoContainer: {
        width: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },

    posicao: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#64748B',
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginLeft: 8,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarVoce: {
        backgroundColor: '#EDE7F6',
    },

    infoJogador: {
        flex: 1,
        marginLeft: 12,
    },

    nomeLinha: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    nome: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
    },

    nomeVoce: {
        color: PURPLE,
    },

    pontos: {
        marginTop: 3,
        fontSize: 12,
        color: '#64748B',
    },

    voceBadge: {
        marginLeft: 8,
        paddingHorizontal: 7,
        paddingVertical: 3,
        backgroundColor: PURPLE,
        borderRadius: 8,
    },

    voceTexto: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },

    mensagem: {
        marginTop: 18,
        padding: 16,
        borderRadius: 14,
        backgroundColor: '#FFFBEB',
        flexDirection: 'row',
        alignItems: 'center',
    },

    mensagemTexto: {
        flex: 1,
        marginLeft: 10,
        fontSize: 13,
        lineHeight: 19,
        color: '#92400E',
    },

});