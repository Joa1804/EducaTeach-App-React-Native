
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { FONTES } from '@/constants/fontes';
import { escurecer } from '@/lib/cores';

type Ajuda = {
  id: string;
  titulo: string;
  descricao: string;
  icone: keyof typeof Ionicons.glyphMap;
};

const PERGUNTAS: Ajuda[] = [
  {
    id: 'aprender',
    titulo: 'Aprender',
    descricao: 'Como funciona a jornada de aprendizado?',
    icone: 'book-outline',
  },
  {
    id: 'desafios',
    titulo: 'Desafios',
    descricao: 'Como entregar uma atividade?',
    icone: 'trophy-outline',
  },
  {
    id: 'projetos',
    titulo: 'Meus Projetos',
    descricao: 'Como criar e gerenciar meus projetos?',
    icone: 'folder-open-outline',
  },
  {
    id: 'ranking',
    titulo: 'Ranking',
    descricao: 'Como funcionam os pontos e o ranking?',
    icone: 'podium-outline',
  },
  {
    id: 'conta',
    titulo: 'Minha conta',
    descricao: 'Problemas com login ou cadastro?',
    icone: 'person-outline',
  },
];

type Estilos = ReturnType<typeof criarEstilos>;

export default function AjudarScreen() {
  const { cores, fonte, altoContraste } = useConfiguracao();
  const [pesquisa, setPesquisa] = useState('');

  const styles = useMemo(
    () => criarEstilos(cores, fonte),
    [cores, fonte],
  );

  const coresGradiente: [string, string] = altoContraste
    ? [cores.primaria, cores.primaria]
    : [cores.primaria, escurecer(cores.primaria, 0.3)];

  const perguntasFiltradas = useMemo(() => {
    const termo = pesquisa.trim().toLocaleLowerCase();

    if (!termo) return PERGUNTAS;

    return PERGUNTAS.filter((item) =>
      item.titulo.toLocaleLowerCase().includes(termo) ||
      item.descricao.toLocaleLowerCase().includes(termo),
    );
  }, [pesquisa]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View style={styles.headerTexto}>
          <Text style={styles.titulo} accessibilityRole="header">
            Central de Ajuda
          </Text>

          <Text style={styles.subtitulo}>
            Encontre respostas para suas dúvidas.
          </Text>
        </View>

        <View style={styles.headerIcone}>
          <Ionicons name="help" size={27} color={cores.primaria} />
        </View>
      </View>

      {/* BANNER */}
      <View style={styles.bannerContainer}>
        <LinearGradient
          colors={coresGradiente}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerConteudo}>
            <View style={styles.bannerIcone}>
              <Ionicons
                name="chatbubbles"
                size={27}
                color={cores.textoPrimaria}
              />
            </View>

            <View style={styles.bannerInfo}>
              <Text style={styles.bannerTitulo}>
                Como podemos ajudar?
              </Text>

              <Text style={styles.bannerTexto}>
                Estamos aqui para ajudar você a aproveitar melhor o Tech.
              </Text>
            </View>

            <Ionicons
              name="sparkles"
              size={22}
              color={cores.textoPrimaria}
            />
          </View>

          <View style={styles.bannerBase} />
        </LinearGradient>
      </View>

      {/* PESQUISA */}
      <View style={styles.pesquisa}>
        <Ionicons name="search" size={21} color={cores.textoSuave} />

        <TextInput
          style={styles.inputPesquisa}
          placeholder="Pesquise uma dúvida..."
          placeholderTextColor={cores.textoSuave}
          value={pesquisa}
          onChangeText={setPesquisa}
          returnKeyType="search"
          accessibilityLabel="Pesquisar perguntas frequentes"
        />

        {pesquisa.length > 0 && (
          <TouchableOpacity
            onPress={() => setPesquisa('')}
            accessibilityRole="button"
            accessibilityLabel="Limpar pesquisa"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={cores.textoSuave}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* PERGUNTAS FREQUENTES */}
      <View style={styles.secaoHeader}>
        <View style={styles.secaoTexto}>
          <Text style={styles.secaoTitulo}>
            Perguntas frequentes
          </Text>

          <Text style={styles.secaoSubtitulo}>
            Encontre ajuda por assunto
          </Text>
        </View>

        <View style={styles.contador}>
          <Text style={styles.contadorTexto}>
            {perguntasFiltradas.length}
          </Text>
        </View>
      </View>

      {/* LISTA DE CATEGORIAS */}
      <View style={styles.lista}>
        {perguntasFiltradas.length > 0 ? (
          perguntasFiltradas.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.cardAjuda}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`${item.titulo}. ${item.descricao}`}
            >
              <View style={styles.iconeCard}>
                <Ionicons
                  name={item.icone}
                  size={23}
                  color={cores.primaria}
                />
              </View>

              <View style={styles.textosCard}>
                <Text style={styles.tituloCard}>
                  {item.titulo}
                </Text>

                <Text style={styles.descricaoCard}>
                  {item.descricao}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={cores.textoSuave}
              />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.vazio}>
            <View style={styles.vazioIcone}>
              <Ionicons
                name="search-outline"
                size={30}
                color={cores.textoSuave}
              />
            </View>

            <Text style={styles.vazioTitulo}>
              Nenhum resultado encontrado
            </Text>

            <Text style={styles.vazioTexto}>
              Tente pesquisar com outras palavras.
            </Text>

            <TouchableOpacity
              onPress={() => setPesquisa('')}
              style={styles.limparBotao}
            >
              <Text style={styles.limparTexto}>
                Limpar pesquisa
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CONTATO */}
      <View style={styles.contato}>
        <View style={styles.contatoIcone}>
          <Ionicons
            name="headset-outline"
            size={28}
            color={cores.primaria}
          />
        </View>

        <Text style={styles.contatoTitulo}>
          Ainda precisa de ajuda?
        </Text>

        <Text style={styles.contatoTexto}>
          Não encontrou o que procurava? Entre em contato com nossa equipe.
        </Text>

        <TouchableOpacity
          style={styles.botaoContato}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={18}
            color={cores.textoPrimaria}
          />

          <Text style={styles.textoBotaoContato}>
            Fale conosco
          </Text>
        </TouchableOpacity>
      </View>

      {/* RODAPÉ */}
      <Text style={styles.rodape}>
        Tech · Estamos aqui para ajudar!
      </Text>
    </ScrollView>
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
      paddingBottom: 40,
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
      fontFamily: FONTES.titulo,
      fontSize: f(24),
      color: c.texto,
    },
    subtitulo: {
      fontFamily: FONTES.texto,
      fontSize: f(13),
      color: c.textoSuave,
      marginTop: 4,
    },
    headerIcone: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bannerContainer: {
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 22,
    },
    banner: {
      padding: 17,
      paddingBottom: 12,
    },
    bannerConteudo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingBottom: 7,
    },
    bannerBase: {
      height: 5,
      borderRadius: 5,
      backgroundColor: 'rgba(0,0,0,0.13)',
      marginTop: 7,
    },
    bannerIcone: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: c.caixaSobrePrimaria,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bannerInfo: {
      flex: 1,
    },
    bannerTitulo: {
      fontFamily: FONTES.destaque,
      fontSize: f(16),
      color: c.textoPrimaria,
    },
    bannerTexto: {
      fontFamily: FONTES.texto,
      fontSize: f(12),
      color: c.textoPrimaria,
      marginTop: 5,
      lineHeight: f(17),
    },
    pesquisa: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.superficie,
      borderWidth: 1,
      borderColor: c.borda,
      borderRadius: 15,
      paddingHorizontal: 14,
      minHeight: 52,
      marginBottom: 25,
    },
    inputPesquisa: {
      flex: 1,
      color: c.texto,
      fontFamily: FONTES.texto,
      fontSize: f(14),
      paddingVertical: 12,
    },
    secaoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    secaoTexto: {
      flex: 1,
    },
    secaoTitulo: {
      fontFamily: FONTES.titulo,
      fontSize: f(19),
      color: c.texto,
    },
    secaoSubtitulo: {
      fontFamily: FONTES.texto,
      fontSize: f(12),
      color: c.textoSuave,
      marginTop: 3,
    },
    contador: {
      minWidth: 34,
      height: 34,
      paddingHorizontal: 9,
      borderRadius: 12,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contadorTexto: {
      fontFamily: FONTES.destaque,
      color: c.primaria,
      fontSize: f(13),
    },
    lista: {
      gap: 11,
    },
    cardAjuda: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.superficie,
      borderWidth: 1,
      borderColor: c.borda,
      borderRadius: 17,
      padding: 14,
    },
    iconeCard: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    textosCard: {
      flex: 1,
      minWidth: 0,
    },
    tituloCard: {
      fontFamily: FONTES.destaque,
      fontSize: f(15),
      color: c.texto,
    },
    descricaoCard: {
      fontFamily: FONTES.texto,
      fontSize: f(12),
      color: c.textoSuave,
      marginTop: 4,
      lineHeight: f(17),
    },
    vazio: {
      alignItems: 'center',
      backgroundColor: c.superficie,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 24,
    },
    vazioIcone: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    vazioTitulo: {
      fontFamily: FONTES.destaque,
      fontSize: f(15),
      color: c.texto,
      textAlign: 'center',
    },
    vazioTexto: {
      fontFamily: FONTES.texto,
      fontSize: f(12),
      color: c.textoSuave,
      textAlign: 'center',
      marginTop: 5,
    },
    limparBotao: {
      marginTop: 15,
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 11,
      backgroundColor: c.iconeFundo,
    },
    limparTexto: {
      fontFamily: FONTES.destaque,
      color: c.primaria,
      fontSize: f(13),
    },
    contato: {
      alignItems: 'center',
      backgroundColor: c.superficie,
      borderWidth: 1,
      borderColor: c.borda,
      borderRadius: 20,
      padding: 22,
      marginTop: 23,
    },
    contatoIcone: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contatoTitulo: {
      fontFamily: FONTES.destaque,
      fontSize: f(17),
      color: c.texto,
      marginTop: 13,
      textAlign: 'center',
    },
    contatoTexto: {
      fontFamily: FONTES.texto,
      fontSize: f(13),
      color: c.textoSuave,
      marginTop: 6,
      textAlign: 'center',
      lineHeight: f(19),
    },
    botaoContato: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: c.primaria,
      borderRadius: 13,
      paddingVertical: 12,
      paddingHorizontal: 22,
      marginTop: 17,
    },
    textoBotaoContato: {
      fontFamily: FONTES.destaque,
      color: c.textoPrimaria,
      fontSize: f(14),
    },
    rodape: {
      fontFamily: FONTES.texto,
      color: c.textoSuave,
      fontSize: f(11),
      textAlign: 'center',
      marginTop: 20,
    },
  });
