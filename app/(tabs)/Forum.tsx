import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppShell from '../../components/appshell';


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
                        postsFiltrados.map((post) => <PostCard key={post.id} post={post} />)
                    )}

            </ScrollView>
        </AppShell>
    );
}

function PostCard({ post }: { post: Post }) {
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

const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    forumHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    forumTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
    },
    newPostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: PURPLE,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    newPostButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
 
    filtrosRow: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 8, 
        marginBottom: 16 
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    chipAtivo: { 
        backgroundColor: PURPLE, 
        borderColor: PURPLE 
    },
    chipTexto: { 
        color: '#424242', 
        fontWeight: '600', 
        fontSize: 13 
    },
    chipTextoAtivo: { 
        color: '#fff' 
    },
 
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    cardTopo: { 
        flexDirection: 'row',
        alignItems: 'center', 
        gap: 10, 
        marginBottom: 12 
        },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EDE7F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLetra: { 
        color: PURPLE, 
        fontWeight: 'bold', 
        fontSize: 16 
    },
    autor: { 
        fontWeight: 'bold', 
        fontSize: 14, 
        color: '#212121' 
    },
    tempo: { 
        fontSize: 12, 
        color: '#9E9E9E', 
        marginTop: 1 
    },
    etiqueta: { 
        paddingVertical: 4, 
        paddingHorizontal: 10, 
        borderRadius: 10 
    },
    etiquetaTexto: { 
        fontSize: 11,
        fontWeight: 'bold'
     },
    postTitulo: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#212121', 
        marginBottom: 6 
    },
    postTexto: { 
        fontSize: 14, 
        color: '#616161', 
        lineHeight: 20, 
        marginBottom: 12 
    },
    cardAcoes: { 
        flexDirection: 'row', 
        gap: 18 
    },
    acaoItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 5 
    },
    acaoTexto: { 
        color: '#757575', 
        fontSize: 13 
    },
 
    vazio: { 
        textAlign: 'center', 
        color: '#9E9E9E', 
        marginTop: 32 
    },
});