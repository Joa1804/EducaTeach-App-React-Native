import { View,Text,StyleSheet,ScrollView,TextInput,TouchableOpacity,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppShell from '../../components/appshell';
import { useConfiguracao, type Cores } from '../../context/ConfiguracaoContext';
import React from 'react';

const BLUE = '#2563EB';

export default function DesafiosScreen() {

     const { cores, fonte } = useConfiguracao();
   const styles = criarEstilos(cores, fonte);

  return (
    <AppShell titulo="Desafios" paginaAtiva="desafios">
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* CABEÇALHO DO DESAFIO */} 
        <View style={styles.cabecalho}> 

          <View style={styles.iconeDesafio}> 
            <Ionicons name="trophy" size={28} color="#FFFFFF" /> 
          </View> 

            <View style={styles.informacoes}> 
              <Text style={styles.titulo}> Título da Atividade </Text>  
              </View> 
            </View> 
            
                {/* STATUS */} 
                <View style={styles.statusCard}> 
                  <Ionicons name="time" size={24} color="#F59E0B" /> 
                  <View style={styles.statusInfo}> 
                    <Text style={styles.statusTitulo}> Status </Text> 
                    <Text style={styles.statusTexto}> Em Andamento </Text> 
                  </View> 
                  </View> 

                    {/* ENUNCIADO */}
                    <Text style={styles.label}> Enunciado </Text> 
                    <View style={styles.enunciadoCard}> 
                      <Text style={styles.enunciado}> Descrição detalhada do desafio... </Text> 
                    </View> 

                      {/* RESOLUÇÃO */} 
                      <Text style={styles.label}> Sua Resposta </Text> 
                      <TextInput style={styles.input} placeholder="Digite sua resposta aqui..." placeholderTextColor="#94A3B8" multiline textAlignVertical="top" /> 

                      {/* ENVIAR */} 
                      <TouchableOpacity style={styles.botaoEnviar}> 
                        <Ionicons name="send" size={18} color="#FFFFFF" /> 
                        <Text style={styles.botaoTexto}> Enviar Resposta </Text> 
                      </TouchableOpacity> 

                        {/* VOLTAR */} 
                        <TouchableOpacity style={styles.botaoVoltar}> 
                          <Ionicons name="arrow-back" size={18} color="#FFFFFF" /> 
                          <Text style={styles.botaoTexto}> Voltar </Text> 
                        </TouchableOpacity>

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

    cabecalho: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    iconeDesafio: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    informacoes: { flex: 1 },
    titulo: { fontSize: f(24), fontWeight: 'bold', color: c.texto },

    statusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.superficie,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 16,
      marginBottom: 20,
    },
    statusInfo: { marginLeft: 12, flex: 1 },
    statusTitulo: { fontSize: f(13), color: c.textoSuave, marginBottom: 2 },
    statusTexto: { fontSize: f(15), fontWeight: 'bold', color: c.texto },

    label: { fontSize: f(14), fontWeight: '700', color: c.texto, marginBottom: 10 },
    enunciadoCard: {
      backgroundColor: c.superficie,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 16,
      marginBottom: 20,
    },
    enunciado: { fontSize: f(15), color: c.texto, lineHeight: 22 },

    input: {
      backgroundColor: c.superficie,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.borda,
      minHeight: 140,
      padding: 16,
      paddingTop: 16,
      color: c.texto,
      fontSize: f(15),
      marginBottom: 20,
      textAlignVertical: 'top',
    },

    botaoEnviar: {
      backgroundColor: c.primaria,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      marginBottom: 12,
      gap: 8,
    },
    botaoVoltar: {
      backgroundColor: c.primaria,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      gap: 8,
    },
    botaoTexto: { color: '#FFFFFF', fontSize: f(15), fontWeight: 'bold' },
  });