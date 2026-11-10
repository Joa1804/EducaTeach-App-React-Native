import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView, TextInput, Alert, ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient} from 'expo-linear-gradient';
import React, { useState } from "react";
import { router, useRouter } from "expo-router";
import { cadastrarUsuario } from '../../db/database'


const PURPLE = '#6c63ff';

export default function CadastroScreen() {
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function handleCadastro() {

        if (!nome.trim() || !email.trim() || !senha.trim() || !confirmarSenha.trim()) {
            Alert.alert('Por favor, preencha todos os campos.');
            return;
        }

        if (!email.includes('@')) {
            Alert.alert('Erro', 'Por favor, insira um email válido.');
            return;
        }

        if (senha.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        try {
            setCarregando(true);

            await cadastrarUsuario(nome.trim(), email.trim(), senha.trim());
            Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/login') },
            ]);
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);

            const mensagemErro = error instanceof Error ? error.message : String(error);

            if (mensagemErro.includes('UNIQUE constraint failed')) {
                Alert.alert('Erro', 'Este email já está cadastrado.');
            }
        } finally {
            setCarregando(false);
        }

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
                            <TextInput style={styles.input} placeholder="Seu nome" placeholderTextColor="#94A3B8" value={nome} onChangeText={setNome} autoCapitalize="words"/>
                        </View>

                        {/* EMAIL */}
                        <Text style={styles.label}>
                            E-mail
                        </Text>

                        <View style={styles.InputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#94a3b8"/>
                            <TextInput style={styles.input} placeholder="seu@email.com" placeholderTextColor="#94A3B8" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={email} onChangeText={setEmail}/>
                        </View>

                        {/* SENHA */}
                        <Text style={styles.label}>
                            Senha
                        </Text>

                        <View style={styles.InputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#94a3b8"/>
                            <TextInput style={styles.input} placeholder="********" placeholderTextColor="#94A3B8" secureTextEntry={!mostrarSenha} value={senha} onChangeText={setSenha}/>

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

                            <TextInput style={styles.input} placeholder="Digite a senha novamente" placeholderTextColor="#94A3B8"  secureTextEntry={!mostrarSenha} value={confirmarSenha} onChangeText={setConfirmarSenha}/>
                        </View>

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


const styles = StyleSheet.create({

    container: {
        flex: 1,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 28,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.20,
        shadowRadius: 10,

        elevation: 8,
    },

    iconeContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#ede9fe',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },

    titulo: {
        marginTop: 16,
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a1a2e',
        textAlign: 'center',
    },

    subtitulo: {
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
        marginTop: 2,
        marginBottom: 24,
    },

    label: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 5,
        marginTop: 12,
        color: '#555555',
    },

    InputContainer: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginTop: 4,
    },

    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1E293B',
    },

    botaoEntrar: {
        height: 56,
        marginTop: 24,
        marginBottom: 16,
        backgroundColor: PURPLE,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    botaoTexto: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    keyboard: {
        flex: 1,
        justifyContent: 'center',
    },

    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },

    cadastroContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    cadastroTexto: {
        fontSize: 14,
        color: '#888888',
    },

    linkCadastro: {
        marginLeft: 5,
        fontSize: 14,
        color: PURPLE,
        fontWeight: 'bold',
    },

});