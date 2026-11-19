import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';

export default function DesafiosScreen() {
  const { cores, fonte } = useConfiguracao();
  const styles = criarEstilos(cores, fonte);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

      {/* CABEÇALHO / BANNER */}
      <LinearGradient colors={[cores.primaria, cores.primariaClara]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <View style={styles.bannerIcone}>
          <Ionicons name="trophy" size={29} color={cores.textoPrimaria}/>
        </View>

        <View style={styles.bannerInfo}>
          <Text style={styles.bannerSubtitulo}>
            DESAFIO ATUAL
          </Text>

          <Text style={styles.titulo}>
            Título da Atividade
          </Text>

          <Text style={styles.bannerDescricao}>
            Coloque seus conhecimentos em prática!
          </Text>
        </View>

        <Ionicons name="sparkles" size={23} color={cores.textoPrimaria} style={styles.bannerBrilho}/>
      </LinearGradient>

      {/* STATUS */}
      <View style={styles.statusCard}>
        <View style={styles.statusIcone}>
          <Ionicons name="time-outline" size={23} color="#D97706"/>
        </View>

        <View style={styles.statusInfo}>
          <Text style={styles.statusTitulo}>
            Status do desafio
          </Text>

          <Text style={styles.statusTexto}>
            Em andamento
          </Text>
        </View>

        <View style={styles.statusEtiqueta}>
          <View style={styles.statusPonto} />

          <Text style={styles.statusEtiquetaTexto}>
            Ativo
          </Text>
        </View>
      </View>

      {/* ENUNCIADO */}
      <View style={styles.secao}>
        <View style={styles.secaoCabecalho}>
          <View style={styles.secaoIcone}>
            <Ionicons name="document-text-outline" size={20} color={cores.primaria} />
          </View>

          <Text style={styles.secaoTitulo}>
            Enunciado
          </Text>
        </View>

        <View style={styles.enunciadoCard}>
          <Text style={styles.enunciado}>
            Descrição detalhada do desafio...
          </Text>
        </View>
      </View>

      {/* RESPOSTA */}
      <View style={styles.secao}>
        <View style={styles.secaoCabecalho}>
          <View style={styles.secaoIcone}>
            <Ionicons name="create-outline" size={20} color={cores.primaria}/>
          </View>

          <Text style={styles.secaoTitulo}>
            Sua resposta
          </Text>
        </View>

        <Text style={styles.inputDescricao}>
          Escreva sua solução no espaço abaixo.
        </Text>

        <TextInput style={styles.input} placeholder="Digite sua resposta aqui..." placeholderTextColor={cores.textoSuave} multiline textAlignVertical="top" accessibilityLabel="Campo para escrever sua resposta"/>

        <View style={styles.dicaContainer}>
          <Ionicons name="bulb-outline" size={16} color={cores.estrela}/>

          <Text style={styles.dica}>
            Revise sua resposta antes de enviar.
          </Text>
        </View>
      </View>

      {/* AÇÕES */}
      <View style={styles.acoes}>
        <TouchableOpacity style={styles.botaoEnviar} activeOpacity={0.8} accessibilityRole="button">
          <Ionicons name="send" size={18} color={cores.textoPrimaria}/>

          <Text style={styles.botaoEnviarTexto}>
            Enviar resposta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoVoltar} activeOpacity={0.8} accessibilityRole="button">
          <Ionicons name="arrow-back" size={18} color={cores.primaria}/>

          <Text style={styles.botaoVoltarTexto}>
            Voltar
          </Text>
        </TouchableOpacity>
      </View>

      {/* RODAPÉ */}
      <Text style={styles.rodape}>
        Boa sorte no desafio! Você consegue!
      </Text>
    </ScrollView>
  );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.fundo,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },

    // Banner
    banner: {
      borderRadius: 20,
      padding: 19,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
      overflow: 'hidden',
    },
    bannerIcone: {
      width: 56,
      height: 56,
      borderRadius: 17,
      backgroundColor: c.caixaSobrePrimaria,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 13,
    },
    bannerInfo: {
      flex: 1,
      minWidth: 0,
    },
    bannerSubtitulo: {
      color: c.textoPrimaria,
      opacity: 0.8,
      fontSize: f(11),
      fontWeight: 'bold',
      letterSpacing: 1,
      marginBottom: 4,
    },
    titulo: {
      color: c.textoPrimaria,
      fontSize: f(20),
      fontWeight: 'bold',
    },
    bannerDescricao: {
      color: c.textoPrimaria,
      opacity: 0.85,
      fontSize: f(12),
      marginTop: 5,
      lineHeight: f(17),
    },
    bannerBrilho: {
      marginLeft: 5,
    },

    // Status
    statusCard: {
      backgroundColor: c.superficie,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    statusIcone: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: '#FEF3C7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusInfo: {
      flex: 1,
      marginLeft: 12,
    },
    statusTitulo: {
      color: c.textoSuave,
      fontSize: f(12),
      marginBottom: 3,
    },
    statusTexto: {
      color: c.texto,
      fontSize: f(15),
      fontWeight: 'bold',
    },
    statusEtiqueta: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.iconeFundo,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 7,
      gap: 6,
    },
    statusPonto: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: c.sucesso,
    },
    statusEtiquetaTexto: {
      color: c.texto,
      fontSize: f(11),
      fontWeight: 'bold',
    },

    // Seções
    secao: {
      marginBottom: 24,
    },
    secaoCabecalho: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 9,
    },
    secaoIcone: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secaoTitulo: {
      color: c.texto,
      fontSize: f(17),
      fontWeight: 'bold',
    },

    // Enunciado
    enunciadoCard: {
      backgroundColor: c.superficie,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 18,
    },
    enunciado: {
      color: c.texto,
      fontSize: f(15),
      lineHeight: f(24),
    },

    // Resposta
    inputDescricao: {
      color: c.textoSuave,
      fontSize: f(13),
      marginBottom: 10,
    },
    input: {
      backgroundColor: c.superficie,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: c.borda,
      minHeight: 170,
      padding: 16,
      color: c.texto,
      fontSize: f(15),
      lineHeight: f(23),
      textAlignVertical: 'top',
    },
    dicaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 11,
      gap: 7,
    },
    dica: {
      color: c.textoSuave,
      fontSize: f(12),
      flex: 1,
    },

    // Botões
    acoes: {
      gap: 12,
      marginTop: 4,
    },
    botaoEnviar: {
      backgroundColor: c.primaria,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 9,
    },
    botaoEnviarTexto: {
      color: c.textoPrimaria,
      fontSize: f(15),
      fontWeight: 'bold',
    },
    botaoVoltar: {
      backgroundColor: c.superficie,
      borderWidth: 1,
      borderColor: c.borda,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 15,
      gap: 9,
    },
    botaoVoltarTexto: {
      color: c.primaria,
      fontSize: f(15),
      fontWeight: 'bold',
    },

    // Rodapé
    rodape: {
      color: c.textoSuave,
      fontSize: f(12),
      textAlign: 'center',
      marginTop: 24,
    },
  });
