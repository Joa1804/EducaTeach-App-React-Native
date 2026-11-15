import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { DrawerContentScrollView, type DrawerContentComponentProps } from 'expo-router/drawer';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DRAWER_MENU_ITEMS,
  DRAWER_SETTINGS_ITEM,
  type DrawerMenuItem,
} from '@/constants/navigation';
import { useConfiguracao, type Cores } from '@/context/ConfiguracaoContext';
import { useUsuario } from '@/context/UsuarioContext';

/** Converte o href do item no pathname que o Expo Router reporta ('/' para index). */
function caminhoDoItem(item: DrawerMenuItem): string {
  return typeof item.href === 'string' ? item.href : item.href.pathname;
}

/**
 * Conteúdo do menu lateral: logo, itens de navegação, usuário da sessão,
 * botão de sair e acesso às configurações.
 */
export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { navigation } = props;
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { cores, fonte } = useConfiguracao();
  const { usuario, sair } = useUsuario();
  const [saindo, setSaindo] = useState(false);
  const saindoRef = useRef(false);

  function navegar(item: DrawerMenuItem) {
    // closeDrawer não tem efeito no modo permanente, então pode ser chamado sempre.
    navigation.closeDrawer();
    if (caminhoDoItem(item) !== pathname) {
      router.navigate(item.href);
    }
  }

  async function handleSair() {
    // Ref evita duplo envio antes de o estado `saindo` ser aplicado.
    if (saindoRef.current) return;
    saindoRef.current = true;
    setSaindo(true);
    try {
      // O guard do layout raiz leva ao login assim que a sessão é encerrada.
      await sair();
    } catch (error: unknown) {
      console.error('Erro ao encerrar a sessão:', error);
    } finally {
      saindoRef.current = false;
      setSaindo(false);
    }
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
        {/* LOGO */}
        <View style={styles.logoArea}>
          <View style={[styles.logoIcon, { backgroundColor: cores.primaria }]}>
            <Ionicons name="code-slash" size={24} color={cores.textoPrimaria} />
          </View>
          <Text style={[styles.logoText, { color: cores.primaria, fontSize: fonte(20) }]}>
            EducaTeach
          </Text>
        </View>

        {/* MENU */}
        <View style={styles.menu}>
          {DRAWER_MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.name}
              item={item}
              ativo={caminhoDoItem(item) === pathname}
              onPress={navegar}
              cores={cores}
              fonte={fonte}
            />
          ))}
        </View>
      </DrawerContentScrollView>

      {/* RODAPÉ */}
      <View style={styles.footer}>
        {usuario && (
          <Text numberOfLines={1} style={[styles.usuarioNome, { color: cores.texto, fontSize: fonte(13) }]}>
            {usuario.nome}
          </Text>
        )}

        <Pressable
          style={[styles.item, { backgroundColor: cores.iconeFundo }, saindo && styles.desabilitado]}
          onPress={handleSair}
          disabled={saindo}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          accessibilityState={{ busy: saindo, disabled: saindo }}
        >
          {saindo ? (
            <ActivityIndicator size="small" color={cores.primaria} />
          ) : (
            <Ionicons name="log-out-outline" size={21} color={cores.primaria} />
          )}
          <Text style={[styles.itemText, styles.sairText, { color: cores.primaria, fontSize: fonte(14) }]}>
            Sair
          </Text>
        </Pressable>

        <MenuItem
          item={DRAWER_SETTINGS_ITEM}
          ativo={caminhoDoItem(DRAWER_SETTINGS_ITEM) === pathname}
          onPress={navegar}
          cores={cores}
          fonte={fonte}
        />
      </View>
    </View>
  );
}

type MenuItemProps = {
  item: DrawerMenuItem;
  ativo: boolean;
  onPress: (item: DrawerMenuItem) => void;
  cores: Cores;
  fonte: (tamanho: number) => number;
};

function MenuItem({ item, ativo, onPress, cores, fonte }: MenuItemProps) {
  const cor = ativo ? cores.textoPrimaria : cores.textoSuave;

  return (
    <Pressable
      style={[styles.item, ativo && { backgroundColor: cores.primaria }]}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      accessibilityState={{ selected: ativo }}
    >
      <Ionicons name={item.icon} size={21} color={cor} />
      <Text
        style={[
          styles.itemText,
          { color: cor, fontSize: fonte(14), fontWeight: ativo ? 'bold' : '500' },
        ]}
      >
        {item.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
  },
  scroll: {
    paddingTop: 20,
    paddingStart: 0,
    paddingEnd: 0,
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
  footer: {
    gap: 8,
    paddingTop: 12,
  },
  usuarioNome: {
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  itemText: {
    marginLeft: 12,
  },
  sairText: {
    fontWeight: 'bold',
  },
  desabilitado: {
    opacity: 0.7,
  },
});
