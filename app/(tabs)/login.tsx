import { View, StyleSheet, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useConfiguracao, type Cores } from '../../context/ConfiguracaoContext';
import { useLogin } from '../../hooks/use-login';

const PURPLE = '#6c63ff';

export default function LoginScreen() {
    const router = useRouter();
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const senhaRef = useRef<React.ComponentRef<typeof TextInput>>(null);
    const { cores, fonte } = useConfiguracao();
    const styles = criarEstilos(cores, fonte);

    // Ao autenticar, o guard de rotas em app/(tabs)/_layout.tsx leva o usuário ao início.
    const { email, senha, setEmail, setSenha, carregando, erro, enviar } = useLogin();

    return (
          <LinearGradient colors={['#6c63ff', '#8b7cf6', '#c4b5fd']} style={styles.container}>
            <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* CARD */}
                    <View style={styles.card}>

                        {/* ÍCONE */}
                        <View style={styles.iconeContainer}>
                            <Ionicons name="person" size={42} color={PURPLE}/>
                        </View>

                        {/* TÍTULO */}
                        <Text style={styles.titulo}>EducaTeach</Text>
                        <Text style={styles.subtitulo}>Aprenda a ensinar com tecnologia</Text>

                        {/* EMAIL */}
                        <Text style={styles.label}> E-mail</Text>

                        <View style={styles.InputContainer}>
                            <Ionicons name="person-outline" size={20} color='#94a3b8' style={styles.inputIcon}/>
                            <TextInput
                                style={styles.input}
                                placeholder="seu@email.com"
                                placeholderTextColor="#94A3B8"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                                textContentType="emailAddress"
                                keyboardType="email-address"
                                returnKeyType="next"
                                value={email}
                                onChangeText={setEmail}
                                onSubmitEditing={() => senhaRef.current?.focus()}
                                editable={!carregando}
                                accessibilityLabel="E-mail"
                            />
                        </View>

                        {/* SENHA */}
                        <Text style={styles.label}> Senha</Text>

                        <View style={styles.InputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color='#94a3b8' style={styles.inputIcon}/>
                            <TextInput
                                ref={senhaRef}
                                style={styles.input}
                                placeholder="********"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!mostrarSenha}
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="current-password"
                                textContentType="password"
                                returnKeyType="go"
                                value={senha}
                                onChangeText={setSenha}
                                onSubmitEditing={enviar}
                                editable={!carregando}
                                accessibilityLabel="Senha"
                            />
                            <TouchableOpacity
                                onPress={() => setMostrarSenha((atual) => !atual)}
                                accessibilityRole="button"
                                accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                <Ionicons  name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={21} color="#94a3b8"/>
                            </TouchableOpacity>
                        </View>

                        {/* ERRO */}
                        {erro && (
                            <Text style={styles.erro} accessibilityRole="alert" accessibilityLiveRegion="polite">
                                {erro}
                            </Text>
                        )}

                        {/* ENTRAR */}
                        <TouchableOpacity
                            style={[styles.botaoEntrar, carregando && styles.botaoDesabilitado]}
                            onPress={enviar}
                            disabled={carregando}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: carregando, busy: carregando }}
                        >
                            {carregando ? (
                                <ActivityIndicator color={cores.textoPrimaria} />
                            ) : (
                                <Text style={styles.botaoTexto}>Entrar</Text>
                            )}
                        </TouchableOpacity>

                        {/* CADASTRO */}
                        <View style={styles.cadastroContainer}>
                            <Text style={styles.cadastroTexto}>
                                Ainda não tem uma conta?{' '}
                            </Text>

                            <TouchableOpacity onPress={() => router.push('/(tabs)/Cadastro')} disabled={carregando}>
                                <Text style={styles.linkCadastro}>Cadastre-se</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
          </LinearGradient>
    );

}

function criarEstilos(cores: Cores, fonte: (tamanho: number) => number) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: cores.fundo,
        },
        card: {
            backgroundColor: cores.superficie,
            borderRadius: 20,
            padding: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 8,
        },
        iconeContainer: {
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: cores.iconeFundo,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
        },
        titulo: {
            marginTop: 16,
            fontSize: fonte(26),
            fontWeight: 'bold',
            color: cores.texto,
            textAlign: 'center',
        },
        subtitulo: {
            fontSize: fonte(14),
            color: cores.textoSuave,
            textAlign: 'center',
            marginTop: 2,
            marginBottom: 24,
        },
        label: {
            fontSize: fonte(13),
            fontWeight: '500',
            marginBottom: 5,
            color: cores.texto,
        },
        InputContainer: {
            height: 52,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: cores.caixaSobrePrimaria,
            borderRadius: 10,
            paddingHorizontal: 10,
            marginTop: 8,
        },
        inputIcon: {},
        input: {
            flex: 1,
            marginLeft: 10,
            fontSize: fonte(15),
            color: cores.texto,
        },
        botaoEntrar: {
            height: 56,
            marginTop: 16,
            marginBottom: 16,
            backgroundColor: cores.primaria,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        botaoDesabilitado: {
            opacity: 0.7,
        },
        erro: {
            marginTop: 12,
            fontSize: fonte(13),
            color: cores.perigo,
            textAlign: 'center',
        },
        botaoTexto: {
            color: cores.textoPrimaria,
            fontSize: fonte(16),
            fontWeight: 'bold',
        },
        keyboard: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
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
            fontSize: fonte(14),
            color: cores.textoSuave,
        },
        linkCadastro: {
            marginLeft: 4,
            fontSize: fonte(14),
            color: cores.primaria,
            fontWeight: 'bold',
        },
    });
}
