import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { useConfiguracao, type Cores, } from '../context/ConfiguracaoContext';

const PURPLE = '#673AB7';

type AppShellProps = {
  titulo: string;
  paginaAtiva:
    | 'inicio'
    | 'aprender'
    | 'projetos'
    | 'desafios'
    | 'ranking'
    | 'ajuda'
    | 'configuracao'
    | 'forum';
  children: ReactNode;
};

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  ativo?: boolean;
  rota: Href;
  cores: Cores;
  fonte: (tamanho: number) => number;
};

export default function AppShell({ titulo, paginaAtiva, children, }: AppShellProps) {
  const [menuAberto, setMenuAberto] = useState(true);
  const router = useRouter();
  const { cores, fonte } = useConfiguracao();

   return (
    <View style={[ styles.app, { backgroundColor: cores.fundo },]}>

      {/* MENU LATERAL */}
      {menuAberto && (<View style={[ styles.sidebar, { backgroundColor: cores.superficie, borderRightColor: cores.borda,},]}>

          {/* LOGO */}
          <View style={styles.logoArea}>
            <View style={[ styles.logoIcon, { backgroundColor: cores.primaria },]}>
              <Ionicons name="code-slash" size={24} color={cores.textoPrimaria}/>
            </View>

            <Text style={[ styles.logoText, { color: cores.primaria, fontSize: fonte(20),},]}>
              EducaTeach
            </Text>
          </View>

          {/* MENU */}
          <View style={styles.menu}>
            <MenuItem icon="home" title="Início" ativo={paginaAtiva === 'inicio'} rota="/" cores={cores} fonte={fonte} />
            <MenuItem icon="book" title="Aprender"  ativo={paginaAtiva === 'aprender'} rota="/(tabs)/aprede" cores={cores} fonte={fonte}/>
            <MenuItem icon="chatbubbles" title="Fórum" ativo={paginaAtiva === 'forum'} rota="/(tabs)/Forum" cores={cores} fonte={fonte}/>
            <MenuItem icon="folder-open" title="Meus Projetos" ativo={paginaAtiva === 'projetos'} rota="/(tabs)/projetos" cores={cores} fonte={fonte}/>
            <MenuItem icon="podium" title="Ranking" ativo={paginaAtiva === 'ranking'} rota="/(tabs)/ranking" cores={cores} fonte={fonte}/>
            <MenuItem icon="help-circle" title="Ajuda" ativo={paginaAtiva === 'ajuda'} rota="/(tabs)/ajudar" cores={cores} fonte={fonte}/>
          </View>

          {/* RODAPÉ */}
          <View style={styles.sidebarFooter}>

            {/* LOGIN */}
            <TouchableOpacity
              style={[ styles.loginButton, { backgroundColor: cores.iconeFundo },]} onPress={() => router.push('/login')}>

              <Ionicons name="log-in-outline" size={21} color={cores.primaria}/>

              <Text style={[ styles.loginText, { color: cores.primaria,fontSize: fonte(14),},]}>
                Entrar
              </Text>
            </TouchableOpacity>

            {/* CONFIGURAÇÃO */}
            <TouchableOpacity style={[ styles.configButton, paginaAtiva === 'configuracao' && { backgroundColor: cores.primaria,},]} onPress={() => router.push('/configuracao')}>
              <Ionicons name="settings-outline" size={20} color={ paginaAtiva === 'configuracao' ? cores.textoPrimaria : cores.textoSuave}/>

              <Text style={[ styles.footerText, { color: paginaAtiva === 'configuracao' ? cores.textoPrimaria : cores.textoSuave, fontSize: fonte(13), fontWeight:  paginaAtiva === 'configuracao'  ? 'bold' : 'normal',},]}>
                Configuração
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      )}


      {/* ÁREA PRINCIPAL */}
      <View style={[ styles.main, { backgroundColor: cores.fundo },]}>

        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: cores.superficie, borderBottomColor: cores.borda,},]}>
          <TouchableOpacity onPress={() => setMenuAberto(!menuAberto)} style={styles.menuButton}>
            <Ionicons name={menuAberto ? 'menu' : 'menu-outline'} size={26} color={cores.primaria}/>
          </TouchableOpacity>

          <Text style={[ styles.headerTitle,{ color: cores.texto, fontSize: fonte(22),},]}>
            {titulo}
          </Text>
        </View>

        {/* CONTEÚDO DA PÁGINA */}
        {children}
      </View>
    </View>
  );
}

function MenuItem({ icon, title, ativo = false, rota, cores, fonte }: MenuItemProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.menuItem, ativo && { backgroundColor: cores.primaria }]}
      onPress={() => router.push(rota)}
    >
      <Ionicons name={icon} size={21} color={ativo ? cores.textoPrimaria : cores.textoSuave} />
      <Text style={[
        styles.menuItemText,
        {
          color: ativo ? cores.textoPrimaria : cores.textoSuave,
          fontSize: fonte(14),
          fontWeight: ativo ? 'bold' : '500',
        },
      ]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  app: {
    flex: 1,
    flexDirection: 'row',
  },

  sidebar: {
    width: 220,
    borderRightWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 40,
    paddingBottom: 20,
  },

  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 35,
  },

  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  logoText: {
    fontWeight: 'bold',
  },

  menu: {
    gap: 7,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  menuItemText: {
    marginLeft: 12,
  },

  sidebarFooter: {
    marginTop: 'auto',
    gap: 8,
  },

  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  loginText: {
    marginLeft: 12,
    fontWeight: 'bold',
  },

  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },

  footerText: {
    marginLeft: 12,
  },

  main: {
    flex: 1,
  },

  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },

  menuButton: {
    marginRight: 15,
  },

  headerTitle: {
    fontWeight: 'bold',
  },

});