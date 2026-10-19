import { useState, useEffect } from 'react';
import { Alert, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

export default function Aplicativo() {
  let [tela, setTela] = useState('novo');
  let [titulo, setTitulo] = useState('');
  let [descricao, setDescricao] = useState('');
  let [horario, setHorario] = useState('');
  let [repeticao, setRepeticao] = useState('diaria');
  let [lembretes, setLembretes] = useState<any[]>([]);

  function calcularProximo(horarioDigitado: string) {
    let partes = horarioDigitado.split(':');
    let data = new Date();
    data.setHours(Number(partes[0]));
    data.setMinutes(Number(partes[1]));
    data.setSeconds(0);
    // se o horario de hoje ja passou, vai para amanha
    if (data.getTime() <= Date.now()) {
      return data.getTime() + 86400000;
    }
    return data.getTime();
  }

  function removerLembrete(id: number) {
    setLembretes(function (listaAtual) {
      let novaLista = [];
      for (let i = 0; i < listaAtual.length; i++) {
        if (listaAtual[i].id != id) {
          novaLista.push(listaAtual[i]);
        }
      }
      return novaLista;
    });
  }

  function mudarProximo(id: number, novoProximo: number) {
    setLembretes(function (listaAtual) {
      let novaLista = [];
      for (let i = 0; i < listaAtual.length; i++) {
        if (listaAtual[i].id == id) {
          novaLista.push({ ...listaAtual[i], proximo: novoProximo });
        } else {
          novaLista.push(listaAtual[i]);
        }
      }
      return novaLista;
    });
  }

  function concluirLembrete(lembrete: any) {
    if (lembrete.repeticao == 'diaria') {
      mudarProximo(lembrete.id, calcularProximo(lembrete.horario));
    } else {
      removerLembrete(lembrete.id);
    }
  }

  useEffect(function () {
    let intervalo = setInterval(function () {
      for (let i = 0; i < lembretes.length; i++) {
        let lembrete = lembretes[i];
        if (lembrete.proximo <= Date.now()) {
          mudarProximo(lembrete.id, Infinity); // evita alerta repetido
          Alert.alert(lembrete.titulo, lembrete.descricao, [
            { text: 'Concluir', onPress: () => concluirLembrete(lembrete) },
            { text: 'Adiar 10 min', onPress: () => mudarProximo(lembrete.id, Date.now() + 600000) },
          ], { cancelable: false });
          break; 
        }
      }
    }, 1000);
    return function () {
      clearInterval(intervalo);
    };
  }, [lembretes]);

  function agendarLembrete() {
    if (titulo == '') {
      Alert.alert('Digite o título');
      return;
    }
    let hora = Number(horario.split(':')[0]);
    let minuto = Number(horario.split(':')[1]);
    if (horario.length != 5 || horario[2] != ':' || isNaN(hora) || isNaN(minuto) || hora > 23 || minuto > 59) {
      Alert.alert('Horário inválido, use HH:MM (exemplo 08:00)');
      return;
    }
    let novoLembrete = { id: Date.now(), titulo: titulo, descricao: descricao, repeticao: repeticao, horario: horario, proximo: calcularProximo(horario) };
    setLembretes(lembretes.concat([novoLembrete]));
    setTitulo('');
    setDescricao('');
    setTela('agendados');
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.textoCabecalho}>Lista de Lembretes</Text>
      </View>

      <View style={styles.conteudo}>
        {tela == 'novo' && (
          <View>
            <Text style={styles.rotulo}>Titulo:</Text>
            <TextInput style={styles.campo} value={titulo} onChangeText={setTitulo} />
            <Text style={styles.rotulo}>Descrição:</Text>
            <TextInput style={styles.campo} value={descricao} onChangeText={setDescricao} />
            <Text style={styles.rotulo}>Horario:*</Text>
            <TextInput style={styles.campo} value={horario} onChangeText={setHorario} placeholder="08:00" />
            <Text style={styles.aviso}>*Coloque o horário que está no celular, e se estiver por exemplo 08:00 da noite, coloque "20:00"</Text>
            <Text style={styles.rotulo}>Repetição diaria?</Text>
            <Pressable style={styles.opcao} onPress={() => setRepeticao('diaria')}>
              <View style={repeticao == 'diaria' ? styles.bolinhaSelecionada : styles.bolinha} />
              <Text style={styles.textoOpcao}>Sim</Text>
            </Pressable>
            <Pressable style={styles.opcao} onPress={() => setRepeticao('unica')}>
              <View style={repeticao == 'unica' ? styles.bolinhaSelecionada : styles.bolinha} />
              <Text style={styles.textoOpcao}>Não</Text>
            </Pressable>
            <Pressable style={styles.botaoAgendar} onPress={agendarLembrete}>
              <Text style={styles.textoBotaoAgendar}>Agendar</Text>
            </Pressable>
          </View>
        )}

        {tela == 'agendados' && (
          <View>
            {lembretes.map(function (lembrete) {
              return (
                <View key={lembrete.id} style={styles.cartao}>
                  <View>
                    <Text style={styles.textoNegrito}>{lembrete.titulo}</Text>
                    <Text>{lembrete.descricao}</Text>
                    <Text>{lembrete.repeticao == 'diaria' ? 'Todo dia' : 'Única'}, {lembrete.horario}</Text>
                  </View>
                  <Pressable onPress={() => removerLembrete(lembrete.id)}>
                    <Text style={styles.textoCancelar}>Cancelar</Text>
                  </Pressable>
                </View>
              );
            })}
            {lembretes.length > 0 && (
              <Pressable onPress={() => setLembretes([])}>
                <Text style={styles.textoCancelarTodos}>Cancelar todos</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <View style={styles.barraAbas}>
        <Pressable style={styles.botaoAba} onPress={() => setTela('novo')}>
          <Text style={tela == 'novo' ? styles.textoAbaSelecionada : styles.textoAba}>Novo</Text>
        </Pressable>
        <Pressable style={styles.botaoAba} onPress={() => setTela('agendados')}>
          <Text style={tela == 'agendados' ? styles.textoAbaSelecionada : styles.textoAba}>Agendados</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingBottom: 30, paddingHorizontal: 30, backgroundColor: '#1c1c1c' },
  cabecalho: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 10, alignItems: 'center', marginBottom: 24 },
  textoCabecalho: { fontSize: 28, color: '#000' },
  conteudo: { flex: 1 },
  rotulo: { color: '#fff', fontSize: 16, marginBottom: 4 },
  campo: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, height: 38, marginBottom: 12 },
  aviso: { color: '#aaa', fontSize: 12, marginTop: -8, marginBottom: 12 },
  opcao: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: 6 },
  bolinha: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#ddd', marginRight: 10 },
  bolinhaSelecionada: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#000', borderWidth: 7, borderColor: '#fff', marginRight: 10 },
  textoOpcao: { color: '#fff', fontSize: 16 },
  botaoAgendar: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 14, alignSelf: 'center', marginTop: 8 },
  textoBotaoAgendar: { fontSize: 18, color: '#000' },
  cartao: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 },
  textoNegrito: { fontWeight: 'bold' },
  textoCancelar: { color: 'red' },
  textoCancelarTodos: { color: '#ff6b6b', textAlign: 'center', marginTop: 12 },
  barraAbas: { flexDirection: 'row', justifyContent: 'space-around' },
  botaoAba: { padding: 14 },
  textoAba: { color: '#fff', fontSize: 18 },
  textoAbaSelecionada: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});