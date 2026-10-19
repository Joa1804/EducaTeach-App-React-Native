import { View, StyleSheet, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient} from 'expo-linear-gradient';
import React, { useState } from "react";

const PURPLE = '#6c63ff';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);

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
                        <Text style={styles.label}> Email ou usuario</Text>

                        <View style={styles.InputContainer}>
                            <Ionicons name="person-outline" size={20} color='#94a3b8' style={styles.inputIcon}/>
                            <TextInput style={styles.input} placeholder="seu@email.com" placeholderTextColor="#94A3B8" autoCapitalize="none" keyboardType="email-address"/>
                        </View>

                        {/* SENHA */}
                        <Text style={styles.label}> Senha</Text>

                        <View style={styles.InputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color='#94a3b8' style={styles.inputIcon}/>
                            <TextInput style={styles.input} placeholder="********" placeholderTextColor="#94A3B8" secureTextEntry={!mostrarSenha}/>
                            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                                <Ionicons  name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={21} color="#94a3b8"/>
                            </TouchableOpacity>
                        </View>

                        {/* ENTRAR */}
                        <TouchableOpacity style={styles.botaoEntrar}>
                            <Text style={styles.botaoTexto}>Entrar</Text>
                        </TouchableOpacity>

                        {/* CADASTRO */}
                        <View style={styles.cadastroContainer}>
                            <Text style={styles.cadastroTexto}>
                                Ainda não tem uma conta?{' '}
                            </Text>

                            <TouchableOpacity>
                                <Text style={styles.linkCadastro}>Cadastre-se</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
          </LinearGradient>
    );

}


const styles = StyleSheet.create({
    container : {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    card : {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.20,
        shadowRadius: 10,
        elevation: 8,
    },
    iconeContainer : {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#ede9fe', 
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titulo : {
         marginTop: 16,
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a1a2e',
        textAlign: 'center',
    },
    subtitulo : {
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
        marginTop: 2,
        marginBottom: 24,
    },
    label : {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 5,
        color: '#555555',
    },
    InputContainer : {
        height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 8,
    },
    inputIcon : {},
    input : {flex: 1, 
        marginLeft: 10, 
        fontSize: 15, 
        color: '#1E293B',
    },
    botaoEntrar : {
        height: 56, 
        marginTop: 8, 
        marginBottom: 16, 
        backgroundColor: PURPLE, 
        borderRadius: 10, 
        alignItems: 'center',
         justifyContent: 'center',
        },
    botaoTexto : {
        color: '#FFFFFF', 
        fontSize: 16, 
        fontWeight: 'bold',
    },
    keyboard : {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll : {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,    
    },
    cadastroContainer : {
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center',
    },
    cadastroTexto : {
        fontSize: 14, 
        color: '#888888',
    },
    linkCadastro : {
        marginLeft: 4, 
        fontSize: 14, 
        color: PURPLE, 
        fontWeight: 'bold',
    },
})