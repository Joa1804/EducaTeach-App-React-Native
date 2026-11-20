
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import {
  useConfiguracao,
  type Cores,
} from '@/context/ConfiguracaoContext';
import { useCadastro } from '@/hooks/use-cadastro';
import { FONTES } from '@/constants/fontes';
import { escurecer } from '@/lib/cores';

export default function CadastroScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const emailRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const senhaRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const confirmarSenhaRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  const { cores, fonte, altoContraste } = useConfiguracao();

  const styles = useMemo(
    () => criarEstilos(cores, fonte),
    [cores, fonte],
  );

  const coresGradiente: [string, string] = altoContraste
    ? [cores.primaria, cores.primaria]
    : [cores.primaria, escurecer(cores.primaria, 0.3)];

  const { carregando, erro, limparErro, enviar } = useCadastro();

  function alterar(setter: (valor: string) => void) {
    return (valor: string) => {
      setter(valor);
      limparErro();
    };
  }

  async function handleCadastro() {
    const criado = await enviar({
      nome,
      email,
      senha,
      confirmarSenha,
    });

    if (!criado) return;

    setSenha('');
    setConfirmarSenha('');

    router.replace('/login');

    Alert.alert(
      'Sucesso',
      'Cadastro realizado com sucesso! Entre com seu e-mail e senha.',
    );
  }

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
          {/* CABEÇALHO */}
          <View style={styles.cabecalho}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="person-add"
                size={34}
                color={cores.primaria}
              />
            </View>

            <Text style={styles.nomeApp}>
              Tech
            </Text>

            <Text style={styles.descricaoApp}>
              Faça parte da nossa comunidade!
            </Text>
          </View>

          {/* CARD DE CADASTRO */}
          <View style={styles.card}>
            <View style={styles.cardCabecalho}>
              <Text style={styles.titulo}>
                Criar conta
              </Text>

              <Text style={styles.subtitulo}>
                Preencha os dados para começar.
              </Text>
            </View>

            {/* NOME */}
            <Text style={styles.label}>
              Nome completo
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={19}
                color={cores.textoSuave}
              />

              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor={cores.textoSuave}
                value={nome}
                onChangeText={alterar(setNome)}
                editable={!carregando}
                autoComplete="name"
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                accessibilityLabel="Nome completo"
              />
            </View>

            {/* EMAIL */}
            <Text style={styles.label}>
              E-mail
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={19}
                color={cores.textoSuave}
              />

              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={cores.textoSuave}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                value={email}
                onChangeText={alterar(setEmail)}
                editable={!carregando}
                onSubmitEditing={() => senhaRef.current?.focus()}
                accessibilityLabel="E-mail"
              />
            </View>

            {/* SENHA */}
            <Text style={styles.label}>
              Senha
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
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
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                value={senha}
                onChangeText={alterar(setSenha)}
                editable={!carregando}
                onSubmitEditing={() => confirmarSenhaRef.current?.focus()}
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
                  name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={cores.textoSuave}
                />
              </TouchableOpacity>
            </View>

            {/* CONFIRMAR SENHA */}
            <Text style={styles.label}>
              Confirmar senha
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={cores.textoSuave}
              />

              <TextInput
                ref={confirmarSenhaRef}
                style={styles.input}
                placeholder="Repita sua senha"
                placeholderTextColor={cores.textoSuave}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="go"
                value={confirmarSenha}
                onChangeText={alterar(setConfirmarSenha)}
                editable={!carregando}
                onSubmitEditing={handleCadastro}
                accessibilityLabel="Confirmar senha"
              />
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

            {/* CADASTRAR */}
            <TouchableOpacity
              style={[
                styles.botaoCadastrar,
                carregando && styles.botaoDesabilitado,
              ]}
              onPress={handleCadastro}
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
                    Criar conta
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color={cores.textoPrimaria}
                  />
                </>
              )}
            </TouchableOpacity>

            {/* VOLTAR AO LOGIN */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginTexto}>
                Já possui uma conta?
              </Text>

              <TouchableOpacity
                onPress={() => router.replace('/login')}
                disabled={carregando}
                accessibilityRole="button"
              >
                <Text style={styles.linkLogin}>
                  Entrar
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

const criarEstilos = (
  c: Cores,
  f: (tamanho: number) => number,
) =>
  StyleSheet.create({
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
      paddingVertical: 22,
    },

    // Cabeçalho
    cabecalho: {
      alignItems: 'center',
      marginBottom: 20,
    },

    logoContainer: {
      width: 66,
      height: 66,
      borderRadius: 21,
      backgroundColor: c.superficie,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 9,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },

    nomeApp: {
      fontFamily: FONTES.titulo,
      fontSize: f(27),
      color: c.textoPrimaria,
      textAlign: 'center',
    },

    descricaoApp: {
      fontFamily: FONTES.texto,
      fontSize: f(13),
      color: c.textoPrimaria,
      opacity: 0.9,
      textAlign: 'center',
      marginTop: 3,
    },

    // Card
    card: {
      backgroundColor: c.superficie,
      borderRadius: 22,
      padding: 21,
      borderWidth: 1,
      borderColor: c.borda,
      elevation: 9,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
    },

    cardCabecalho: {
      marginBottom: 17,
    },

    titulo: {
      fontFamily: FONTES.titulo,
      color: c.texto,
      fontSize: f(22),
      textAlign: 'center',
    },

    subtitulo: {
      fontFamily: FONTES.texto,
      color: c.textoSuave,
      fontSize: f(12),
      textAlign: 'center',
      marginTop: 5,
    },

    // Campos
    label: {
      fontFamily: FONTES.destaque,
      color: c.texto,
      fontSize: f(13),
      marginBottom: 6,
      marginTop: 12,
    },

    inputContainer: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.iconeFundo,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: c.borda,
      paddingHorizontal: 12,
    },

    input: {
      flex: 1,
      marginLeft: 10,
      marginRight: 7,
      fontFamily: FONTES.texto,
      fontSize: f(13),
      color: c.texto,
      paddingVertical: 9,
    },

    // Erro
    erroContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.perigoFundo,
      borderRadius: 11,
      padding: 10,
      marginTop: 13,
      gap: 8,
    },

    erro: {
      flex: 1,
      fontFamily: FONTES.texto,
      color: c.perigo,
      fontSize: f(12),
      lineHeight: 17,
    },

    // Botão
    botaoCadastrar: {
      minHeight: 52,
      backgroundColor: c.primaria,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      marginTop: 19,
      elevation: 3,
      shadowColor: c.primaria,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 5,
    },

    botaoDesabilitado: {
      opacity: 0.65,
    },

    botaoTexto: {
      fontFamily: FONTES.destaque,
      color: c.textoPrimaria,
      fontSize: f(15),
    },

    // Login
    loginContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
      marginTop: 19,
    },

    loginTexto: {
      fontFamily: FONTES.texto,
      color: c.textoSuave,
      fontSize: f(12),
    },

    linkLogin: {
      fontFamily: FONTES.destaque,
      color: c.primaria,
      fontSize: f(13),
    },

    // Rodapé
    rodape: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 7,
      marginTop: 19,
    },

    rodapeTexto: {
      fontFamily: FONTES.texto,
      color: c.textoPrimaria,
      fontSize: f(11),
      opacity: 0.9,
    },
  });
