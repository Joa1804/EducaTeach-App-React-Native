import { View, Text, StyleSheet, TouchableOpacity,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import React from 'react';

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
    | 'configuracao';
  children: ReactNode;
};

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  ativo?: boolean;
  rota: Href;
};

export default function AppShell({ titulo, paginaAtiva, children, }: AppShellProps) {
  const [menuAberto, setMenuAberto] = useState(true);
  const router = useRouter();

  return (
    <View style={styles.app}>
      {/*MENU LATERAL */}
      {menuAberto && (
        <View style={styles.sidebar}>

          {/* LOGO */}
          <View style={styles.logoArea}>
            <View style={styles.logoIcon}>
              <Ionicons name="code-slash" size={24} color="#fff"/>
            </View>
            <Text style={styles.logoText}>
              EducaTeach
            </Text>
          </View>

          {/* MENU */}
          <View style={styles.menu}>
            <MenuItem icon="home" title="Início" ativo={paginaAtiva === 'inicio'} rota="/" />
            <MenuItem icon="book" title="Aprender" ativo={paginaAtiva === 'aprender'} rota="/aprede"/>
            <MenuItem icon="folder-open" title="Meus Projetos" ativo={paginaAtiva === 'projetos'} rota="/projetos"/>
            <MenuItem icon="trophy" title="Desafios" ativo={paginaAtiva === 'desafios'} rota="/desafios" />
            <MenuItem icon="podium" title="Ranking" ativo={paginaAtiva === 'ranking'} rota="/ranking" />
            <MenuItem icon="help-circle" title="Ajuda" ativo={paginaAtiva === 'ajuda'} rota="/ajudar" />
          </View>

          {/* RODAPÉ */}
          <View style={styles.sidebarFooter}>

            {/* LOGIN */}
            <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
              <Ionicons name="log-in-outline" size={21} color={PURPLE} />
              <Text style={styles.loginText}> Entrar </Text> 
            </TouchableOpacity>
          </View>

          {/* CONFIGURAÇÃO */}
          <TouchableOpacity
            style={[styles.configButton, paginaAtiva === 'configuracao' && styles.menuItemAtivo]}
            onPress={() => router.push('/configuracao')}
          >
            <Ionicons name="settings-outline" size={20} color={paginaAtiva === 'configuracao' ? '#fff' : '#757575'} />
            <Text style={[styles.footerText, paginaAtiva === 'configuracao' && styles.menuItemTextAtivo]}> Configuração </Text>
          </TouchableOpacity>
        </View>
      )}

      {/*ÁREA PRINCIPAL*/}
      <View style={styles.main}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuAberto(!menuAberto)} style={styles.menuButton} >
            <Ionicons name={ menuAberto ? 'menu' : 'menu-outline'} size={26} color={PURPLE} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {titulo}
          </Text>

        </View>

        {/* CONTEÚDO DA PÁGINA */}
        {children}

      </View>
    </View>
  );
}

function MenuItem({ icon, title, ativo = false, rota,}: MenuItemProps) {
  const router = useRouter();

  return (
    <TouchableOpacity style={[ styles.menuItem, ativo && styles.menuItemAtivo,]} onPress={() => router.push(rota)}>
      <Ionicons name={icon} size={21} color={ ativo ? '#fff' : '#555'} />
      <Text style={[ styles.menuItemText, ativo && styles.menuItemTextAtivo,]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  app: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F7',
  },

  sidebar: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
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
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PURPLE,
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

  menuItemAtivo: {
    backgroundColor: PURPLE,
  },

  menuItemText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },

  menuItemTextAtivo: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  sidebarFooter: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  footerText: {
    marginLeft: 12,
    color: '#757575',
    fontSize: 13,
  },

  main: {
    flex: 1,
  },

  header: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },

  menuButton: {
    marginRight: 15,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
  },

 loginButton: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  paddingVertical: 13, 
  paddingHorizontal: 12, 
  borderRadius: 12, 
  backgroundColor: '#EDE7F6', 
  marginBottom: 8, 
}, 

  loginText: { 
    marginLeft: 12, 
    fontSize: 14, 
    color: PURPLE, 
    fontWeight: 'bold', 
  }, 

    configButton: { 
      flexDirection: 'row',
       alignItems: 'center', 
       paddingHorizontal: 12, 
       paddingVertical: 12, 
      },  

});