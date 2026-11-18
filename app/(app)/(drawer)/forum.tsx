
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Cartao, Etiqueta } from '@/components/ui';
import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';

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
};

const FILTROS: { chave: Filtro; label: string }[] = [
  { chave: 'todos', label: 'Todos' },
  { chave: 'Geral', label: 'Geral' },
  { chave: 'Desafios', label: 'Desafios' },
  { chave: 'Duvidas', label: 'Dúvidas' },
  { chave: 'Projetos', label: 'Projetos' },
  { chave: 'Eventos', label: 'Eventos' },
];

const CATEGORIAS_INFO: Record<
  Categoria,
  { label: string; cor: string; icone: keyof typeof Ionicons.glyphMap }
> = {
  Geral: { label: 'Geral', cor: '#64748B', icone: 'chatbubbles-outline' },
  Duvidas: { label: 'Dúvida', cor: '#E08A2C', icone: 'help-circle-outline' },
  Projetos: { label: 'Projeto', cor: '#2F6FED', icone: 'code-slash-outline' },
  Desafios: { label: 'Desafio', cor: '#2FA84F', icone: 'trophy-outline' },
  Eventos: { label: 'Evento', cor: '#8E44AD', icone: 'calendar-outline' },
};

const POSTS: Post[] = [
  {
    id: '1',
    autor: 'Pedro Santos',
    tempo: 'há 2 horas',
    categoria: 'Desafios',
    titulo: 'Desafio da semana: tire o robô do labirinto',
    texto:
      'Use os blocos de Mover e Repetir pra levar o robô até a saída. Quem completar com menos blocos ganha pontos extras!',
    curtidas: 42,
    respostas: 15,
  },
  {
    id: '2',
    autor: 'Ana Costa',
    tempo: 'há 5 horas',
    categoria: 'Duvidas',
    titulo: 'Não entendi como funciona o bloco Repetir',
    texto:
      'Quando eu coloco o Mover dentro do Repetir, o robô anda demais. Como eu controlo quantas vezes ele repete?',
    curtidas: 8,
    respostas: 6,
  },
  {
    id: '3',
    autor: 'João Oliveira',
    tempo: 'ontem',
    categoria: 'Projetos',
    titulo: 'Meu jogo da cobrinha ficou pronto!',
    texto:
      'Terminei meu primeiro jogo usando condicionais e variáveis. Dá uma olhada e me conta o que achou!',
    curtidas: 27,
    respostas: 9,
  },
  {
    id: '4',
    autor: 'Sofia Lima',
    tempo: 'há 2 dias',
    categoria: 'Desafios',
    titulo: 'Desafio relâmpago: contagem regressiva',
    texto:
      'Monte um programa que conta de 10 até 0 usando um loop. Vale mostrar o resultado no simulador.',
    curtidas: 19,
    respostas: 11,
  },
];

type Estilos = ReturnType<typeof criarEstilos>;

export default function ForumScreen() {
  const [filtroAtivo, setFiltroAtivo] = useState<Filtro>('todos');

  const { cores, fonte } = useConfiguracao();

  const styles = useMemo(
    () => criarEstilos(cores, fonte),
    [cores, fonte],
  );

  const postsFiltrados =
    filtroAtivo === 'todos'
      ? POSTS
      : POSTS.filter((post) => post.categoria === filtroAtivo);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.headerTexto}>
          <Text style={styles.titulo} accessibilityRole="header">
            Comunidade
          </Text>

          <Text style={styles.subtitulo}>
            Compartilhe ideias, tire dúvidas e participe!
          </Text>
        </View>

        <TouchableOpacity
          style={styles.novoPostBotao}
          accessibilityRole="button"
          accessibilityLabel="Criar novo post"
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={cores.textoPrimaria} />
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerIcone}>
          <Ionicons name="people" size={30} color={cores.textoPrimaria} />
        </View>

        <View style={styles.bannerInfo}>
          <Text style={styles.bannerTitulo}>
            Fórum da Comunidade
          </Text>

          <Text style={styles.bannerTexto}>
            Aprender fica melhor quando compartilhamos conhecimento.
          </Text>
        </View>

        <Ionicons
          name="sparkles"
          size={23}
          color={cores.textoPrimaria}
          style={styles.bannerBrilho}
        />
      </View>

      {/* Cabeçalho das conversas */}
      <View style={styles.secaoHeader}>
        <View style={styles.secaoTexto}>
          <Text style={styles.secaoTitulo}>
            Conversas
          </Text>

          <Text style={styles.secaoSubtitulo}>
            Explore as publicações da comunidade
          </Text>
        </View>

        <View style={styles.contador}>
          <Text style={styles.contadorTexto}>
            {postsFiltrados.length}
          </Text>
        </View>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtros}
      >
        {FILTROS.map((item) => {
          const ativo = filtroAtivo === item.chave;

          return (
            <TouchableOpacity
              key={item.chave}
              style={[styles.chip, ativo && styles.chipAtivo]}
              onPress={() => setFiltroAtivo(item.chave)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
            >
              <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Publicações */}
      <View style={styles.lista}>
        {postsFiltrados.length === 0 ? (
          <Cartao>
            <View style={styles.vazio}>
              <View style={styles.vazioIcone}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={32}
                  color={cores.textoSuave}
                />
              </View>

              <Text style={styles.vazioTitulo}>
                Nenhum post encontrado
              </Text>

              <Text style={styles.vazioTexto}>
                Ainda não existem publicações nesta categoria.
              </Text>
            </View>
          </Cartao>
        ) : (
          postsFiltrados.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              styles={styles}
              cores={cores}
            />
          ))
        )}
      </View>

      {/* Rodapé */}
      <View style={styles.rodape}>
        <Ionicons
          name="people-outline"
          size={17}
          color={cores.textoSuave}
        />
        <Text style={styles.rodapeTexto}>
          Compartilhe, aprenda e cresça junto com a comunidade!
        </Text>
      </View>
    </ScrollView>
  );
}

function PostCard({
  post,
  styles,
  cores,
}: {
  post: Post;
  styles: Estilos;
  cores: Cores;
}) {
  const categoriaInfo = CATEGORIAS_INFO[post.categoria];

  return (
    <Cartao>
      <View style={styles.card}>
        {/* Autor e categoria */}
        <View style={styles.cardTopo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetra}>
              {post.autor.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.autorInfo}>
            <Text style={styles.autor} numberOfLines={1}>
              {post.autor}
            </Text>

            <View style={styles.tempoLinha}>
              <Ionicons
                name="time-outline"
                size={13}
                color={cores.textoSuave}
              />
              <Text style={styles.tempo}>
                {post.tempo}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.etiqueta,
              { backgroundColor: cores.iconeFundo },
            ]}
          >
            <Ionicons
              name={categoriaInfo.icone}
              size={13}
              color={categoriaInfo.cor}
            />

            <Text
              style={[
                styles.etiquetaTexto,
                { color: categoriaInfo.cor },
              ]}
            >
              {categoriaInfo.label}
            </Text>
          </View>
        </View>

        {/* Conteúdo */}
        <Text style={styles.postTitulo}>
          {post.titulo}
        </Text>

        <Text style={styles.postTexto}>
          {post.texto}
        </Text>

        {/* Interações */}
        <View style={styles.divisor} />

        <View style={styles.cardAcoes}>
          <View style={styles.acaoItem}>
            <Ionicons
              name="heart-outline"
              size={18}
              color={cores.textoSuave}
            />

            <Text style={styles.acaoTexto}>
              {post.curtidas}
            </Text>
          </View>

          <View style={styles.acaoItem}>
            <Ionicons
              name="chatbubble-outline"
              size={17}
              color={cores.textoSuave}
            />

            <Text style={styles.acaoTexto}>
              {post.respostas} respostas
            </Text>
          </View>

          <View style={styles.acaoEspacador} />

          <Ionicons
            name="chevron-forward"
            size={19}
            color={cores.textoSuave}
          />
        </View>
      </View>
    </Cartao>
  );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.fundo,
    },
    content: {
      padding: 16,
      paddingBottom: 35,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    headerTexto: {
      flex: 1,
      paddingRight: 12,
    },
    titulo: {
      fontSize: f(25),
      fontWeight: 'bold',
      color: c.texto,
    },
    subtitulo: {
      fontSize: f(13),
      color: c.textoSuave,
      marginTop: 5,
      lineHeight: f(19),
    },
    novoPostBotao: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
    },

    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primaria,
      borderRadius: 20,
      padding: 18,
      marginBottom: 25,
      overflow: 'hidden',
    },
    bannerIcone: {
      width: 52,
      height: 52,
      borderRadius: 17,
      backgroundColor: c.caixaSobrePrimaria,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 13,
    },
    bannerInfo: {
      flex: 1,
    },
    bannerTitulo: {
      fontSize: f(17),
      fontWeight: 'bold',
      color: c.textoPrimaria,
    },
    bannerTexto: {
      fontSize: f(12),
      color: c.textoPrimaria,
      marginTop: 5,
      lineHeight: f(18),
    },
    bannerBrilho: {
      marginLeft: 6,
    },

    secaoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 13,
    },
    secaoTexto: {
      flex: 1,
    },
    secaoTitulo: {
      fontSize: f(20),
      fontWeight: 'bold',
      color: c.texto,
    },
    secaoSubtitulo: {
      fontSize: f(12),
      color: c.textoSuave,
      marginTop: 4,
    },
    contador: {
      minWidth: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 9,
      marginLeft: 10,
    },
    contadorTexto: {
      color: c.primaria,
      fontSize: f(13),
      fontWeight: 'bold',
    },

    filtros: {
      gap: 8,
      paddingBottom: 18,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: c.superficie,
      borderWidth: 1,
      borderColor: c.borda,
    },
    chipAtivo: {
      backgroundColor: c.primaria,
      borderColor: c.primaria,
    },
    chipTexto: {
      fontSize: f(13),
      color: c.textoSuave,
      fontWeight: '600',
    },
    chipTextoAtivo: {
      color: c.textoPrimaria,
    },

    lista: {
      gap: 14,
    },
    card: {
      gap: 0,
    },
    cardTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 15,
      backgroundColor: c.primariaClara,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },
    avatarLetra: {
      color: c.primaria,
      fontWeight: 'bold',
      fontSize: f(18),
    },
    autorInfo: {
      flex: 1,
      minWidth: 0,
    },
    autor: {
      fontSize: f(14),
      fontWeight: 'bold',
      color: c.texto,
    },
    tempoLinha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 4,
    },
    tempo: {
      fontSize: f(11),
      color: c.textoSuave,
    },
    etiqueta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 7,
      borderRadius: 999,
      marginLeft: 6,
    },
    etiquetaTexto: {
      fontSize: f(11),
      fontWeight: 'bold',
    },

    postTitulo: {
      fontSize: f(16),
      fontWeight: 'bold',
      color: c.texto,
      lineHeight: f(23),
      marginBottom: 8,
    },
    postTexto: {
      fontSize: f(13),
      color: c.textoSuave,
      lineHeight: f(20),
    },
    divisor: {
      height: 1,
      backgroundColor: c.borda,
      marginTop: 16,
      marginBottom: 13,
    },
    cardAcoes: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    acaoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    acaoTexto: {
      fontSize: f(12),
      color: c.textoSuave,
      fontWeight: '600',
    },
    acaoEspacador: {
      flex: 1,
    },

    vazio: {
      alignItems: 'center',
      paddingVertical: 35,
      paddingHorizontal: 20,
    },
    vazioIcone: {
      width: 62,
      height: 62,
      borderRadius: 20,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 13,
    },
    vazioTitulo: {
      fontSize: f(16),
      fontWeight: 'bold',
      color: c.texto,
    },
    vazioTexto: {
      fontSize: f(13),
      color: c.textoSuave,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: f(19),
    },

    rodape: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      marginTop: 25,
      paddingHorizontal: 12,
    },
    rodapeTexto: {
      flex: 1,
      fontSize: f(11),
      color: c.textoSuave,
      textAlign: 'center',
    },
  });
