import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

export default function SAEPProfessionalSystem() {
  const [logado, setLogado] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [pagina, setPagina] = useState("dashboard");
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const [alunosAPI, setAlunosAPI] = useState([]);
  const [nomeAluno, setNomeAluno] = useState("");
  const [turmaAluno, setTurmaAluno] = useState("");
  const [uidLido, setUidLido] = useState("");
  const [modoCadastro, setModoCadastro] = useState(false);
  const [mensagemCadastro, setMensagemCadastro] = useState("");
  const [carregandoCadastro, setCarregandoCadastro] = useState(false);
  const [presencasAPI, setPresencasAPI] = useState([]);
  const [erroAPI, setErroAPI] = useState("");
  const [carregandoPresencas, setCarregandoPresencas] = useState(true);

  const usuarios = [
    { email: "luca@saep.com", senha: "123", nome: "Professor Luca", materia: "Matemática", horario: "07h às 16h" },
    { email: "alexandre@saep.com", senha: "123", nome: "Professor Alexandre", materia: "Geografia", horario: "07h às 16h" },
    { email: "andre@saep.com", senha: "123", nome: "Professor André", materia: "História", horario: "07h às 16h" },
    { email: "eduardo@saep.com", senha: "123", nome: "Professor Eduardo", materia: "Português", horario: "07h às 16h" },
    { email: "livia@saep.com", senha: "123", nome: "Professora Lívia", materia: "Física e Química", horario: "07h às 16h" },
    { email: "barbara@saep.com", senha: "123", nome: "Professora Bárbara", materia: "Biologia", horario: "07h às 16h" },
    { email: "joselia@saep.com", senha: "123", nome: "Professora Josélia", materia: "Português - Fund II até 2º Médio", horario: "07h às 16h" },
    { email: "andreia@saep.com", senha: "123", nome: "Professora Andreia", materia: "Português - Fundamental II", horario: "07h às 16h" },
  ];

  const turmas = [
    { nome: "Matemática", professor: "Professor Luca", sala: "Sala 01", horario: "07:00 - 08:00", presentes: 30, faltas: 2, status: "Em andamento" },
    { nome: "Geografia", professor: "Professor Alexandre", sala: "Sala 02", horario: "08:00 - 09:00", presentes: 28, faltas: 4, status: "Próxima Aula" },
    { nome: "História", professor: "Professor André", sala: "Sala 03", horario: "09:20 - 10:20", presentes: 31, faltas: 1, status: "Finalizada" },
    { nome: "Português", professor: "Professor Eduardo", sala: "Sala 04", horario: "10:20 - 11:20", presentes: 29, faltas: 3, status: "Em andamento" },
    { nome: "Física", professor: "Professora Lívia", sala: "Lab Física", horario: "13:00 - 14:00", presentes: 26, faltas: 5, status: "Próxima Aula" },
    { nome: "Química", professor: "Professora Lívia", sala: "Lab Química", horario: "14:00 - 15:00", presentes: 27, faltas: 2, status: "Finalizada" },
    { nome: "Biologia", professor: "Professora Bárbara", sala: "Sala 06", horario: "15:20 - 16:20", presentes: 30, faltas: 1, status: "Em andamento" },
    { nome: "Inglês", professor: "Professor Eduardo", sala: "Sala 07", horario: "16:20 - 17:20", presentes: 25, faltas: 6, status: "Próxima Aula" },
  ];

  useEffect(() => {
    let ativo = true;
    async function buscarPresencas() {
      try {
        const resposta = await fetch(`${API_URL}/presencas`);
        if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);
        const dados = await resposta.json();
        const lista = Array.isArray(dados) ? dados : Array.isArray(dados.presencas) ? dados.presencas : [];
        if (ativo) {
          setPresencasAPI(lista);
          setErroAPI("");
        }
      } catch {
        if (ativo) setErroAPI("Não foi possível acessar a API. Verifique se o backend está rodando.");
      } finally {
        if (ativo) setCarregandoPresencas(false);
      }
    }
    buscarPresencas();
    const intervalo = setInterval(buscarPresencas, 3000);
    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, []);

  useEffect(() => {
    if (!logado || pagina !== "cartoes") return;
    let ativo = true;
    async function atualizarAlunos() {
      try {
        const resposta = await fetch(`${API_URL}/alunos`);
        if (!resposta.ok) throw new Error("Não foi possível carregar os alunos.");
        const dados = await resposta.json();
        if (ativo) setAlunosAPI(Array.isArray(dados) ? dados : []);
      } catch {
        if (ativo) setMensagemCadastro("Não foi possível carregar os alunos. Verifique o backend.");
      }
    }
    async function verificarLeitura() {
      try {
        const resposta = await fetch(`${API_URL}/rfid/cadastro/estado`);
        if (!resposta.ok) return;
        const estado = await resposta.json();
        if (ativo && estado.uid) {
          setUidLido(String(estado.uid).toUpperCase());
          setModoCadastro(false);
          setMensagemCadastro("Cartão lido! Confira o UID antes de salvar.");
        }
      } catch {
        // A leitura é consultada novamente no próximo intervalo.
      }
    }
    atualizarAlunos();
    const intervalo = setInterval(verificarLeitura, 1000);
    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [logado, pagina]);

  function fazerLogin() {
    const usuario = usuarios.find((user) => user.email === email && user.senha === senha);
    if (usuario) {
      setUsuarioLogado(usuario);
      setLogado(true);
    } else {
      alert("Email ou senha incorretos");
    }
  }

  function sairSistema() {
    setLogado(false);
    setEmail("");
    setSenha("");
    setPagina("dashboard");
    setUsuarioLogado(null);
    setModoCadastro(false);
  }

  const turmasProfessor = turmas.filter((turma) => turma.professor === usuarioLogado?.nome);
  const presentes = presencasAPI.filter((p) => {
    const status = String(p.status || "").toUpperCase();
    return status.includes("ENTRADA OK") || status === "PRESENTE";
  }).length;
  const faltas = presencasAPI.filter((p) => String(p.status || "").toUpperCase() === "FALTA").length;

  async function carregarAlunos() {
    const resposta = await fetch(`${API_URL}/alunos`);
    if (!resposta.ok) throw new Error("Não foi possível carregar os alunos.");
    const dados = await resposta.json();
    setAlunosAPI(Array.isArray(dados) ? dados : []);
  }

  async function iniciarLeituraCartao() {
    try {
      setUidLido("");
      setMensagemCadastro("Aproxime o cartão do leitor RFID...");
      setModoCadastro(true);
      const resposta = await fetch(`${API_URL}/rfid/cadastro/iniciar`, { method: "POST" });
      if (!resposta.ok) throw new Error("Não foi possível ativar o leitor.");
    } catch (erro) {
      setModoCadastro(false);
      setMensagemCadastro(erro.message || "Erro ao iniciar leitura.");
    }
  }

  async function cancelarLeituraCartao() {
    try {
      const resposta = await fetch(`${API_URL}/rfid/cadastro/cancelar`, { method: "POST" });
      if (!resposta.ok) throw new Error("Não foi possível cancelar a leitura no backend.");
    } catch (erro) {
      console.error(erro);
    } finally {
      setModoCadastro(false);
      setUidLido("");
    }
  }

  async function salvarAluno(e) {
    e.preventDefault();
    if (!nomeAluno.trim() || !turmaAluno.trim() || !uidLido.trim()) {
      setMensagemCadastro("Preencha o nome, a turma e leia o cartão.");
      return;
    }
    setCarregandoCadastro(true);
    try {
      const resposta = await fetch(`${API_URL}/alunos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeAluno.trim(), turma: turmaAluno.trim(), uid: uidLido.trim().toUpperCase() }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        throw new Error(typeof dados.detail === "string" ? dados.detail : "Não foi possível cadastrar o aluno.");
      }
      try {
        await fetch(`${API_URL}/rfid/cadastro/cancelar`, { method: "POST" });
      } catch {
        // O cadastro foi concluído; o cancelamento é apenas uma limpeza do modo de leitura.
      }
      setModoCadastro(false);
      await carregarAlunos();
      setNomeAluno("");
      setTurmaAluno("");
      setUidLido("");
      setMensagemCadastro("Aluno e cartão cadastrados com sucesso!");
    } catch (erro) {
      setMensagemCadastro(erro.message || "Erro ao cadastrar aluno.");
    } finally {
      setCarregandoCadastro(false);
    }
  }

  if (!logado) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">
          <div className="text-center">
            <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">SAEP</h1>
            <p className="text-slate-400 mt-4 text-lg">Sistema Inteligente de Presença Escolar</p>
          </div>
          <form className="mt-10 space-y-5" onSubmit={(e) => { e.preventDefault(); fazerLogin(); }}>
            <div>
              <label className="text-slate-300 font-semibold">Email</label>
              <input type="email" placeholder="Digite seu email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="text-slate-300 font-semibold">Senha</label>
              <input type="password" placeholder="Digite sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-purple-400" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 p-4 rounded-2xl font-bold text-lg hover:scale-105 transition">Entrar no Sistema</button>
          </form>
          <div className="mt-8 bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Professores cadastrados</p>
            <div className="mt-4 space-y-2 text-sm">
              {usuarios.map((usuario) => <p key={usuario.email} className="text-cyan-400">{usuario.email}</p>)}
              <p className="text-purple-400 mt-3">Senha de todos: 123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalAlunos = alunosAPI.length;
  const alunosComCartao = alunosAPI.filter((aluno) => String(aluno.uid || "").trim() !== "").length;
  const alunosSemCartao = totalAlunos - alunosComCartao;
  const percentualCartoes = totalAlunos ? Math.round((alunosComCartao / totalAlunos) * 100) : 0;
  const alunoAtivo = (aluno) => aluno.ativo === true || aluno.ativo === 1 || String(aluno.ativo).toLowerCase() === "true" || String(aluno.ativo).toLowerCase() === "ativo";
  const totalAtivos = alunosAPI.filter(alunoAtivo).length;
  const ativosComCartao = alunosAPI.filter((aluno) => alunoAtivo(aluno) && String(aluno.uid || "").trim() !== "").length;
  const percentualAtivosComCartao = totalAtivos ? Math.round((ativosComCartao / totalAtivos) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex font-sans">
      <aside className="w-72 shrink-0 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">SAEP</h1>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">Sistema de Acompanhamento Escolar</p>
          </div>
          <div className="mt-10 bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <p className="text-slate-400 text-sm">Professor conectado</p>
            <h2 className="text-xl font-bold mt-1">{usuarioLogado?.nome}</h2>
            <p className="text-cyan-400 text-sm mt-1">{usuarioLogado?.materia}</p>
            <p className="text-slate-400 text-sm mt-1">{usuarioLogado?.horario}</p>
          </div>
          <nav className="mt-10 space-y-4">
            {[["dashboard", "Dashboard"], ["turmas", "Turmas"], ["presenca", "Presença"], ["cartoes", "Cartões RFID"], ["relatorios", "Relatórios"], ["coordenacao", "Coordenação"]].map(([id, titulo]) => (
              <button key={id} onClick={() => setPagina(id)} className={`w-full p-4 rounded-2xl text-left transition ${pagina === id ? "bg-gradient-to-r from-cyan-500 to-purple-600 font-semibold shadow-lg" : "bg-slate-800 hover:bg-slate-700"}`}>{titulo}</button>
            ))}
          </nav>
        </div>
        <button onClick={sairSistema} className="w-full bg-red-500 hover:bg-red-600 transition p-4 rounded-2xl font-semibold mt-10">Sair</button>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-8 overflow-y-auto">
        {pagina === "dashboard" && (
          <div>
            <h1 className="text-4xl md:text-5xl font-black">Bem-vindo ao SAEP 👋</h1>
            <p className="text-slate-400 mt-4 text-lg">Sistema Escolar Inteligente</p>
            {erroAPI && <p className="mt-6 bg-red-950 border border-red-700 text-red-300 p-4 rounded-xl">{erroAPI}</p>}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800"><p className="text-slate-400">Professor</p><h2 className="text-2xl font-black mt-2">{usuarioLogado?.nome}</h2></div>
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800"><p className="text-slate-400">Matéria</p><h2 className="text-2xl font-black mt-2 text-cyan-400">{usuarioLogado?.materia}</h2></div>
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800"><p className="text-slate-400">Entradas registradas</p><h2 className="text-3xl font-black text-green-400 mt-2">{presentes}</h2></div>
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800"><p className="text-slate-400">Registros de falta</p><h2 className="text-3xl font-black text-red-400 mt-2">{faltas}</h2></div>
            </div>
            <div className="mt-8 bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <h2 className="text-2xl font-bold">Últimas leituras RFID</h2>
              {carregandoPresencas ? <p className="text-slate-400 mt-4">Carregando registros...</p> : presencasAPI.length === 0 ? <p className="text-slate-400 mt-4">Nenhuma presença registrada ainda.</p> : <div className="mt-4 space-y-3">{[...presencasAPI].slice(-5).reverse().map((p, index) => <div key={p.id ?? `${p.uid}-${p.data}-${p.hora}-${index}`} className="bg-slate-800 rounded-xl p-4 flex flex-wrap justify-between gap-2"><span className="font-semibold">{p.nome || "Aluno não identificado"}</span><span className="text-slate-400">{p.data || "--"} {p.hora || ""}</span><span className="text-cyan-400">{p.status || p.tipo || "Registrada"}</span></div>)}</div>}
            </div>
          </div>
        )}

        {pagina === "turmas" && (
          <div>
            <h1 className="text-4xl md:text-5xl font-black">Minhas Turmas</h1>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
              {turmasProfessor.length === 0 ? <p className="text-slate-400">Não há turmas associadas a este professor.</p> : turmasProfessor.map((turma) => <div key={turma.nome} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg"><h2 className="text-2xl font-bold">{turma.nome}</h2><p className="text-slate-400 mt-2">{turma.sala}</p><p className="mt-4">⏰ {turma.horario}</p><p>✅ {turma.presentes} presentes</p><p>❌ {turma.faltas} faltas</p><p className="mt-2 text-cyan-400">{turma.status}</p></div>)}
            </div>
          </div>
        )}

        {pagina === "presenca" && (
          <div>
            <div className="flex justify-between items-center flex-wrap gap-4"><div><h1 className="text-4xl md:text-5xl font-black">Controle de Presença</h1><p className="text-slate-400 mt-3">Registros recebidos pelo leitor RFID. Atualização automática a cada 3 segundos.</p></div><button onClick={() => window.location.reload()} className="bg-cyan-600 hover:bg-cyan-700 px-5 py-3 rounded-xl font-semibold">Atualizar página</button></div>
            {erroAPI && <div className="mt-6 bg-red-950 border border-red-700 text-red-300 p-4 rounded-xl">{erroAPI}</div>}
            {carregandoPresencas ? <p className="mt-8 text-slate-400">Carregando presenças...</p> : presencasAPI.length === 0 ? <div className="mt-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl"><p className="text-xl font-bold">Nenhuma presença registrada</p><p className="text-slate-400 mt-2">Aproxime um cartão RFID do leitor para registrar uma presença.</p></div> : <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800"><table className="w-full text-left border-collapse"><thead><tr className="bg-slate-900 text-slate-300">{["Aluno", "UID", "Data", "Hora", "Tipo", "Status"].map((titulo) => <th key={titulo} className="p-4">{titulo}</th>)}</tr></thead><tbody>{[...presencasAPI].reverse().map((p, index) => <tr key={p.id ?? `${p.uid}-${p.data}-${p.hora}-${index}`} className="border-t border-slate-800 bg-slate-900/50"><td className="p-4 font-semibold">{p.nome || "Aluno não identificado"}</td><td className="p-4 text-slate-400">{p.uid || "--"}</td><td className="p-4">{p.data || "--"}</td><td className="p-4">{p.hora || "--"}</td><td className="p-4">{p.tipo || "--"}</td><td className="p-4"><span className="inline-block bg-green-950 text-green-400 px-3 py-1 rounded-full text-sm">{p.status || "Registrada"}</span></td></tr>)}</tbody></table></div>}
          </div>
        )}

        {pagina === "cartoes" && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><h1 className="text-4xl md:text-5xl font-black">Cartões RFID</h1><p className="text-slate-400 mt-3">Gerencie alunos, cartões e acompanhe os cadastros do SAEP.</p></div>
              <button type="button" onClick={() => carregarAlunos().then(() => setMensagemCadastro("Lista atualizada.")).catch((erro) => setMensagemCadastro(erro.message))} className="bg-slate-800 border border-slate-700 hover:bg-slate-700 px-5 py-3 rounded-xl font-semibold">↻ Atualizar dados</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"><p className="text-slate-400 text-sm">Total de alunos</p><p className="text-4xl font-black mt-3">{totalAlunos}</p><p className="text-slate-500 text-sm mt-2">Alunos cadastrados</p></div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"><p className="text-slate-400 text-sm">Cartões vinculados</p><p className="text-4xl font-black text-cyan-400 mt-3">{alunosComCartao}</p><p className="text-slate-500 text-sm mt-2">{percentualCartoes}% dos alunos</p></div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"><p className="text-slate-400 text-sm">Sem cartão</p><p className="text-4xl font-black text-amber-400 mt-3">{alunosSemCartao}</p><p className="text-slate-500 text-sm mt-2">Aguardando vinculação</p></div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"><p className="text-slate-400 text-sm">Alunos ativos</p><p className="text-4xl font-black text-green-400 mt-3">{totalAtivos}</p><p className="text-slate-500 text-sm mt-2">Conforme status da API</p></div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
                <h2 className="text-2xl font-bold">Cadastrar aluno</h2><p className="text-slate-400 mt-2 mb-7">Preencha os dados e associe o cartão RFID.</p>
                <form onSubmit={salvarAluno} className="space-y-5">
                  <div><label className="block text-slate-300 mb-2 font-medium">Nome completo</label><input value={nomeAluno} onChange={(e) => setNomeAluno(e.target.value)} placeholder="Digite o nome do aluno" required className="w-full rounded-xl bg-slate-800 border border-slate-700 p-4 text-white outline-none focus:border-cyan-400" /></div>
                  <div><label className="block text-slate-300 mb-2 font-medium">Turma</label><input value={turmaAluno} onChange={(e) => setTurmaAluno(e.target.value)} placeholder="Ex.: 3A" required className="w-full rounded-xl bg-slate-800 border border-slate-700 p-4 text-white outline-none focus:border-cyan-400" /></div>
                  <div><label className="block text-slate-300 mb-2 font-medium">UID do cartão</label><input value={uidLido} onChange={(e) => setUidLido(e.target.value.toUpperCase())} placeholder="Aproxime o cartão ou digite o UID" required className="w-full rounded-xl bg-slate-800 border border-slate-700 p-4 text-white outline-none focus:border-cyan-400" /></div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                    <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center font-black text-cyan-300">RFID</div><div className="flex-1"><p className="font-semibold">Leitor de cartões</p><p className={`text-sm mt-1 ${modoCadastro ? "text-cyan-300" : "text-slate-400"}`}>{modoCadastro ? "Aguardando aproximação do cartão..." : "Pronto para iniciar uma leitura"}</p></div><span className={`w-3 h-3 rounded-full ${modoCadastro ? "bg-cyan-400 animate-pulse" : "bg-slate-500"}`} /></div>
                    <div className="flex flex-wrap gap-3 mt-5"><button type="button" onClick={iniciarLeituraCartao} disabled={modoCadastro} className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 px-5 py-3 rounded-xl font-semibold">{modoCadastro ? "Aguardando cartão..." : "Ler cartão RFID"}</button>{modoCadastro && <button type="button" onClick={cancelarLeituraCartao} className="bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-xl font-semibold">Cancelar leitura</button>}</div>
                  </div>
                  {mensagemCadastro && <div role="status" className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-cyan-300">{mensagemCadastro}</div>}
                  <button type="submit" disabled={carregandoCadastro} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 disabled:opacity-50 p-4 rounded-xl font-bold">{carregandoCadastro ? "Salvando cadastro..." : "Cadastrar aluno e cartão"}</button>
                </form>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
                <h2 className="text-xl font-bold">Vinculação de cartões</h2><p className="text-slate-400 text-sm mt-2">Percentual de alunos com UID cadastrado.</p>
                <div className="flex justify-center py-8"><div className="w-44 h-44 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#22d3ee ${percentualCartoes}%, #1e293b ${percentualCartoes}% 100%)` }}><div className="w-36 h-36 rounded-full bg-slate-900 flex flex-col items-center justify-center"><span className="text-4xl font-black">{percentualCartoes}%</span><span className="text-xs text-slate-400 mt-1">vinculados</span></div></div></div>
                <div className="space-y-4"><div className="flex justify-between gap-3"><span className="text-slate-400">Com cartão</span><span className="font-bold text-cyan-400">{alunosComCartao}</span></div><div className="flex justify-between gap-3"><span className="text-slate-400">Sem cartão</span><span className="font-bold text-amber-400">{alunosSemCartao}</span></div><div className="border-t border-slate-800 pt-4"><div className="flex justify-between gap-3 mb-2"><span className="text-slate-400 text-sm">Ativos com cartão</span><span className="text-sm font-bold text-green-400">{percentualAtivosComCartao}%</span></div><div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${percentualAtivosComCartao}%` }} /></div></div></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6"><div><h2 className="text-2xl font-bold">Alunos cadastrados</h2><p className="text-slate-400 mt-2 text-sm">Lista atualizada com os dados da API.</p></div><span className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-sm">{totalAlunos} aluno(s)</span></div>
              {alunosAPI.length === 0 ? <div className="text-center py-12"><p className="text-lg font-semibold">Nenhum aluno encontrado</p><p className="text-slate-400 mt-2">Cadastre um aluno ou verifique se o backend está funcionando.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-slate-400 text-sm border-b border-slate-800"><th className="p-4">Aluno</th><th className="p-4">Turma</th><th className="p-4">UID do cartão</th><th className="p-4">Cartão</th><th className="p-4">Status</th></tr></thead><tbody>{alunosAPI.map((aluno, index) => { const temCartao = String(aluno.uid || "").trim() !== ""; const ativo = alunoAtivo(aluno); const iniciais = String(aluno.nome || "Aluno").trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase(); return <tr key={aluno.id ?? index} className="border-b border-slate-800/80 hover:bg-slate-800/40 transition"><td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-sm">{iniciais}</div><span className="font-semibold">{aluno.nome || "Nome não informado"}</span></div></td><td className="p-4 text-slate-300">{aluno.turma || "--"}</td><td className="p-4"><span className="font-mono text-sm text-slate-300">{temCartao ? aluno.uid : "--"}</span></td><td className="p-4"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${temCartao ? "bg-cyan-950 text-cyan-300" : "bg-amber-950 text-amber-300"}`}>{temCartao ? "Vinculado" : "Sem cartão"}</span></td><td className="p-4"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${ativo ? "bg-green-950 text-green-300" : "bg-slate-800 text-slate-400"}`}>{ativo ? "Ativo" : "Inativo"}</span></td></tr>; })}</tbody></table></div>}
            </div>
          </div>
        )}

        {pagina === "relatorios" && <div><h1 className="text-4xl md:text-5xl font-black">Relatórios</h1><div className="mt-10 bg-slate-900 p-8 rounded-3xl border border-slate-800"><p className="text-2xl">📊 Total de entradas registradas: {presentes}</p><p className="text-2xl mt-4">📉 Total de registros de falta: {faltas}</p><p className="text-2xl mt-4">👨‍🏫 Professor: {usuarioLogado?.nome}</p><p className="text-slate-400 mt-4">Os números são calculados com base nos registros retornados pela API.</p></div></div>}
        {pagina === "coordenacao" && <div><h1 className="text-4xl md:text-5xl font-black">Coordenação</h1><div className="mt-10 bg-slate-900 p-8 rounded-3xl border border-slate-800"><p className="text-lg">Área reservada para coordenação pedagógica.</p><p className="text-slate-400 mt-4">Total de registros recebidos pela API: {presencasAPI.length}</p></div></div>}
      </main>
    </div>
  );
}
