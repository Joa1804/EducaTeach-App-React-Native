import {View,Text,StyleSheet,ScrollView,TouchableOpacity,TextInput,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppShell from '../../components/appshell';
import { useConfiguracao, type Cores } from '../../context/ConfiguracaoContext';
import React from 'react';

const PURPLE = '#673AB7';

export default function AjudarScreen() {
       const { cores, fonte } = useConfiguracao();
   const styles = criarEstilos(cores, fonte);
    

    return (
        <AppShell titulo="Ajuda" paginaAtiva="ajuda">
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* CABEÇALHO */}
                <View style={styles.cabecalho}>
                    <View style={styles.iconeAjuda}>
                        <Ionicons name="help" size={32} color="#FFFFFF"/>
                    </View>

                    <View>
                        <Text style={styles.titulo}>
                            Como podemos ajudar?
                        </Text>

                        <Text style={styles.subtitulo}>
                            Encontre respostas para suas dúvidas.
                        </Text>
                    </View>
                </View>


                {/* PESQUISA */}
                <View style={styles.pesquisa}>
                    <Ionicons name="search" size={21} color="#94A3B8"/>

                    <TextInput style={styles.inputPesquisa} placeholder="Pesquise uma dúvida..." placeholderTextColor="#94A3B8"/>
                </View>


                {/* PERGUNTAS FREQUENTES */}
                <Text style={styles.secaoTitulo}>
                    Perguntas frequentes
                </Text>


                <TouchableOpacity style={styles.cardAjuda}>

                    <View style={styles.iconeCard}>
                        <Ionicons name="book-outline" size={24} color={PURPLE}/>
                    </View>

                    <View style={styles.textosCard}>

                        <Text style={styles.tituloCard}>
                            Aprender
                        </Text>

                        <Text style={styles.descricaoCard}>
                            Como funciona a jornada de aprendizado?
                        </Text>

                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#94A3B8"
                    />

                </TouchableOpacity>


                <TouchableOpacity style={styles.cardAjuda}>

                    <View style={styles.iconeCard}>
                        <Ionicons name="trophy-outline" size={24} color={PURPLE}/>
                    </View>

                    <View style={styles.textosCard}>
                        <Text style={styles.tituloCard}>
                            Desafios
                        </Text>

                        <Text style={styles.descricaoCard}>
                            Como entregar uma atividade?
                        </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#94A3B8"/>

                </TouchableOpacity>


                <TouchableOpacity style={styles.cardAjuda}>
                    <View style={styles.iconeCard}>
                        <Ionicons name="folder-open-outline" size={24} color={PURPLE}/>
                    </View>

                    <View style={styles.textosCard}>
                        <Text style={styles.tituloCard}>
                            Meus Projetos
                        </Text>

                        <Text style={styles.descricaoCard}>
                            Como criar e gerenciar meus projetos?
                        </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#94A3B8"/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cardAjuda}>
                    <View style={styles.iconeCard}>
                        <Ionicons name="podium-outline" size={24} color={PURPLE}/>
                    </View>

                    <View style={styles.textosCard}>
                        <Text style={styles.tituloCard}>
                            Ranking
                        </Text>

                        <Text style={styles.descricaoCard}>
                            Como funcionam os pontos e o ranking?
                        </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#94A3B8"/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cardAjuda}>
                    <View style={styles.iconeCard}>
                        <Ionicons name="person-outline" size={24} color={PURPLE}/>
                    </View>

                    <View style={styles.textosCard}>
                        <Text style={styles.tituloCard}>
                            Minha conta
                        </Text>

                        <Text style={styles.descricaoCard}>
                            Problemas com login ou cadastro?
                        </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#94A3B8"/>
                </TouchableOpacity>


                {/* CONTATO */}
                <View style={styles.contato}>
                    <Ionicons name="chatbubbles-outline" size={30} color={PURPLE}/>

                    <Text style={styles.contatoTitulo}>
                        Ainda precisa de ajuda?
                    </Text>

                    <Text style={styles.contatoTexto}>
                        Entre em contato com nossa equipe.
                    </Text>

                    <TouchableOpacity style={styles.botaoContato}>
                        <Text style={styles.textoBotaoContato}>
                            Fale conosco
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </AppShell>
    );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.fundo },
    content: { padding: 25, paddingBottom: 40 },

        cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
        iconeAjuda: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: c.primaria,
            alignItems: 'center',
            justifyContent: 'center',
        },
        titulo: { fontSize: f(22), fontWeight: 'bold', color: c.texto },
        subtitulo: { fontSize: f(14), color: c.textoSuave, marginTop: 4 },
        pesquisa: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: c.superficie,
            borderWidth: 1,
            borderColor: c.borda,
            borderRadius: 12,
            paddingHorizontal: 14,
            marginBottom: 24,
        },
        inputPesquisa: { flex: 1, color: c.texto, fontSize: f(15), paddingVertical: 13 },
        secaoTitulo: { fontSize: f(18), fontWeight: 'bold', color: c.texto, marginBottom: 12 },
        cardAjuda: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: c.superficie,
            borderWidth: 1,
            borderColor: c.borda,
            borderRadius: 14,
            padding: 14,
            marginBottom: 10,
        },
        iconeCard: {
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: c.iconeFundo,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        textosCard: { flex: 1 },
        tituloCard: { fontSize: f(15), fontWeight: 'bold', color: c.texto },
        descricaoCard: { fontSize: f(13), color: c.textoSuave, marginTop: 3 },
        contato: {
            alignItems: 'center',
            backgroundColor: c.superficie,
            borderWidth: 1,
            borderColor: c.borda,
            borderRadius: 16,
            padding: 20,
            marginTop: 18,
        },
        contatoTitulo: { fontSize: f(17), fontWeight: 'bold', color: c.texto, marginTop: 10 },
        contatoTexto: { fontSize: f(14), color: c.textoSuave, marginTop: 5, textAlign: 'center' },

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
        botaoContato: {
            backgroundColor: c.primaria,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 24,
            alignItems: 'center',
            marginTop: 16,
        },
        textoBotaoContato: { color: c.textoPrimaria, fontSize: f(15), fontWeight: 'bold' },
  });