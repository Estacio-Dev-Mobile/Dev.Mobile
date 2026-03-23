import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, Alert, SafeAreaView 
} from 'react-native';

//  MENU PRINCIPAL
const TelaSelecao = ({ aoSelecionar }) => (
  <View style={styles.contentSelecao}>
    <Text style={styles.tituloLogo}>DemandFlow</Text>
    <Text style={styles.subtitulo}>Escolha o setor de atendimento:</Text>
    <View style={styles.grid}>
      {[
        { tipo: 'Barbeiro', emoji: '💈' },
        { tipo: 'Salão de Beleza', emoji: '💇‍♀️' },
        { tipo: 'Manicure', emoji: '💅' }
      ].map((item) => (
        <TouchableOpacity 
          key={item.tipo} 
          style={styles.cardEscolha} 
          onPress={() => aoSelecionar(item.tipo)}
        >
          <Text style={styles.emojiCard}>{item.emoji}</Text>
          <Text style={styles.cardTexto}>{item.tipo}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// PAINEL  DE GESTÃO 
const TelaAdmin = ({ perfil, agendamentos, setAgendamentos, aoVoltar }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [servico, setServico] = useState('');
  const [valor, setValor] = useState('');
  const [dataHora, setDataHora] = useState('');

  const salvarAgendamento = () => {
    if (!nome || !servico || !valor || !dataHora) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    const novo = {
      id: Date.now().toString(),
      perfilPertencente: perfil, // Perfil vendedor
      nome,
      telefone,
      servico,
      valor,
      dataHora,
      timestamp: Date.now()
    };

    setAgendamentos([novo, ...agendamentos]);
    setNome(''); setTelefone(''); setServico(''); setValor(''); setDataHora('');
  };

  // mostrar os agendamentos 
  const agendamentosFiltrados = agendamentos
    .filter(item => item.perfilPertencente === perfil)
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.headerAdmin}>
        <TouchableOpacity onPress={aoVoltar} style={styles.btnVoltar}>
          <Text style={styles.voltarLink}>← Mudar Setor</Text>
        </TouchableOpacity>
        <Text style={styles.tituloAdmin}>{perfil}</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput style={styles.input} placeholder="Nome do Cliente" value={nome} onChangeText={setNome} />
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1.5, marginRight: 10 }]} placeholder="Data/Hora" value={dataHora} onChangeText={setDataHora} />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Telefone" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />
        </View>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 2, marginRight: 10 }]} placeholder="Serviço" value={servico} onChangeText={setServico} />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="R$" keyboardType="numeric" value={valor} onChangeText={setValor} />
        </View>
        <TouchableOpacity style={styles.botaoSalvar} onPress={salvarAgendamento}>
          <Text style={styles.botaoTexto}>Confirmar no {perfil}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabelaHeader}>
        <Text style={styles.tabelaHeaderTexto}>HORÁRIO / CLIENTE</Text>
        <Text style={styles.tabelaHeaderTexto}>SERVIÇO</Text>
        <Text style={[styles.tabelaHeaderTexto, { textAlign: 'right' }]}>VALOR</Text>
      </View>

      <FlatList 
        data={agendamentosFiltrados}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.tabelaLinha}>
            <View style={{ flex: 1.5 }}>
              <Text style={styles.tabelaData}>{item.dataHora}</Text>
              <Text style={styles.tabelaTextoNome}>{item.nome}</Text>
            </View>
            <View style={{ flex: 1.5 }}>
              <Text style={styles.tabelaTextoServico}>{item.servico}</Text>
              <Text style={styles.tabelaTextoSub}>{item.telefone}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.tabelaTextoValor}>R$ {item.valor}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum agendamento para {perfil}.</Text>}
      />
    </KeyboardAvoidingView>
  );
};

//  Componete principal
export default function App() {
  const [perfilAtivo, setPerfilAtivo] = useState(null);
  // lista de agendamentos 
  const [todosAgendamentos, setTodosAgendamentos] = useState([]);

  return (
    <SafeAreaView style={styles.container}>
      {!perfilAtivo ? (
        <TelaSelecao aoSelecionar={setPerfilAtivo} />
      ) : (
        <TelaAdmin 
          perfil={perfilAtivo} 
          agendamentos={todosAgendamentos} 
          setAgendamentos={setTodosAgendamentos}
          aoVoltar={() => setPerfilAtivo(null)} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  contentSelecao: { flex: 1, justifyContent: 'center', padding: 30 },
  tituloLogo: { fontSize: 42, fontWeight: '900', color: '#1A1A1A', textAlign: 'center', letterSpacing: -1 },
  subtitulo: { textAlign: 'center', color: '#666', marginBottom: 40, fontSize: 16 },
  grid: { gap: 15 },
  cardEscolha: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 25, borderRadius: 18, borderWidth: 1, borderColor: '#EEE' },
  emojiCard: { fontSize: 32, marginRight: 20 },
  cardTexto: { fontSize: 19, fontWeight: 'bold', color: '#333' },
  headerAdmin: { padding: 20, borderBottomWidth: 1, borderColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF' },
  voltarLink: { color: '#3498DB', fontWeight: 'bold', fontSize: 14 },
  tituloAdmin: { fontSize: 18, fontWeight: '800', color: '#2C3E50' },
  formContainer: { padding: 15, backgroundColor: '#F9FBFD', borderBottomWidth: 1, borderColor: '#EEE' },
  row: { flexDirection: 'row' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DCDDE1', padding: 12, borderRadius: 10, marginBottom: 10 },
  botaoSalvar: { backgroundColor: '#27AE60', padding: 16, borderRadius: 10, alignItems: 'center' },
  botaoTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  tabelaHeader: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#F1F2F6' },
  tabelaHeaderTexto: { flex: 1, fontSize: 10, fontWeight: 'bold', color: '#95A5A6' },
  tabelaLinha: { flexDirection: 'row', padding: 18, borderBottomWidth: 1, borderColor: '#F0F0F0', alignItems: 'center' },
  tabelaData: { fontSize: 11, color: '#3498DB', fontWeight: 'bold' },
  tabelaTextoNome: { fontSize: 15, fontWeight: 'bold', color: '#2C3E50' },
  tabelaTextoSub: { fontSize: 12, color: '#95A5A6' },
  tabelaTextoServico: { fontSize: 14, color: '#34495E' },
  tabelaTextoValor: { fontSize: 15, fontWeight: 'bold', color: '#27AE60' },
  vazio: { textAlign: 'center', marginTop: 50, color: '#BDC3C7' }
});