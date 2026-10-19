import {View,Text,StyleSheet,ScrollView,TouchableOpacity,TextInput,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppShell from '../../components/appshell';
import React from 'react';

const PURPLE = '#673AB7';

export default function AjudarScreen() {
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

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F5F5F7',
    },

    content: {
        padding: 24,
        paddingBottom: 40,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },

    iconeAjuda: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: PURPLE,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },

    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
    },

    subtitulo: {
        marginTop: 4,
        fontSize: 14,
        color: '#757575',
    },

    pesquisa: {
        height: 52,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 28,
    },

    inputPesquisa: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#212121',
    },

    secaoTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 12,
    },

    cardAjuda: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    iconeCard: {
        width: 46,
        height: 46,
        borderRadius: 12,
        backgroundColor: '#EDE7F6',
        alignItems: 'center',
        justifyContent: 'center',
    },

    textosCard: {
        flex: 1,
        marginLeft: 14,
        marginRight: 8,
    },

    tituloCard: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 4,
    },

    descricaoCard: {
        fontSize: 13,
        color: '#757575',
    },

    contato: {
        marginTop: 20,
        padding: 24,
        backgroundColor: '#EDE7F6',
        borderRadius: 16,
        alignItems: 'center',
    },

    contatoTitulo: {
        marginTop: 10,
        fontSize: 17,
        fontWeight: 'bold',
        color: '#212121',
    },

    contatoTexto: {
        marginTop: 5,
        fontSize: 13,
        color: '#757575',
        textAlign: 'center',
    },

    botaoContato: {
        marginTop: 16,
        backgroundColor: PURPLE,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },

    textoBotaoContato: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },

});