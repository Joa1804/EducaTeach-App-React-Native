
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import {
  useConfiguracao,
  type Cores,
} from '@/context/ConfiguracaoContext';
import { useLogin } from '@/hooks/use-login';
import { FONTES } from '@/constants/fontes';
import { escurecer } from '@/lib/cores';

export default function LoginScreen() {
  const router = useRouter();

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const senhaRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  const { cores, fonte, altoContraste } = useConfiguracao();

  const styles = useMemo(
    () => criarEstilos(cores, fonte),
    [cores, fonte],
  );

  const coresGradiente: [string, string] = altoContraste
    ? [cores.primaria, cores.primaria]
    : [cores.primaria, escurecer(cores.primaria, 0.3)];

  const {
    email,
    senha,
    setEmail,
    setSenha,
    carregando,
    erro,
    enviar,
  } = useLogin();

  return (
    <LinearGradient
      colors={coresGradiente}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ELEMENTOS DECORATIVOS */}
          <View style={styles.decoracaoSuperior}>
            <Ionicons
              name="sparkles"
              size={34}
              color={cores.textoPrimaria}
            />
          </View>

          {/* CABEÇALHO */}
          <View style={styles.cabecalho}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="school"
                size={42}
                color={cores.primaria}
              />
            </View>

            <Text style={styles.nomeApp}>
              Tech
            </Text>

            <Text style={styles.descricaoApp}>
              Aprenda, ensine e transforme o futuro!
            </Text>
          </View>

          {/* CARD DE LOGIN */}
          <View style={styles.card}>
            <View style={styles.cardCabecalho}>
              <Text style={styles.titulo}>
                Bem-vindo de volta!
              </Text>

              <Text style={styles.subtitulo}>
                Entre na sua conta para continuar aprendendo.
              </Text>
            </View>

            {/* EMAIL */}
            <Text style={styles.label}>
              E-mail
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={cores.textoSuave}
              />

              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={cores.textoSuave}
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
            <View style={styles.labelLinha}>
              <Text style={styles.label}>
                Senha
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={cores.textoSuave}
              />

              <TextInput
                ref={senhaRef}
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor={cores.textoSuave}
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
                disabled={carregando}
                accessibilityRole="button"
                accessibilityLabel={
                  mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
                }
              >
                <Ionicons
                  name={
                    mostrarSenha
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={21}
                  color={cores.textoSuave}
                />
              </TouchableOpacity>
            </View>

            {/* ERRO */}
            {erro ? (
              <View style={styles.erroContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={19}
                  color={cores.perigo}
                />

                <Text
                  style={styles.erro}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                >
                  {erro}
                </Text>
              </View>
            ) : null}

            {/* ENTRAR */}
            <TouchableOpacity
              style={[
                styles.botaoEntrar,
                carregando && styles.botaoDesabilitado,
              ]}
              onPress={enviar}
              disabled={carregando}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{
                disabled: carregando,
                busy: carregando,
              }}
            >
              {carregando ? (
                <ActivityIndicator color={cores.textoPrimaria} />
              ) : (
                <>
                  <Text style={styles.botaoTexto}>
                    Entrar
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color={cores.textoPrimaria}
                  />
                </>
              )}
            </TouchableOpacity>

            {/* CADASTRO */}
            <View style={styles.divisorContainer}>
              <View style={styles.divisor} />

              <Text style={styles.divisorTexto}>
                OU
              </Text>

              <View style={styles.divisor} />
            </View>

            <View style={styles.cadastroContainer}>
              <Text style={styles.cadastroTexto}>
                Ainda não tem uma conta?
              </Text>

              <TouchableOpacity
                onPress={() => router.push('/cadastro')}
                disabled={carregando}
                accessibilityRole="button"
              >
                <Text style={styles.linkCadastro}>
                  Cadastre-se
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* RODAPÉ */}
          <View style={styles.rodape}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color={cores.textoPrimaria}
            />

            <Text style={styles.rodapeTexto}>
              Seu aprendizado começa aqui.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function criarEstilos(
  cores: Cores,
  fonte: (tamanho: number) => number,
) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },

    keyboard: {
      flex: 1,
    },

    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 22,
      paddingVertical: 35,
    },

    // Elementos decorativos
    decoracaoSuperior: {
      position: 'absolute',
      top: 45,
      right: 35,
      opacity: 0.55,
    },

    // Cabeçalho
    cabecalho: {
      alignItems: 'center',
      marginBottom: 28,
    },

    logoContainer: {
      width: 82,
      height: 82,
      borderRadius: 26,
      backgroundColor: cores.superficie,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 13,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },

    nomeApp: {
      fontFamily: FONTES.titulo,
      fontSize: fonte(30),
      color: cores.textoPrimaria,
      textAlign: 'center',
    },

    descricaoApp: {
      fontFamily: FONTES.texto,
      fontSize: fonte(14),
      color: cores.textoPrimaria,
      opacity: 0.9,
      textAlign: 'center',
      marginTop: 5,
    },

    // Card
    card: {
      backgroundColor: cores.superficie,
      borderRadius: 24,
      padding: 25,
      borderWidth: 1,
      borderColor: cores.borda,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
    },

    cardCabecalho: {
      marginBottom: 25,
    },

    titulo: {
      fontFamily: FONTES.titulo,
      color: cores.texto,
      fontSize: fonte(23),
      textAlign: 'center',
    },

    subtitulo: {
      fontFamily: FONTES.texto,
      color: cores.textoSuave,
      fontSize: fonte(13),
      textAlign: 'center',
      marginTop: 7,
      lineHeight: 20,
    },

    // Campos
    label: {
      fontFamily: FONTES.destaque,
      color: cores.texto,
      fontSize: fonte(14),
      marginBottom: 9,
    },

    labelLinha: {
      marginTop: 19,
    },

    inputContainer: {
      minHeight: 55,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: cores.iconeFundo,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: cores.borda,
      paddingHorizontal: 15,
    },

    input: {
      flex: 1,
      marginLeft: 11,
      marginRight: 8,
      fontFamily: FONTES.texto,
      fontSize: fonte(14),
      color: cores.texto,
      paddingVertical: 12,
    },

    // Erro
    erroContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: cores.perigoFundo,
      borderRadius: 12,
      padding: 12,
      marginTop: 16,
      gap: 8,
    },

    erro: {
      flex: 1,
      fontFamily: FONTES.texto,
      color: cores.perigo,
      fontSize: fonte(12),
      lineHeight: 18,
    },

    // Botão
    botaoEntrar: {
      minHeight: 56,
      backgroundColor: cores.primaria,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginTop: 25,
      elevation: 3,
      shadowColor: cores.primaria,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
    },

    botaoDesabilitado: {
      opacity: 0.65,
    },

    botaoTexto: {
      fontFamily: FONTES.destaque,
      color: cores.textoPrimaria,
      fontSize: fonte(16),
    },

    // Cadastro
    divisorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 23,
      gap: 12,
    },

    divisor: {
      flex: 1,
      height: 1,
      backgroundColor: cores.borda,
    },

    divisorTexto: {
      fontFamily: FONTES.destaque,
      color: cores.textoSuave,
      fontSize: fonte(11),
    },

    cadastroContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    },

    cadastroTexto: {
      fontFamily: FONTES.texto,
      color: cores.textoSuave,
      fontSize: fonte(13),
    },

    linkCadastro: {
      fontFamily: FONTES.destaque,
      color: cores.primaria,
      fontSize: fonte(13),
    },

    // Rodapé
    rodape: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 7,
      marginTop: 25,
    },

    rodapeTexto: {
      fontFamily: FONTES.texto,
      color: cores.textoPrimaria,
      fontSize: fonte(12),
      opacity: 0.9,
    },
  });
}
