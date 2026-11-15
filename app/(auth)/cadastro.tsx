import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView, TextInput, Alert, ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient} from 'expo-linear-gradient';
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { useCadastro } from '@/hooks/use-cadastro';


const PURPLE = '#6c63ff';

export default function CadastroScreen() {
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const { cores, fonte } = useConfiguracao();
    const styles = criarEstilos(cores, fonte);

    // Validação (Zod), hash da senha e tratamento de e-mail duplicado ficam no hook/serviço.
    const { carregando, erro, limparErro, enviar } = useCadastro();

    function alterar(setter: (valor: string) => void) {
        return (valor: string) => {
            setter(valor);
            limparErro();
        };
    }

    async function handleCadastro() {
        const criado = await enviar({ nome, email, senha, confirmarSenha });

        if (!criado) return;

        setSenha('');
        setConfirmarSenha('');
        // Navega antes do alerta: no web o Alert do React Native não exibe nada nem chama callbacks.
        router.replace('/login');
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso! Entre com seu e-mail e senha.');
    }

    return (
        <LinearGradient colors={['#6c63ff', '#8b7cf6', '#c4b5fd']} style={styles.container}>
            <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"    showsVerticalScrollIndicator={false}>

                    {/* CARD */}
                    <View style={styles.card}>
                        <View style={styles.iconeContainer}>
                            <Ionicons  name="person-add" size={42} color={PURPLE} />
                        </View>

                        {/* TÍTULO */}
                        <Text style={styles.titulo}>
                            EducaTeach
                        </Text>

                        <Text style={styles.subtitulo}>
                            Crie sua conta e comece a aprender!
                        </Text>

                        {/* NOME */}
                        <Text style={styles.label}>
                            Nome completo
                        </Text>

                        <View style={styles.InputContainer}>
                            <Ionicons name="person-outline" size={20} color="#94a3b8"/>
                            <TextInput style={styles.input} placeholder="Seu nome" placeholderTextColor="#94A3B8" value={nome} onChangeText={alterar(setNome)} editable={!carregando} autoComplete="name" autoCapitalize="words"/>
                        </View>

                        {/* EMAIL */}
                        <Text style={styles.label}>
                            E-mail
                        </Text>

                        <View style={styles.InputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#94a3b8"/>
                            <TextInput style={styles.input} placeholder="seu@email.com" placeholderTextColor="#94A3B8" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={email} onChangeText={alterar(setEmail)} editable={!carregando} autoComplete="email"/>
                        </View>

                        {/* SENHA */}
                        <Text style={styles.label}>
                            Senha
                        </Text>

                        <View style={styles.InputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#94a3b8"/>
                            <TextInput style={styles.input} placeholder="********" placeholderTextColor="#94A3B8" secureTextEntry={!mostrarSenha} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword" value={senha} onChangeText={alterar(setSenha)} editable={!carregando}/>

                            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                                <Ionicons name={ mostrarSenha ? "eye-off-outline" : "eye-outline"} size={21} color="#94a3b8"/>
                            </TouchableOpacity>
                        </View>

                        {/* CONFIRMAR SENHA */}
                        <Text style={styles.label}>
                            Confirmar senha
                        </Text>

                        <View style={styles.InputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#94a3b8"/>

                            <TextInput style={styles.input} placeholder="Digite a senha novamente" placeholderTextColor="#94A3B8"  secureTextEntry={!mostrarSenha} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword" value={confirmarSenha} onChangeText={alterar(setConfirmarSenha)} editable={!carregando}/>
                        </View>

                        {/* ERRO */}
                        {erro && (
                            <Text style={styles.erro} accessibilityRole="alert" accessibilityLiveRegion="polite">
                                {erro}
                            </Text>
                        )}

                        {/* CADASTRAR */}
                        <TouchableOpacity style={[ styles.botaoEntrar, carregando && { opacity: 0.7 },]} onPress={handleCadastro} disabled={carregando}>
                            {carregando ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (

                                <Text style={styles.botaoTexto}>
                                    Criar conta
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* VOLTAR AO LOGIN */}
                        <View style={styles.cadastroContainer}>

                            <Text style={styles.cadastroTexto}>
                                Já possui uma conta?
                            </Text>

                            <TouchableOpacity onPress={() => router.replace('/login')} >
                                <Text style={styles.linkCadastro}>
                                    Entrar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}


const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.fundo,
    },
    keyboard: {
      flex: 1,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 30,
    },
    card: {
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderRadius: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 8,
    },
    iconeContainer: {
      width: 72,
      height: 72,
      borderRadius: 18,
      backgroundColor: '#f3f4ff',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: 16,
    },
    titulo: {
      fontSize: f(30),
      fontWeight: '700',
      color: '#1f2937',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitulo: {
      fontSize: f(14),
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: 20,
    },
    label: {
      fontSize: f(13),
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
      marginTop: 12,
    },
    InputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginBottom: 8,
    },
    input: {
      flex: 1,
      marginLeft: 10,
      color: '#1f2937',
      fontSize: f(15),
      paddingVertical: 0,
    },
    botaoEntrar: {
      backgroundColor: PURPLE,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    erro: {
      marginTop: 12,
      color: c.perigo,
      fontSize: f(13),
      textAlign: 'center',
    },
    botaoTexto: {
      color: '#FFFFFF',
      fontSize: f(16),
      fontWeight: '700',
    },
    cadastroContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      flexWrap: 'wrap',
    },
    cadastroTexto: {
      color: '#64748b',
      fontSize: f(14),
      marginRight: 6,
    },
    linkCadastro: {
      color: PURPLE,
      fontSize: f(14),
      fontWeight: '700',
    },
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
  });