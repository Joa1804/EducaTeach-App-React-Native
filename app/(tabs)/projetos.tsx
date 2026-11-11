import {View,Text,StyleSheet,ScrollView,TouchableOpacity,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppShell from '../../components/appshell';
import { useConfiguracao, type Cores } from '../../context/ConfiguracaoContext';
import React from 'react';

const PURPLE = '#673AB7';
const BLUE = '#2563EB';

type ProjetosScreenProps = {
    id: string;
    titulo: string;
    data: string;
    curtidas: number;
    cometarios: number;
    icone: keyof typeof Ionicons.glyphMap;
    corFundo: string;
};

const PROJETOS: ProjetosScreenProps[] = [
    {
        id: '1',
        titulo: 'Meu Primeiro Projeto',
        data: '2024-11-01',
        curtidas: 10,
        cometarios: 5,
        icone: 'game-controller',
        corFundo: '#7C6FF0',
    },
    {
        id: '2',
        titulo: 'Animação de gato',
        data: '2023-02-01',
        curtidas: 20,
        cometarios: 10,
        icone: 'paw',
        corFundo: '#8F7DF5',
    },
    {
        id: '3',
        titulo: 'Quiz de Matemática',
        data: '2023-03-01',
        curtidas: 30,
        cometarios: 15,
        icone: 'calculator',
        corFundo: '#9B7BE8',
    },
];

export default function ProjetosScreen() {
    const { cores, fonte } = useConfiguracao();
    const styles = criarEstilos(cores, fonte);

    return (
        <AppShell titulo="Meus Projetos" paginaAtiva="projetos">
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* CABEÇALHO */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.headerTitulo}>
                            Meus Projetos
                        </Text>

                        <Text style={styles.headerSubtitulo}>
                            Crie, explore e compartilhe seus projetos.
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.novoProjetoButton}>
                        <Ionicons name="add" size={20} color="#FFFFFF" />

                        <Text style={styles.novoProjetoText}>
                            Novo Projeto
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* RESUMO */}
                <View style={styles.resumoCard}>
                    <View style={styles.resumoIcone}>
                        <Ionicons name="folder-open" size={24} color={PURPLE} />
                    </View>

                    <View style={styles.resumoInfo}>
                        <Text style={styles.resumoTitulo}>
                            Seus projetos
                        </Text>

                        <Text style={styles.resumoTexto}>
                            Você possui {PROJETOS.length} projetos criados.
                        </Text>
                    </View>

                    <Text style={styles.resumoNumero}>
                        {PROJETOS.length}
                    </Text>
                </View>

                {/* TÍTULO DA GALERIA */}
                <View style={styles.projetosHeader}>
                    <Text style={styles.projetosTitulo}>
                        Seus projetos
                    </Text>

                    <TouchableOpacity style={styles.filtroButton}>
                        <Ionicons name="options-outline" size={18} color="#64748B" />

                        <Text style={styles.filtroTexto}>
                            Todos
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* GRID */}
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
        </AppShell>
    );
}

function ProjetoCard({
    projeto,
    styles,
}: {
    projeto: ProjetosScreenProps;
    styles: ReturnType<typeof criarEstilos>;
}) {
    return (
        <View style={styles.card}>
            {/* IMAGEM */}
            <View style={[styles.cardImagem, { backgroundColor: projeto.corFundo }]}>
                <View style={styles.iconeProjeto}>
                    <Ionicons name={projeto.icone} size={42} color="#FFFFFF" />
                </View>

                <View style={styles.tagProjeto}>
                    <Text style={styles.tagTexto}>
                        Projeto
                    </Text>
                </View>
            </View>

            {/* INFORMAÇÕES */}
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitulo} numberOfLines={1}>
                    {projeto.titulo}
                </Text>

                <View style={styles.dataContainer}>
                    <Ionicons name="calendar-outline" size={14} color="#94A3B8" />

                    <Text style={styles.cardData}>
                        {projeto.data}
                    </Text>
                </View>

                {/* AÇÕES */}
                <View style={styles.cardAcoes}>
                    <View style={styles.acaoItem}>
                        <Ionicons name="thumbs-up-outline" size={17} color="#64748B" />

                        <Text style={styles.acaoTexto}>
                            {projeto.curtidas}
                        </Text>
                    </View>

                    <View style={styles.acaoItem}>
                        <Ionicons name="chatbubble-outline" size={16} color="#64748B" />

                        <Text style={styles.acaoTexto}>
                            {projeto.cometarios}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.compartilhar}>
                        <Ionicons name="share-social-outline" size={17} color={PURPLE} />
                    </TouchableOpacity>
                </View>

                {/* BOTÃO */}
                <TouchableOpacity style={styles.abrirButton}>
                    <Text style={styles.abrirTexto}>
                        Abrir projeto
                    </Text>

                    <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={PURPLE}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

function criarEstilos(cores: Cores, fonte: (tamanho: number) => number) {
    const paleta = {
        fundo: cores.fundo,
        superficie: cores.superficie,
        texto: cores.texto,
        textoSuave: cores.textoSuave,
        borda: cores.borda,
        primaria: cores.primaria,
        primariaClara: cores.primariaClara,
        textoPrimaria: cores.textoPrimaria,
        iconeFundo: cores.iconeFundo,
    };

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: paleta.fundo,
        },
        content: {
            padding: 24,
            paddingBottom: 40,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        },
        headerTitulo: {
            fontSize: fonte(24),
            fontWeight: 'bold',
            color: paleta.texto,
        },
        headerSubtitulo: {
            marginTop: 4,
            fontSize: fonte(13),
            color: paleta.textoSuave,
        },
        novoProjetoButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            backgroundColor: paleta.primaria,
            paddingVertical: 11,
            paddingHorizontal: 17,
            borderRadius: 11,
        },
        novoProjetoText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: fonte(13),
        },
        resumoCard: {
            backgroundColor: paleta.primariaClara,
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
        },
        resumoIcone: {
            width: 46,
            height: 46,
            borderRadius: 13,
            backgroundColor: paleta.superficie,
            alignItems: 'center',
            justifyContent: 'center',
        },
        resumoInfo: {
            flex: 1,
            marginLeft: 12,
        },
        resumoTitulo: {
            fontSize: fonte(15),
            fontWeight: 'bold',
            color: paleta.texto,
        },
        resumoTexto: {
            marginTop: 3,
            fontSize: fonte(12),
            color: paleta.textoSuave,
        },
        resumoNumero: {
            fontSize: fonte(24),
            fontWeight: 'bold',
            color: paleta.primaria,
        },
        projetosHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        projetosTitulo: {
            fontSize: fonte(18),
            fontWeight: 'bold',
            color: paleta.texto,
        },
        filtroButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 7,
            backgroundColor: paleta.superficie,
            borderWidth: 1,
            borderColor: paleta.borda,
            borderRadius: 9,
        },
        filtroTexto: {
            fontSize: fonte(12),
            color: paleta.textoSuave,
            fontWeight: '600',
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 18,
        },
        card: {
            width: 220,
            backgroundColor: paleta.superficie,
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
        },
        cardImagem: {
            height: 145,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },
        iconeProjeto: {
            width: 72,
            height: 72,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.16)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        tagProjeto: {
            position: 'absolute',
            top: 10,
            left: 10,
            paddingHorizontal: 9,
            paddingVertical: 5,
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: 8,
        },
        tagTexto: {
            color: '#FFFFFF',
            fontSize: fonte(10),
            fontWeight: 'bold',
        },
        cardInfo: {
            padding: 14,
        },
        cardTitulo: {
            fontWeight: 'bold',
            fontSize: fonte(15),
            color: paleta.texto,
            marginBottom: 7,
        },
        dataContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginBottom: 13,
        },
        cardData: {
            color: '#94A3B8',
            fontSize: fonte(12),
        },
        cardAcoes: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        acaoItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginRight: 14,
        },
        acaoTexto: {
            color: paleta.textoSuave,
            fontSize: fonte(12),
        },
        compartilhar: {
            marginLeft: 'auto',
        },
        abrirButton: {
            marginTop: 14,
            paddingVertical: 10,
            borderRadius: 9,
            backgroundColor: paleta.primariaClara,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 7,
        },
        abrirTexto: {
            color: paleta.primaria,
            fontSize: fonte(12),
            fontWeight: 'bold',
        },
    });
}
