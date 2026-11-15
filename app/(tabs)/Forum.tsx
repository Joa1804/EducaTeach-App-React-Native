import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppShell from '../../components/appshell';
import { useConfiguracao, type Cores } from '../../context/ConfiguracaoContext';


type Categoria = 'Geral' | 'Duvidas' | 'Projetos' | 'Desafios' | 'Eventos';
type Filtro = 'todos' | Categoria;

type Post = {
    id: string;
    autor: string;
    tempo: string;
    categoria: Categoria;
    titulo: string;
    texto: string;
    curtidas: number;
    respostas: number;
}

const FILTROS: { chave: Filtro; label: string }[] = [
    { chave: 'todos', label: 'Todos' },
    { chave: 'Geral', label: 'Geral' },
    { chave: 'Desafios', label: 'Desafios' },
    { chave: 'Duvidas', label: 'Dúvidas' },
    { chave: 'Projetos', label: 'Projetos' },
    { chave: 'Eventos', label: 'Eventos' },
];

const CATEGORIAS_INFO: Record<Categoria, { label: string; cor: string; fundo: string }> = {
    Geral: { label: 'Geral', cor: '#616161', fundo: '#F0F0F0' },
    Duvidas: { label: 'Dúvida', cor: '#E08A2C', fundo: '#FFE9D6' },
    Projetos: { label: 'Projeto', cor: '#2F6FED', fundo: '#DCE7FF' },
    Desafios: { label: 'Desafio', cor: '#2FA84F', fundo: '#DCF5E7' },
    Eventos: { label: 'Evento', cor: '#8E44AD', fundo: '#F1E4FF' },
}


const POSTS: Post[] = [
    {
        id: '1',
        autor: 'Pedro Santos',
        tempo: 'há 2 horas',
        categoria: 'Desafios',
        titulo: 'Desafio da semana: tire o robô do labirinto',
        texto: 'Use os blocos de Mover e Repetir pra levar o robô até a saída. Quem completar com menos blocos ganha pontos extras!',
        curtidas: 42,
        respostas: 15,
    },
    {
        id: '2',
        autor: 'Ana Costa',
        tempo: 'há 5 horas',
        categoria: 'Duvidas',
        titulo: 'Não entendi como funciona o bloco Repetir',
        texto: 'Quando eu coloco o Mover dentro do Repetir, o robô anda demais. Como eu controlo quantas vezes ele repete?',
        curtidas: 8,
        respostas: 6,
    },
    {
        id: '2',
        autor: 'Ana Costa',
        tempo: 'há 5 horas',
        categoria: 'Duvidas',
        titulo: 'Não entendi como funciona o bloco Repetir',
        texto: 'Quando eu coloco o Mover dentro do Repetir, o robô anda demais. Como eu controlo quantas vezes ele repete?',
        curtidas: 8,
        respostas: 6,
    },
    {
        id: '3',
        autor: 'João Oliveira',
        tempo: 'ontem',
        categoria: 'Projetos',
        titulo: 'Meu jogo da cobrinha ficou pronto!',
        texto: 'Terminei meu primeiro jogo usando condicionais e variáveis. Dá uma olhada e me conta o que achou!',
        curtidas: 27,
        respostas: 9,
    },
    {
        id: '4',
        autor: 'Sofia Lima',
        tempo: 'há 2 dias',
        categoria: 'Desafios',
        titulo: 'Desafio relâmpago: contagem regressiva',
        texto: 'Monte um programa que conta de 10 até 0 usando um loop. Vale mostrar o resultado no simulador.',
        curtidas: 19,
        respostas: 11,
    },
]

export default function ForumScreen() {
    const [filtroAtivo, setFiltroAtivo] = React.useState<Filtro>('todos');

    const postsFiltrados = filtroAtivo === 'todos' ? POSTS : POSTS.filter((post) => post.categoria === filtroAtivo);

       const { cores, fonte } = useConfiguracao();
        const styles = criarEstilos(cores, fonte);

    return (
        <AppShell titulo="Fórum" paginaAtiva="forum">
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.forumHeader}>
                    <Text style={styles.forumTitle}>Fórum da Comunidade</Text>

                    <TouchableOpacity style={styles.newPostButton}>
                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                        <Text style={styles.newPostButtonText}>Novo Post</Text>
                    </TouchableOpacity>
                </View>

                {/* Filtros */}
                <View style={styles.filtrosRow}>
                    {FILTROS.map((item) => (
                        <TouchableOpacity key={item.chave} style={[styles.chip, filtroAtivo === item.chave && styles.chipAtivo]} onPress={() => setFiltroAtivo(item.chave)}>
                            <Text style={[styles.chipTexto, filtroAtivo === item.chave && styles.chipTextoAtivo]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                    {/* LISTA DE POSTS */}
                    {postsFiltrados.length === 0? (
                        <Text style={styles.vazio}>Nenhum post encontrado.</Text>
                    ) : (
                        postsFiltrados.map((post) => <PostCard key={post.id} post={post} styles={styles} />)
                    )}

            </ScrollView>
        </AppShell>
    );
}

function PostCard({ post, styles }: { post: Post; styles: ReturnType<typeof criarEstilos> }) {
    const categoriaInfo = CATEGORIAS_INFO[post.categoria];

    return (
        <View style={styles.card}>
            <View style={styles.cardTopo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarLetra}>{post.autor.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.autor}>{post.autor}</Text>
                    <Text style={styles.tempo}>{post.tempo}</Text>
                </View>
                <View style={[styles.etiqueta, { backgroundColor: categoriaInfo.fundo }]}>
                    <Text style={[styles.etiquetaTexto, { color: categoriaInfo.cor }]}>
                        {categoriaInfo.label}
                    </Text>
                </View>
            </View>

            <Text style={styles.postTitulo}>{post.titulo}</Text>
            <Text style={styles.postTexto}>{post.texto}</Text>

            <View style={styles.cardAcoes}>
                <View style={styles.acaoItem}>
                    <Ionicons name="heart-outline" size={17} color="#757575" />
                    <Text style={styles.acaoTexto}>{post.curtidas}</Text>
                </View>
                <View style={styles.acaoItem}>
                    <Ionicons name="chatbubble-outline" size={17} color="#757575" />
                    <Text style={styles.acaoTexto}>{post.respostas}</Text>
                </View>
            </View>
        </View>
    );
}

const PURPLE = '#673AB7';

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.fundo },
    content: { padding: 25, paddingBottom: 40 },

    forumHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
    },
    forumTitle: { fontSize: f(22), fontWeight: 'bold', color: c.texto },
    newPostButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primaria,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
    },
    newPostButtonText: { color: '#fff', fontWeight: '600', marginLeft: 6 },

    filtrosRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18, gap: 8 },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: c.iconeFundo,
      borderWidth: 1,
      borderColor: c.borda,
    },
    chipAtivo: { backgroundColor: c.primaria, borderColor: c.primaria },
    chipTexto: { fontSize: f(12), color: c.textoSuave, fontWeight: '600' },
    chipTextoAtivo: { color: c.textoPrimaria },

    card: {
      backgroundColor: c.superficie,
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.borda,
    },
    cardTopo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.primariaClara,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarLetra: { color: c.primaria, fontWeight: 'bold', fontSize: f(16) },
    autor: { fontSize: f(14), fontWeight: 'bold', color: c.texto },
    tempo: { fontSize: f(12), color: c.textoSuave, marginTop: 2 },
    etiqueta: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      alignSelf: 'flex-start',
    },
    etiquetaTexto: { fontSize: f(11), fontWeight: '700' },
    postTitulo: { fontSize: f(16), fontWeight: 'bold', color: c.texto, marginBottom: 8 },
    postTexto: { fontSize: f(13), color: c.textoSuave, lineHeight: f(20) },
    cardAcoes: { flexDirection: 'row', marginTop: 14, gap: 18 },
    acaoItem: { flexDirection: 'row', alignItems: 'center' },
    acaoTexto: { marginLeft: 6, fontSize: f(12), color: c.textoSuave },
    vazio: { fontSize: f(14), color: c.textoSuave, textAlign: 'center', marginTop: 20 },

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

