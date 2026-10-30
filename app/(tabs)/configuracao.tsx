import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import AppShell from '../../components/appshell';
import { useConfiguracao } from '../../context/ConfiguracaoContext';

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
  const { cores, fonte } = useConfiguracao();

  return (
    <View style={styles.opcaoLinha}>
      <View style={[styles.opcaoIcone, { backgroundColor: cores.iconeFundo }]}>
        <Ionicons name={icon} size={18} color={cores.primaria} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.opcaoTitulo, { color: cores.texto, fontSize: fonte(14) }]}>{titulo}</Text>
        <Text style={[styles.opcaoDescricao, { color: cores.textoSuave, fontSize: fonte(12) }]}>{descricao}</Text>
      </View>

      <Switch
        value={valor}
        onValueChange={aoMudar}
        trackColor={{ false: '#E0E0E0', true: cores.primariaClara }}
        thumbColor={valor ? cores.primaria : '#F5F5F5'}
      />
    </View>
  );
}

export default function ConfiguracaoScreen() {
  const router = useRouter();
  const { altoContraste, fonteGrande, notificacoes, som, alterar, cores, fonte } = useConfiguracao();

  function sair() {
    router.replace('/login');
  }

  // Estilo comum dos cartões de seção, que muda junto com o tema
  const secao = [styles.secao, { backgroundColor: cores.superficie, borderColor: cores.borda }];
  const secaoTitulo = [styles.secaoTitulo, { color: cores.textoSuave, fontSize: fonte(14) }];

  return (
    <AppShell titulo="Configuração" paginaAtiva="configuracao">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* PERFIL */}
        <View style={secao}>
          <View style={styles.perfilLinha}>
            <View style={[styles.avatar, { backgroundColor: cores.primaria }]}>
              <Text style={[styles.avatarLetra, { color: cores.textoPrimaria, fontSize: fonte(22) }]}>M</Text>
            </View>

            <View>
              <Text style={[styles.perfilNome, { color: cores.texto, fontSize: fonte(16) }]}>Maria Silva</Text>
              <Text style={[styles.perfilEmail, { color: cores.textoSuave, fontSize: fonte(13) }]}>maria@teste.com</Text>
            </View>
          </View>
        </View>

        {/* ACESSIBILIDADE */}
        <View style={secao}>
          <Text style={secaoTitulo}>Acessibilidade</Text>

          <OpcaoSwitch
            icon="contrast-outline"
            titulo="Alto contraste"
            descricao="Aumenta o contraste de cores da tela"
            valor={altoContraste}
            aoMudar={(valor) => alterar('altoContraste', valor)}
          />

          <OpcaoSwitch
            icon="text-outline"
            titulo="Fonte grande"
            descricao="Aumenta o tamanho da fonte da interface"
            valor={fonteGrande}
            aoMudar={(valor) => alterar('fonteGrande', valor)}
          />
        </View>

        {/* PREFERÊNCIAS */}
        <View style={secao}>
          <Text style={secaoTitulo}>Preferências</Text>

          <OpcaoSwitch
            icon="notifications-outline"
            titulo="Notificações"
            descricao="Receba alertas e lembretes"
            valor={notificacoes}
            aoMudar={(valor) => alterar('notificacoes', valor)}
          />

          <OpcaoSwitch
            icon="volume-medium-outline"
            titulo="Som"
            descricao="Ativa os sons de notificações"
            valor={som}
            aoMudar={(valor) => alterar('som', valor)}
          />
        </View>

        {/* CONTA */}
        <View style={secao}>
          <TouchableOpacity style={styles.sairButton} onPress={sair}>
            <Ionicons name="log-out-outline" size={20} color={cores.perigo} />
            <Text style={[styles.sairTexto, { color: cores.perigo, fontSize: fonte(14) }]}>Sair da conta</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.versao, { color: cores.textoSuave, fontSize: fonte(12) }]}>
          EducaTeach · versão 1.0.0
        </Text>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 25, paddingBottom: 40 },

  secao: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  secaoTitulo: {
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
  },

  perfilLinha: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetra: { fontWeight: 'bold' },
  perfilNome: { fontWeight: 'bold' },
  perfilEmail: { marginTop: 2 },

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
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoTitulo: { fontWeight: '600' },
  opcaoDescricao: { marginTop: 2 },

  sairButton: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sairTexto: { fontWeight: 'bold' },

  versao: { textAlign: 'center', marginTop: 8 },
});
