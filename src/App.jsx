import { useState } from "react";
import "./App.css";

export default function SAEPProfessionalSystem() {
  const [logado, setLogado] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [pagina, setPagina] = useState("dashboard");

  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const usuarios = [
    {
      email: "luca@saep.com",
      senha: "123",
      nome: "Professor Luca",
      materia: "Matemática",
      horario: "07h às 16h",
    },

    {
      email: "alexandre@saep.com",
      senha: "123",
      nome: "Professor Alexandre",
      materia: "Geografia",
      horario: "07h às 16h",
    },

    {
      email: "andre@saep.com",
      senha: "123",
      nome: "Professor André",
      materia: "História",
      horario: "07h às 16h",
    },

    {
      email: "eduardo@saep.com",
      senha: "123",
      nome: "Professor Eduardo",
      materia: "Português",
      horario: "07h às 16h",
    },

    {
      email: "livia@saep.com",
      senha: "123",
      nome: "Professora Lívia",
      materia: "Física e Química",
      horario: "07h às 16h",
    },

    {
      email: "barbara@saep.com",
      senha: "123",
      nome: "Professora Bárbara",
      materia: "Biologia",
      horario: "07h às 16h",
    },

    {
      email: "joselia@saep.com",
      senha: "123",
      nome: "Professora Josélia",
      materia: "Português - Fund II até 2º Médio",
      horario: "07h às 16h",
    },

    {
      email: "andreia@saep.com",
      senha: "123",
      nome: "Professora Andreia",
      materia: "Português - Fundamental II",
      horario: "07h às 16h",
    },
  ];

  const turmas = [
    {
      nome: "Matemática",
      professor: "Professor Luca",
      sala: "Sala 01",
      horario: "07:00 - 08:00",
      presentes: 30,
      faltas: 2,
      status: "Em andamento",
    },

    {
      nome: "Geografia",
      professor: "Professor Alexandre",
      sala: "Sala 02",
      horario: "08:00 - 09:00",
      presentes: 28,
      faltas: 4,
      status: "Próxima Aula",
    },

    {
      nome: "História",
      professor: "Professor André",
      sala: "Sala 03",
      horario: "09:20 - 10:20",
      presentes: 31,
      faltas: 1,
      status: "Finalizada",
    },

    {
      nome: "Português",
      professor: "Professor Eduardo",
      sala: "Sala 04",
      horario: "10:20 - 11:20",
      presentes: 29,
      faltas: 3,
      status: "Em andamento",
    },

    {
      nome: "Física",
      professor: "Professora Lívia",
      sala: "Lab Física",
      horario: "13:00 - 14:00",
      presentes: 26,
      faltas: 5,
      status: "Próxima Aula",
    },

    {
      nome: "Química",
      professor: "Professora Lívia",
      sala: "Lab Química",
      horario: "14:00 - 15:00",
      presentes: 27,
      faltas: 2,
      status: "Finalizada",
    },

    {
      nome: "Biologia",
      professor: "Professora Bárbara",
      sala: "Sala 06",
      horario: "15:20 - 16:20",
      presentes: 30,
      faltas: 1,
      status: "Em andamento",
    },

    {
      nome: "Inglês",
      professor: "Professor Eduardo",
      sala: "Sala 07",
      horario: "16:20 - 17:20",
      presentes: 25,
      faltas: 6,
      status: "Próxima Aula",
    },
  ];

  const alunos = [
    {
      nome: "Ana Souza",
      entrada: "07:02",
      saida: "--",
      status: "Presente",
      frequencia: "98%",
    },

    {
      nome: "Bruno Lima",
      entrada: "07:05",
      saida: "10:15",
      status: "Saiu antes",
      frequencia: "82%",
    },

    {
      nome: "Carla Mendes",
      entrada: "--",
      saida: "--",
      status: "Falta",
      frequencia: "65%",
    },

    {
      nome: "Daniel Rocha",
      entrada: "07:01",
      saida: "--",
      status: "Presente",
      frequencia: "100%",
    },
  ];

  const [alunosLista, setAlunosLista] = useState(alunos);

  const [statusAula, setStatusAula] = useState("Em andamento");

  const [aulaIniciada, setAulaIniciada] = useState(false);

  function fazerLogin() {
    const usuario = usuarios.find(
      (user) =>
        user.email === email &&
        user.senha === senha
    );

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
  }

  function iniciarAula() {
    setAulaIniciada(true);
    setStatusAula("Em andamento");
  }

  function finalizarAula() {
    setStatusAula("Finalizada");
  }

  function registrarPresenca(index) {
    const lista = [...alunosLista];
    lista[index].status = "Presente";
    setAlunosLista(lista);
  }

  function registrarFalta(index) {
    const lista = [...alunosLista];
    lista[index].status = "Falta";
    setAlunosLista(lista);
  }

  function registrarSaida(index) {
    const lista = [...alunosLista];

    lista[index].status = "Saiu antes";

    lista[index].saida = new Date().toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    setAlunosLista(lista);
  }

  const presentes = alunosLista.filter(
    (aluno) => aluno.status === "Presente"
  ).length;

  const faltas = alunosLista.filter(
    (aluno) => aluno.status === "Falta"
  ).length;

  const turmasProfessor = turmas.filter(
    (turma) =>
      turma.professor === usuarioLogado?.nome
  );

  if (!logado) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">

          <div className="text-center">
            <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              SAEP
            </h1>

            <p className="text-slate-400 mt-4 text-lg">
              Sistema Inteligente de Presença Escolar
            </p>
          </div>

          <div className="mt-10 space-y-5">

            <div>
              <label className="text-slate-300 font-semibold">
                Email
              </label>

              <input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold">
                Senha
              </label>

              <input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) =>
                  setSenha(e.target.value)
                }
                className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-purple-400"
              />
            </div>

            <button
              onClick={fazerLogin}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 p-4 rounded-2xl font-bold text-lg hover:scale-105 transition"
            >
              Entrar no Sistema
            </button>
          </div>

          <div className="mt-8 bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">
              Professores cadastrados
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p className="text-cyan-400">
                luca@saep.com
              </p>

              <p className="text-cyan-400">
                alexandre@saep.com
              </p>

              <p className="text-cyan-400">
                eduardo@saep.com
              </p>

              <p className="text-cyan-400">
                livia@saep.com
              </p>

              <p className="text-cyan-400">
                barbara@saep.com
              </p>

              <p className="text-cyan-400">
                joselia@saep.com
              </p>

              <p className="text-cyan-400">
                andreia@saep.com
              </p>

              <p className="text-purple-400 mt-3">
                Senha de todos: 123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex font-sans">

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">

        <div>

          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              SAEP
            </h1>

            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              Sistema de Acompanhamento Escolar
            </p>
          </div>

          <div className="mt-10 bg-slate-800 p-4 rounded-2xl border border-slate-700">

            <p className="text-slate-400 text-sm">
              Professor conectado
            </p>

            <h2 className="text-xl font-bold mt-1">
              {usuarioLogado?.nome}
            </h2>

            <p className="text-cyan-400 text-sm mt-1">
              {usuarioLogado?.materia}
            </p>

            <p className="text-slate-400 text-sm mt-1">
              {usuarioLogado?.horario}
            </p>
          </div>

          <nav className="mt-10 space-y-4">

            <button
              onClick={() =>
                setPagina("dashboard")
              }
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 p-4 rounded-2xl font-semibold shadow-lg"
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                setPagina("turmas")
              }
              className="w-full bg-slate-800 hover:bg-slate-700 transition p-4 rounded-2xl text-left"
            >
              Turmas
            </button>

            <button
              onClick={() =>
                setPagina("presenca")
              }
              className="w-full bg-slate-800 hover:bg-slate-700 transition p-4 rounded-2xl text-left"
            >
              Presença
            </button>

            <button
              onClick={() =>
                setPagina("relatorios")
              }
              className="w-full bg-slate-800 hover:bg-slate-700 transition p-4 rounded-2xl text-left"
            >
              Relatórios
            </button>

            <button
              onClick={() =>
                setPagina("coordenacao")
              }
              className="w-full bg-slate-800 hover:bg-slate-700 transition p-4 rounded-2xl text-left"
            >
              Coordenação
            </button>
          </nav>
        </div>

        <button
          onClick={sairSistema}
          className="w-full bg-red-500 hover:bg-red-600 transition p-4 rounded-2xl font-semibold mt-10"
        >
          Sair
        </button>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-8 overflow-y-auto">

        {pagina === "dashboard" && (
          <div>

            <h1 className="text-5xl font-black">
              Bem-vindo ao SAEP 👋
            </h1>

            <p className="text-slate-400 mt-4 text-lg">
              Sistema Escolar Inteligente
            </p>

            <div className="grid md:grid-cols-4 gap-6 mt-10">

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <p className="text-slate-400">
                  Professor
                </p>

                <h2 className="text-2xl font-black mt-2">
                  {usuarioLogado?.nome}
                </h2>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <p className="text-slate-400">
                  Matéria
                </p>

                <h2 className="text-2xl font-black mt-2 text-cyan-400">
                  {usuarioLogado?.materia}
                </h2>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <p className="text-slate-400">
                  Presentes
                </p>

                <h2 className="text-3xl font-black text-green-400 mt-2">
                  {presentes}
                </h2>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <p className="text-slate-400">
                  Faltas
                </p>

                <h2 className="text-3xl font-black text-red-400 mt-2">
                  {faltas}
                </h2>
              </div>

            </div>
          </div>
        )}

        {pagina === "turmas" && (
          <div>

            <h1 className="text-5xl font-black">
              Minhas Turmas
            </h1>

            <div className="grid md:grid-cols-3 gap-6 mt-10">

              {turmasProfessor.map(
                (turma, index) => (
                  <div
                    key={index}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg"
                  >
                    <h2 className="text-2xl font-bold">
                      {turma.nome}
                    </h2>

                    <p className="text-slate-400 mt-2">
                      {turma.sala}
                    </p>

                    <p className="mt-4">
                      ⏰ {turma.horario}
                    </p>

                    <p>
                      ✅ {turma.presentes} presentes
                    </p>

                    <p>
                      ❌ {turma.faltas} faltas
                    </p>

                    <p className="mt-2 text-cyan-400">
                      {turma.status}
                    </p>
                  </div>
                )
              )}

            </div>
          </div>
        )}

        {pagina === "presenca" && (
          <div>

            <h1 className="text-5xl font-black">
              Controle de Presença
            </h1>

            <div className="mt-10 space-y-4">

              {alunosLista.map(
                (aluno, index) => (
                  <div
                    key={index}
                    className="bg-slate-900 p-5 rounded-2xl border border-slate-800"
                  >
                    <div className="flex justify-between items-center flex-wrap gap-4">

                      <div>
                        <h2 className="text-xl font-bold">
                          {aluno.nome}
                        </h2>

                        <p className="text-slate-400 mt-1">
                          Status:
                          {" "}
                          {aluno.status}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-wrap">

                        <button
                          onClick={() =>
                            registrarPresenca(index)
                          }
                          className="bg-green-500 px-4 py-2 rounded-xl font-semibold"
                        >
                          Presença
                        </button>

                        <button
                          onClick={() =>
                            registrarFalta(index)
                          }
                          className="bg-red-500 px-4 py-2 rounded-xl font-semibold"
                        >
                          Falta
                        </button>

                        <button
                          onClick={() =>
                            registrarSaida(index)
                          }
                          className="bg-yellow-500 px-4 py-2 rounded-xl font-semibold"
                        >
                          Saída
                        </button>

                      </div>
                    </div>
                  </div>
                )
              )}

            </div>
          </div>
        )}

        {pagina === "relatorios" && (
          <div>

            <h1 className="text-5xl font-black">
              Relatórios
            </h1>

            <div className="mt-10 bg-slate-900 p-8 rounded-3xl border border-slate-800">

              <p className="text-2xl">
                📊 Total de presentes:
                {" "}
                {presentes}
              </p>

              <p className="text-2xl mt-4">
                📉 Total de faltas:
                {" "}
                {faltas}
              </p>

              <p className="text-2xl mt-4">
                👨‍🏫 Professor:
                {" "}
                {usuarioLogado?.nome}
              </p>

            </div>
          </div>
        )}

        {pagina === "coordenacao" && (
          <div>

            <h1 className="text-5xl font-black">
              Coordenação
            </h1>

            <div className="mt-10 bg-slate-900 p-8 rounded-3xl border border-slate-800">

              <p className="text-lg">
                Área reservada para coordenação pedagógica.
              </p>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}