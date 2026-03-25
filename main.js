import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// USER ADMIN PADRÃO - SEGURANÇA E TUDO //
const ADMIN = { user: 'admin', senha: 'admin123', tipo: 'admin' };

export default function App() {
  const [tela, setTela] = useState('login');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);

  // CARREGAR DADOS
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const u = await AsyncStorage.getItem('usuarios');
    const a = await AsyncStorage.getItem('agendamentos');

    if (u) setUsuarios(JSON.parse(u));
    if (a) setAgendamentos(JSON.parse(a));
  };

  const salvarUsuarios = async (lista) => {
    setUsuarios(lista);
    await AsyncStorage.setItem('usuarios', JSON.stringify(lista));
  };

  const salvarAgendamentos = async (lista) => {
    setAgendamentos(lista);
    await AsyncStorage.setItem('agendamentos', JSON.stringify(lista));
  };

  // BOTÃO VOLTAR
  useEffect(() => {
    const back = () => {
      if (tela === 'adminPanel' || tela === 'agenda') {
        setTela('menu');
        return true;
      }
      if (tela === 'menu') {
        setTela('login');
        return true;
      }
      return false;
    };

    const handler = BackHandler.addEventListener('hardwareBackPress', back);
    return () => handler.remove();
  }, [tela]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {tela === 'login' && (
        <TelaLogin
          usuarios={usuarios}
          onLogin={(user) => {
            setUsuarioLogado(user);
            setTela('menu');
          }}
        />
      )}

      {tela === 'menu' && (
        <Menu
          user={usuarioLogado}
          irAdmin={() => setTela('adminPanel')}
          irAgenda={() => setTela('agenda')}
          sair={() => setTela('login')}
        />
      )}

      {tela === 'adminPanel' && (
        <AdminPanel
          usuarios={usuarios}
          salvarUsuarios={salvarUsuarios}
          voltar={() => setTela('menu')}
        />
      )}

      {tela === 'agenda' && (
        <Agenda
          user={usuarioLogado}
          agendamentos={agendamentos}
          salvarAgendamentos={salvarAgendamentos}
          voltar={() => setTela('menu')}
        />
      )}
    </SafeAreaView>
  );
}

// Tela de LOGIN
const TelaLogin = ({ usuarios, onLogin }) => {
  const [user, setUser] = useState('');
  const [senha, setSenha] = useState('');

  const logar = () => {
    if (user === ADMIN.user && senha === ADMIN.senha) {
      onLogin(ADMIN);
      return;
    }

    const encontrado = usuarios.find(
      (u) => u.user === user && u.senha === senha
    );

    if (encontrado) {
      onLogin(encontrado);
    } else {
      Alert.alert('Erro', 'Login inválido');
    }
  };

  return (
    <View style={styles.center}>
      <Text style={styles.title}>DemandFlow</Text>

      <TextInput
        placeholder="Usuário"
        style={styles.input}
        onChangeText={setUser}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        style={styles.input}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.btn} onPress={logar}>
        <Text style={styles.btnText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

// MENU
const Menu = ({ user, irAdmin, irAgenda, sair }) => (
  <View style={styles.center}>
    <Text style={styles.title}>Bem-vindo {user?.user || ''}</Text>

    {user.tipo === 'admin' && (
      <TouchableOpacity style={styles.card} onPress={irAdmin}>
        <Text>👑 Gerenciar Funcionários</Text>
      </TouchableOpacity>
    )}

    <TouchableOpacity style={styles.card} onPress={irAgenda}>
      <Text>📅 Agenda</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.btn} onPress={sair}>
      <Text style={styles.btnText}>Sair</Text>
    </TouchableOpacity>
  </View>
);

// ADMIN PANEL
const AdminPanel = ({ usuarios, salvarUsuarios, voltar }) => {
  const [novoUser, setNovoUser] = useState('');
  const [senha, setSenha] = useState('');

  const cadastrar = () => {
    if (!novoUser || !senha) return Alert.alert('Erro');

    const novo = { user: novoUser, senha, tipo: 'funcionario' };
    salvarUsuarios([...usuarios, novo]);

    setNovoUser('');
    setSenha('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={voltar}>
        <Text style={styles.voltar}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Cadastrar Funcionário</Text>

      <TextInput
        placeholder="Usuário"
        style={styles.input}
        value={novoUser}
        onChangeText={setNovoUser}
      />
      <TextInput
        placeholder="Senha"
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.btn} onPress={cadastrar}>
        <Text style={styles.btnText}>Cadastrar</Text>
      </TouchableOpacity>

      <FlatList
        data={usuarios}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => <Text>{item.user}</Text>}
      />
    </View>
  );
};

// TELA DE AGENDA
const Agenda = ({ user, agendamentos, salvarAgendamentos, voltar }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [valor, setValor] = useState('');

  const salvar = () => {
    if (!nome || !telefone || !dataHora || !valor) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const novo = {
      id: Date.now().toString(),
      user: user.user,
      nome,
      telefone,
      dataHora,
      valor,
      timestamp: Date.now(),
    };

    salvarAgendamentos([novo, ...agendamentos]);

    setNome('');
    setTelefone('');
    setDataHora('');
    setValor('');
  };

  // ADMIN vê tudo / funcionário só o dele
  const lista =
    user.tipo === 'admin'
      ? [...agendamentos].sort((a, b) => b.timestamp - a.timestamp)
      : agendamentos
          .filter((a) => a.user === user.user)
          .sort((a, b) => b.timestamp - a.timestamp);
  return (
    <View style={styles.container}>
      {/* VOLTAR */}
      <TouchableOpacity onPress={voltar}>
        <Text style={styles.voltar}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Agenda</Text>

      {/* FORM */}
      <TextInput
        placeholder="Nome do Cliente"
        style={styles.input}
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        placeholder="Telefone"
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Data/Hora (ex: 25/03 14:00)"
        style={styles.input}
        value={dataHora}
        onChangeText={setDataHora}
      />
      <TextInput
        placeholder="Valor (R$)"
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.btn} onPress={salvar}>
        <Text style={styles.btnText}>Salvar Agendamento</Text>
      </TouchableOpacity>

      {/* TABELA HEADER */}
      <View style={styles.tableHeader}>
        <Text style={[styles.th, { flex: 1.2 }]}>Colab</Text>
        <Text style={[styles.th, { flex: 1.5 }]}>Cliente</Text>
        <Text style={[styles.th, { flex: 1.2 }]}>Contato</Text>
        <Text style={[styles.th, { flex: 1.2 }]}>Data</Text>
        <Text style={[styles.th, { flex: 1 }]}>Valor</Text>
      </View>

      {/* LISTA */}
      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            {/* COLABORADOR */}
            <View style={{ flex: 1.2 }}>
              <Text style={styles.sub}>{item.user}</Text>
            </View>

            {/* CLIENTE */}
            <View style={{ flex: 1.5 }}>
              <Text style={styles.nome}>{item.nome}</Text>
            </View>

            {/* CONTATO */}
            <View style={{ flex: 1.2 }}>
              <Text style={styles.text}>{item.telefone}</Text>
            </View>

            {/* DATA */}
            <View style={{ flex: 1.2 }}>
              <Text style={styles.text}>{item.dataHora}</Text>
            </View>

            {/* VALOR */}
            <View style={{ flex: 1 }}>
              <Text style={styles.valor}>R$ {item.valor}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 30, color: '#999' }}>
            Nenhum agendamento
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', padding: 20 },

  container: { flex: 1, padding: 20 },

  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },

  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },

  btn: {
    backgroundColor: '#27AE60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  card: {
    padding: 15,
    backgroundColor: '#eee',
    marginBottom: 10,
    borderRadius: 10,
  },

  voltar: {
    color: 'blue',
    marginBottom: 10,
  },

  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F2F6',
    padding: 10,
    marginTop: 15,
    borderRadius: 8,
  },

  th: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7F8C8D',
  },

  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center',
  },

  nome: {
    fontWeight: 'bold',
    fontSize: 14,
  },

  sub: {
    fontSize: 11,
    color: '#999',
  },

  text: {
    fontSize: 13,
  },

  valor: {
    fontWeight: 'bold',
    color: '#27AE60',
  },
});
