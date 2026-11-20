
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

import {
  useConfiguracao,
  type Cores,
  type Tema,
} from '@/context/ConfiguracaoContext';

import { useUsuario } from '@/context/UsuarioContext';
import { FONTES } from '@/constants/fontes';
import { escurecer } from '@/lib/cores';

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
          <Ionicons name={icon} size={19} color={cores.primaria} />
        </View>

        <Text style={styles.secaoTitulo}>{titulo}</Text>
      </View>

      {children}
    </View>
  );
}

// ============================================
// OPÇÃO DE TEMA
// ============================================

type PropsTema = {
  tema: Tema;
  temaAtual: Tema;
  titulo: string;
  descricao: string;
  icon: keyof typeof Ionicons.glyphMap;
  cores: Cores;
  styles: Estilos;
  aoSelecionar: (tema: Tema) => void;
};

function OpcaoTema({
  tema,
  temaAtual,
  titulo,
  descricao,
  icon,
  cores,
  styles,
  aoSelecionar,
}: PropsTema) {
  const selecionado = temaAtual === tema;

  return (
    <TouchableOpacity
      style={[
        styles.temaOpcao,
        selecionado && styles.temaOpcaoSelecionada,
      ]}
      onPress={() => aoSelecionar(tema)}
      activeOpacity={0.75}
      accessibilityRole="radio"
      accessibilityState={{ selected: selecionado }}
      accessibilityLabel={`${titulo}. ${descricao}`}
    >
      <View style={styles.temaOpcaoIcone}>
        <Ionicons
          name={icon}
          size={22}
          color={selecionado ? cores.primaria : cores.textoSuave}
        />
      </View>

      <View style={styles.temaOpcaoInfo}>
        <Text
          style={[
            styles.temaOpcaoTitulo,
            selecionado && styles.temaOpcaoTituloSelecionado,
          ]}
        >
          {titulo}
        </Text>

        <Text style={styles.temaOpcaoDescricao}>
          {descricao}
        </Text>
      </View>

      <View
        style={[
          styles.radio,
          selecionado && styles.radioSelecionado,
        ]}
      >
        {selecionado && <View style={styles.radioInterno} />}
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// TELA DE CONFIGURAÇÕES
// ============================================

export default function ConfiguracaoScreen() {
  const {
    tema,
    altoContraste,
    fonteGrande,
    notificacoes,
    som,
    alterar,
    alterarTema,
    cores,
    fonte,
  } = useConfiguracao();

  const { usuario, sair } = useUsuario();

  const styles = useMemo(
    () => criarEstilos(cores, fonte),
    [cores, fonte],
  );

  const coresGradiente = altoContraste
    ? [cores.primaria, cores.primaria] as const
    : [cores.primaria, escurecer(cores.primaria, 0.3)] as const;

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
            Personalize sua experiência no Techs.
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
        colors={coresGradiente}
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
              size={22}
              color="#FFFFFF"
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
            Sua conta Techs
          </Text>
        </View>

        <Ionicons
          name="settings-outline"
          size={110}
          color="rgba(255,255,255,0.12)"
          style={styles.perfilDecoracao}
        />

        <View style={styles.perfilBase} />
      </LinearGradient>

      {/* Aparência */}
      <Secao
        titulo="Aparência"
        icon="color-palette-outline"
        cores={cores}
        styles={styles}
      >
        <Text style={styles.secaoDescricao}>
          Escolha como deseja visualizar o aplicativo.
        </Text>

        <View style={styles.temasLista}>
          <OpcaoTema
            tema="claro"
            temaAtual={tema}
            titulo="Tema claro"
            descricao="Visual tradicional e iluminado"
            icon="sunny-outline"
            cores={cores}
            styles={styles}
            aoSelecionar={alterarTema}
          />

          <View style={styles.divisor} />

          <OpcaoTema
            tema="escuro"
            temaAtual={tema}
            titulo="Tema escuro"
            descricao="Cores escuras e mais suaves"
            icon="moon-outline"
            cores={cores}
            styles={styles}
            aoSelecionar={alterarTema}
          />
        </View>

        <View style={styles.temaAviso}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color={cores.textoSuave}
          />

          <Text style={styles.temaAvisoTexto}>
            O alto contraste pode ser ativado separadamente nas opções de acessibilidade.
          </Text>
        </View>
      </Secao>

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
            <Text style={styles.sairTexto}>
              Sair da conta
            </Text>

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
            size={20}
            color={cores.textoSuave}
          />
        </View>

        <Text style={styles.versao}>
          Techs · versão 1.0.0
        </Text>

        <Text style={styles.versaoDescricao}>
          Aprender, criar e evoluir!
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================
// ESTILOS
// ============================================

const criarEstilos = (
  c: Cores,
  f: (tamanho: number) => number,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.fundo,
    },

    content: {
      padding: 20,
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
      fontFamily: FONTES.titulo,
      fontSize: f(25),
      color: c.texto,
    },

    subtitulo: {
      fontFamily: FONTES.texto,
      fontSize: f(13),
      color: c.textoSuave,
      marginTop: 5,
      lineHeight: f(19),
    },

    headerIcone: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Perfil
    perfilCard: {
      borderRadius: 23,
      padding: 19,
      marginBottom: 23,
      overflow: 'hidden',
      minHeight: 145,
      justifyContent: 'space-between',
    },

    perfilTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 2,
    },

    avatar: {
      width: 58,
      height: 58,
      borderRadius: 19,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 13,
    },

    avatarLetra: {
      fontFamily: FONTES.destaque,
      fontSize: f(24),
      color: '#FFFFFF',
    },

    perfilInfo: {
      flex: 1,
      minWidth: 0,
    },

    perfilNome: {
      fontFamily: FONTES.titulo,
      fontSize: f(18),
      color: '#FFFFFF',
    },

    perfilEmail: {
      fontFamily: FONTES.texto,
      fontSize: f(12),
      color: '#FFFFFF',
      marginTop: 4,
      opacity: 0.92,
    },

    perfilSelo: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },

    perfilRodape: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.22)',
      marginTop: 17,
      paddingTop: 13,
      zIndex: 2,
    },

    perfilRodapeTexto: {
      fontFamily: FONTES.destaque,
      color: '#FFFFFF',
      fontSize: f(12),
    },

    perfilDecoracao: {
      position: 'absolute',
      right: -16,
      bottom: -25,
      transform: [{ rotate: '-15deg' }],
    },

    perfilBase: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 7,
      backgroundColor: 'rgba(0,0,0,0.12)',
    },

    // Seções
    secao: {
      backgroundColor: c.superficie,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: c.borda,
      padding: 16,
      marginBottom: 17,
    },

    secaoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },

    secaoIcone: {
      width: 35,
      height: 35,
      borderRadius: 12,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    secaoTitulo: {
      fontFamily: FONTES.titulo,
      fontSize: f(16),
      color: c.texto,
    },

    secaoDescricao: {
      fontFamily: FONTES.texto,
      fontSize: f(12),
      color: c.textoSuave,
      marginBottom: 12,
      lineHeight: f(18),
    },

    // Opções de aparência
    temasLista: {
      gap: 0,
    },

    temaOpcao: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 13,
      paddingHorizontal: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'transparent',
      gap: 11,
    },

    temaOpcaoSelecionada: {
      backgroundColor: c.iconeFundo,
      borderColor: c.primaria,
    },

    temaOpcaoIcone: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: c.fundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    temaOpcaoInfo: {
      flex: 1,
    },

    temaOpcaoTitulo: {
      fontFamily: FONTES.destaque,
      fontSize: f(14),
      color: c.texto,
    },

    temaOpcaoTituloSelecionado: {
      color: c.primaria,
    },

    temaOpcaoDescricao: {
      fontFamily: FONTES.texto,
      fontSize: f(12),
      color: c.textoSuave,
      marginTop: 4,
    },

    radio: {
      width: 21,
      height: 21,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: c.borda,
      alignItems: 'center',
      justifyContent: 'center',
    },

    radioSelecionado: {
      borderColor: c.primaria,
    },

    radioInterno: {
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: c.primaria,
    },

    temaAviso: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 7,
      paddingTop: 12,
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: c.borda,
    },

    temaAvisoTexto: {
      flex: 1,
      fontFamily: FONTES.texto,
      fontSize: f(11),
      color: c.textoSuave,
      lineHeight: f(17),
    },

    // Opções gerais
    opcaoLinha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      paddingVertical: 13,
    },

    opcaoIcone: {
      width: 41,
      height: 41,
      borderRadius: 14,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    opcaoInfo: {
      flex: 1,
      minWidth: 0,
    },

    opcaoTitulo: {
      fontFamily: FONTES.destaque,
      fontSize: f(14),
      color: c.texto,
    },

    opcaoDescricao: {
      fontFamily: FONTES.texto,
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
      paddingVertical: 7,
    },

    sairIcone: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: c.perigoFundo,
      alignItems: 'center',
      justifyContent: 'center',
    },

    sairInfo: {
      flex: 1,
    },

    sairTexto: {
      fontFamily: FONTES.destaque,
      color: c.perigo,
      fontSize: f(14),
    },

    sairDescricao: {
      fontFamily: FONTES.texto,
      color: c.textoSuave,
      fontSize: f(12),
      marginTop: 4,
    },

    // Rodapé
    versaoContainer: {
      alignItems: 'center',
      marginTop: 10,
      gap: 5,
    },

    versaoIcone: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor: c.iconeFundo,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },

    versao: {
      fontFamily: FONTES.destaque,
      textAlign: 'center',
      color: c.textoSuave,
      fontSize: f(12),
    },

    versaoDescricao: {
      fontFamily: FONTES.texto,
      color: c.textoSuave,
      fontSize: f(11),
    },
  });
