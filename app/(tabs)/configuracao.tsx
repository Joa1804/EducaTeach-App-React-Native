import { ScrollView, StyleSheet, View, Text, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppShell from '../../components/appshell';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

function OpcaoSwitch({
  icon,
  titulo,
  descricao,
  valor,
  aoMudar,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descricao: string;
  valor: boolean;
  aoMudar: (value: boolean) => void;
}) {
  return (
    <View style={styles.opcaoLinha}>
      <View style={styles.opcaoIcone}>
        <Ionicons name={icon} size={18} color={PURPLE} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.opcaoTitulo}>{titulo}</Text>
        <Text style={styles.opcaoDescricao}>{descricao}</Text>
      </View>

      <Switch
        value={valor}
        onValueChange={aoMudar}
        trackColor={{ false: '#E0E0E0', true: '#D1C4E9' }}
        thumbColor={valor ? '#673AB7' : '#F5F5F5'}
      />
    </View>
  );
}

export default function ConfiguracaoScreen() {
  const router = useRouter();

  const [altoContraste, setAltoContraste] = useState(false);
  const [fonteGrande, setFonteGrande] = useState(false);
  const [notificacoes, setNotificacoes] = useState(true);
  const [som, setSom] = useState(true);

  function sair() {
    router.replace('/login');
  }

  return (
    <AppShell titulo="configuração" paginaAtiva="configuracao">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* PERFIL */}
        <View style={styles.secao}>
          <View style={styles.perfilLinha}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetra}>M</Text>
            </View>

            <View>
              <Text style={styles.perfilNome}>Maria Silva</Text>
              <Text style={styles.perfilEmail}>Maria@Test.com</Text>
            </View>
          </View>
        </View>


        {/* ACESSIBILIDADE */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Acessabilidade</Text>

          <OpcaoSwitch
            icon="contrast-outline"
            titulo="Alto contraste"
            descricao="Aumenta o contraste de cores da tela"
            valor={altoContraste}
            aoMudar={setAltoContraste}
          />

          <OpcaoSwitch
            icon="text-outline"
            titulo="Fonte grande"
            descricao="Aumenta o tamanho da fonte da interface"
            valor={fonteGrande}
            aoMudar={setFonteGrande}
          />
        </View>

        {/* PREFERÊNCIAS */}
        <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Preferências</Text>

             <OpcaoSwitch
            icon="notifications-outline"
            titulo="Notificações"
            descricao="Receba alertas e lembretes"
            valor={notificacoes}
            aoMudar={setNotificacoes}
          />

          <OpcaoSwitch
            icon="volume-medium-outline"
            titulo="Som"
            descricao="Ativa os sons de notificações"
            valor={som}
            aoMudar={setSom}
            />
        </View>


        {/* CONTA */}
      <View style={styles.secao}>
          <TouchableOpacity style={styles.sairButton} onPress={sair}>
            <Ionicons name="log-out-outline" size={20} color="#E53935" />
            <Text style={styles.sairTexto}>Sair da conta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versao}>EducaTeach · versão 1.0.0</Text>
      </ScrollView>
    </AppShell>
  );
}

const PURPLE = '#673AB7';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 25, paddingBottom: 40 },

  secao: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  secaoTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#757575',
    marginBottom: 12,
    textTransform: 'uppercase',
  },

  perfilLinha: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetra: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  perfilNome: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  perfilEmail: { fontSize: 13, color: '#757575', marginTop: 2 },

  opcaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  opcaoIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EDE7F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoTitulo: { fontSize: 14, fontWeight: '600', color: '#212121' },
  opcaoDescricao: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },

  sairButton: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sairTexto: { color: '#E53935', fontWeight: 'bold', fontSize: 14 },

  versao: { textAlign: 'center', color: '#B0B0B8', fontSize: 12, marginTop: 8 },
});