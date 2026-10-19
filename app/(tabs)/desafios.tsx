import { View,Text,StyleSheet,ScrollView,TextInput,TouchableOpacity,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppShell from '../../components/appshell';
import React from 'react';

const BLUE = '#2563EB';

export default function DesafiosScreen() {

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


const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
  }, 
  content: { 
    padding: 25, 
    paddingBottom: 40, 
  }, 
  cabecalho: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2, }, 
    shadowOpacity: 0.08, 
    shadowRadius: 5, 
    elevation: 3,
   }, 
  iconeDesafio: { 
    width: 58, 
    height: 58, 
    borderRadius: 29, 
    backgroundColor: BLUE, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 15, 
  }, 
  informacoes: { 
    flex: 1, 
  }, 
    titulo: { 
      fontSize: 23, 
      fontWeight: 'bold', 
      color: '#1E293B', 
    }, 
    professor: { 
      marginTop: 5, 
      fontSize: 14, 
      color: '#64748B', 
    }, 
  prazoCard: { 
    marginTop: 18,
     backgroundColor: '#EFF6FF', 
     borderRadius: 12, 
     padding: 15, 
     flexDirection: 'row', 
     alignItems: 'center',
     }, 
  prazoInfo: { 
    marginLeft: 12,
   }, 
   prazoTitulo: { 
    fontSize: 13,
     color: '#64748B', 
    }, 
    data: { 
      marginTop: 3, 
      fontSize: 16, 
      fontWeight: 'bold', 
      color: '#1E293B', 
    }, 
  statusCard: { 
    marginTop: 10, 
    backgroundColor: '#FFFBEB', 
    borderRadius: 12, 
    padding: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
  }, 
  statusInfo: { 
    marginLeft: 12, 
  }, statusTitulo: { 
    fontSize: 13, 
    color: '#64748B', 
  }, 
  statusTexto: { 
    marginTop: 3, 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#F59E0B', 
  }, 
  label: { 
    marginTop:
    24, fontSize: 17, 
    fontWeight: 'bold', 
    color: '#1E293B', 
  }, 
  enunciadoCard: {
     marginTop: 8, 
     backgroundColor: '#FFFFFF',
      borderRadius: 12, 
      padding: 18, 
      borderWidth: 1, 
      borderColor: '#E2E8F0', 
    }, 
  enunciado: { 
    fontSize: 15, 
    lineHeight: 23, 
    color: '#334155',
   }, 
  input: { 
    minHeight: 250, 
    marginTop: 8, 
    padding: 15, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#CBD5E1', 
    borderRadius: 10, 
    fontSize: 15,
     color: '#1E293B', 
    }, 
  /* BOTÕES */ 
  botaoEnviar: { 
    marginTop: 20, 
    height: 48,
     backgroundColor: BLUE, 
     borderRadius: 8, 
     flexDirection: 'row', 
     alignItems: 'center', 
     justifyContent: 'center', 
    }, 
  botaoVoltar: { 
    marginTop: 10, 
    height: 48, 
    backgroundColor: '#64748B', 
    borderRadius: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
  }, 
  botaoTexto: { 
    marginLeft: 8, 
    color: '#FFFFFF', 
    fontSize: 15,
     fontWeight: 'bold',
     }, 
});