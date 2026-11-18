
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { useUsuario } from '@/context/UsuarioContext';

type Estilos = ReturnType<typeof criarEstilos>;

type PropsOpcao = {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descricao: string;
  valor: boolean;
  aoMudar: (value: boolean) => void;
  cores: Cores;
  styles: Estilos;
};

function OpcaoSwitch({
  icon,
  titulo,
  descricao,
  valor,
  aoMudar,
  cores,
  styles,
}: PropsOpcao) {
  return (
    <View style={styles.opcaoLinha}>
      <View style={styles.opcaoIcone}>
        <Ionicons name={icon} size={20} color={cores.primaria} />
      </View>

      <View style={styles.opcaoInfo}>
        <Text style={styles.opcaoTitulo}>{titulo}</Text>
        <Text style={styles.opcaoDescricao}>{descricao}</Text>
      </View>

      <Switch
        value={valor}
        onValueChange={aoMudar}
        trackColor={{
          false: cores.borda,
          true: cores.primariaClara,
        }}
        thumbColor={valor ? cores.primaria : '#F5F5F5'}
        accessibilityLabel={titulo}
        accessibilityHint={descricao}
      />
    </View>
  );
}

type PropsSecao = {
  titulo: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  cores: Cores;
  styles: Estilos;
};

function Secao({
  titulo,
  icon,
  children,
  cores,
  styles,
}: PropsSecao) {
  return (
    <View style={styles.secao}>
      <View style={styles.secaoHeader}>
        <View style={styles.secaoIcone}>
          <Ionicons name={icon} size={18} color={cores.primaria} />
        </View>

        <Text style={styles.secaoTitulo}>{titulo}</Text>
      </View>

      {children}
    </View>
  );
}

export default function ConfiguracaoScreen() {
  const {
    altoContraste,
    fonteGrande,
    notificacoes,
    som,
    alterar,
    cores,
    fonte,
  } = useConfiguracao();

  const { usuario, sair } = useUsuario();

  const styles = useMemo(
    () => criarEstilos(cores, fonte),
    [cores, fonte],
  );

  const nome = usuario?.nome ?? '';
  const inicial = nome.trim().charAt(0).toUpperCase() || '?';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.headerTexto}>
          <Text style={styles.titulo} accessibilityRole="header">
            Configurações
          </Text>

          <Text style={styles.subtitulo}>
            Personalize sua experiência no EducaTeach.
          </Text>
        </View>

        <View style={styles.headerIcone}>
          <Ionicons
            name="settings"
            size={25}
            color={cores.textoPrimaria}
          />
        </View>
      </View>

      {/* Perfil */}
      <LinearGradient
        colors={['#6c63ff', '#8b7cf6', '#a99bf9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.perfilCard}
      >
        <View style={styles.perfilTopo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetra}>{inicial}</Text>
          </View>

          <View style={styles.perfilInfo}>
            <Text style={styles.perfilNome} numberOfLines={1}>
              {nome || 'Usuário'}
            </Text>

            <Text style={styles.perfilEmail} numberOfLines={1}>
              {usuario?.email ?? ''}
            </Text>
          </View>

          <View style={styles.perfilSelo}>
            <Ionicons
              name="person-circle-outline"
              size={21}
              color={cores.textoPrimaria}
            />
          </View>
        </View>

        <View style={styles.perfilRodape}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color="#B9F6CA"
          />

          <Text style={styles.perfilRodapeTexto}>
            Sua conta EducaTeach
          </Text>
        </View>

        <Ionicons
          name="settings-outline"
          size={105}
          color="rgba(255,255,255,0.10)"
          style={styles.perfilDecoracao}
        />
      </LinearGradient>

      {/* Acessibilidade */}
      <Secao
        titulo="Acessibilidade"
        icon="accessibility-outline"
        cores={cores}
        styles={styles}
      >
        <OpcaoSwitch
          icon="contrast-outline"
          titulo="Alto contraste"
          descricao="Aumenta o contraste de cores da tela"
          valor={altoContraste}
          aoMudar={(valor) => alterar('altoContraste', valor)}
          cores={cores}
          styles={styles}
        />

        <View style={styles.divisor} />

        <OpcaoSwitch
          icon="text-outline"
          titulo="Fonte grande"
          descricao="Aumenta o tamanho da fonte da interface"
          valor={fonteGrande}
          aoMudar={(valor) => alterar('fonteGrande', valor)}
          cores={cores}
          styles={styles}
        />
      </Secao>

      {/* Preferências */}
      <Secao
        titulo="Preferências"
        icon="options-outline"
        cores={cores}
        styles={styles}
      >
        <OpcaoSwitch
          icon="notifications-outline"
          titulo="Notificações"
          descricao="Receba alertas e lembretes"
          valor={notificacoes}
          aoMudar={(valor) => alterar('notificacoes', valor)}
          cores={cores}
          styles={styles}
        />

        <View style={styles.divisor} />

        <OpcaoSwitch
          icon="volume-medium-outline"
          titulo="Som"
          descricao="Ativa os sons de notificações"
          valor={som}
          aoMudar={(valor) => alterar('som', valor)}
          cores={cores}
          styles={styles}
        />
      </Secao>

      {/* Conta */}
      <Secao
        titulo="Conta"
        icon="person-outline"
        cores={cores}
        styles={styles}
      >
        <TouchableOpacity
          style={styles.sairButton}
          onPress={sair}
          activeOpacity={0.75}
          accessibilityRole="button"
        >
          <View style={styles.sairIcone}>
            <Ionicons
              name="log-out-outline"
              size={21}
              color={cores.perigo}
            />
          </View>

          <View style={styles.sairInfo}>
            <Text style={styles.sairTexto}>Sair da conta</Text>

            <Text style={styles.sairDescricao}>
              Encerrar sua sessão neste aparelho
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={cores.textoSuave}
          />
        </TouchableOpacity>
      </Secao>

      {/* Versão */}
      <View style={styles.versaoContainer}>
        <View style={styles.versaoIcone}>
          <Ionicons
            name="school-outline"
            size={19}
            color={cores.textoSuave}
          />
        </View>

        <Text style={styles.versao}>
          EducaTeach · versão 1.0.0
        </Text>

        <Text style={styles.versaoDescricao}>
          Aprender, criar e evoluir!
        </Text>
      </View>
    </ScrollView>
  );
}

const criarEstilos = (c: Cores, f: (tamanho: number) => number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.fundo,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },

    // Cabeçalho
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    headerTexto: {
      flex: 1,
      paddingRight: 12,
    },
    titulo: {
      fontSize: f(25),
      fontWeight: 'bold',
      color: c.texto,
    },
    subtitulo: {
      fontSize: f(13),
      color: c.textoSuave,
      marginTop: 5,
      lineHeight: f(19),
    },
    headerIcone: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: c.primaria,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Perfil
    perfilCard: {
      borderRadius: 21,
      padding: 18,
      marginBottom: 22,
      overflow: 'hidden',
    },
    perfilTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1,
    },
    avatar: {
      width: 57,
      height: 57,
      borderRadius: 19,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 13,
    },
    avatarLetra: {
      fontWeight: 'bold',
      fontSize: f(23),
      color: '#FFFFFF',
    },
    perfilInfo: {
      flex: 1,
      minWidth: 0,
    },
    perfilNome: {
      fontSize: f(17),
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    perfilEmail: {
      fontSize: f(12),
      color: '#FFFFFF',
      marginTop: 4,
      opacity: 0.9,
    },
    perfilSelo: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    perfilRodape: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.22)',
      marginTop: 16,
      paddingTop: 13,
      zIndex: 1,
    },
    perfilRodapeTexto: {
      color: '#FFFFFF',
      fontSize: f(12),
      fontWeight: '600',
    },
    perfilDecoracao: {
      position: 'absolute',
      right: -15,
      bottom: -28,
      transform: [{ rotate: '-15deg' }],
    },

    // Seções
    secao: {
      backgroundColor: c.superficie,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 16,
      marginBottom: 16,
    },
    secaoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    secaoIcone: {
      width: 33,
      height: 33,
      borderRadius: 11,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secaoTitulo: {
      fontWeight: 'bold',
      fontSize: f(15),
      color: c.texto,
    },

    // Opções
    opcaoLinha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      paddingVertical: 12,
    },
    opcaoIcone: {
      width: 39,
      height: 39,
      borderRadius: 13,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },
    opcaoInfo: {
      flex: 1,
      minWidth: 0,
    },
    opcaoTitulo: {
      fontWeight: '600',
      fontSize: f(14),
      color: c.texto,
    },
    opcaoDescricao: {
      fontSize: f(12),
      color: c.textoSuave,
      marginTop: 4,
      lineHeight: f(17),
    },
    divisor: {
      height: 1,
      backgroundColor: c.borda,
    },

    // Sair
    sairButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      paddingVertical: 6,
    },
    sairIcone: {
      width: 41,
      height: 41,
      borderRadius: 13,
      backgroundColor: c.perigoFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sairInfo: {
      flex: 1,
    },
    sairTexto: {
      color: c.perigo,
      fontSize: f(14),
      fontWeight: 'bold',
    },
    sairDescricao: {
      color: c.textoSuave,
      fontSize: f(12),
      marginTop: 4,
    },

    // Rodapé
    versaoContainer: {
      alignItems: 'center',
      marginTop: 9,
      gap: 5,
    },
    versaoIcone: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 3,
    },
    versao: {
      textAlign: 'center',
      color: c.textoSuave,
      fontSize: f(12),
      fontWeight: '600',
    },
    versaoDescricao: {
      color: c.textoSuave,
      fontSize: f(11),
    },
  });
