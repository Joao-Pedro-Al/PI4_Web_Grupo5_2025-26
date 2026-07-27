import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../App.jsx';
import './Pag_Not.css';

const Notificacoes = () => {
  const { user } = useContext(AuthContext);

  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usandoDadosMock, setUsandoDadosMock] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [novaNotificacao, setNovaNotificacao] = useState({
    titulo: "Consulta Marcada",
    data: "",
    hora: ""
  });

  const tiposNotificacao = [
    "Consulta Marcada",
    "Consulta Remarcada",
    "Consulta Cancelada",
    "Consulta Confirmada",
    "Lembrete de Consulta",
    "Resultados Disponíveis"
  ];

  // 🍞 SISTEMA DE TOASTS (substitui alert())
  const mostrarToast = useCallback((mensagem, tipo = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // 📅 FORMATAR DATA
  const formatarData = (data) => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} - ${hora}:${minutos}`;
  };

  const formatarDataBackend = (dataBackend) => {
    const data = new Date(dataBackend);
    return formatarData(data);
  };

  // 📋 FUNÇÃO PARA GERAR NOTIFICAÇÕES MOCKADAS BASEADAS NO TIPO DE USUÁRIO
  const getMockNotificacoes = useCallback(() => {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    if (user?.tipo === 'medico') {
      return [
        {
          id: 'mock-1',
          titulo: "Nova Consulta Marcada",
          data: formatarData(hoje),
          vista: false,
          removing: false,
          detalhes: "Paciente: João Silva às 10:30"
        },
        {
          id: 'mock-2',
          titulo: "Consulta Remarcada",
          data: formatarData(hoje),
          vista: true,
          removing: false,
          detalhes: "Maria Santos para amanhã 14:00"
        },
        {
          id: 'mock-3',
          titulo: "Resultados de Exames Disponíveis",
          data: formatarData(amanha),
          vista: false,
          removing: false,
          detalhes: "Raio-X do paciente Carlos disponível"
        },
        {
          id: 'mock-4',
          titulo: "Lembrete de Reunião",
          data: formatarData(hoje),
          vista: true,
          removing: false,
          detalhes: "Reunião de equipe às 16:00"
        }
      ];
    }

    return [
      {
        id: 'mock-1',
        titulo: "Consulta Confirmada",
        data: formatarData(hoje),
        vista: false,
        removing: false,
        detalhes: "Consulta com Dr. Carlos amanhã às 10:00"
      },
      {
        id: 'mock-2',
        titulo: "Lembrete de Consulta",
        data: formatarData(amanha),
        vista: true,
        removing: false,
        detalhes: "Sua consulta está marcada para amanhã"
      },
      {
        id: 'mock-3',
        titulo: "Resultados de Exames",
        data: formatarData(hoje),
        vista: false,
        removing: false,
        detalhes: "Seus resultados de exames estão disponíveis"
      },
      {
        id: 'mock-4',
        titulo: "Mensagem do Médico",
        data: formatarData(hoje),
        vista: true,
        removing: false,
        detalhes: "Dr. Carlos enviou uma mensagem sobre seu tratamento"
      }
    ];
  }, [user?.tipo]);

  // 🔄 FUNÇÃO PARA BUSCAR NOTIFICAÇÕES DA API
  const buscarNotificacoes = useCallback(async () => {
    if (!user?.id) {
      setNotificacoes(getMockNotificacoes());
      setUsandoDadosMock(true);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch(`http://localhost:3000/api/notificacoes/list/${user.id}`);

      if (!resposta.ok) {
        throw new Error('API não disponível');
      }

      const dados = await resposta.json();

      if (dados.success) {
        const notificacoesFormatadas = dados.data.map(notif => ({
          id: notif.idnotificacao,
          titulo: notif.titulo,
          data: formatarDataBackend(notif.data_criacao || new Date()),
          vista: notif.visto,
          removing: false
        }));

        setNotificacoes(notificacoesFormatadas);
        setUsandoDadosMock(false);
      } else {
        console.error('Erro ao buscar notificações:', dados.error);
        setNotificacoes(getMockNotificacoes());
        setUsandoDadosMock(true);
      }
    } catch (erro) {
      console.error('Erro de conexão, usando dados mockados:', erro);
      setNotificacoes(getMockNotificacoes());
      setUsandoDadosMock(true);
    } finally {
      setCarregando(false);
    }
  }, [user?.id, getMockNotificacoes]);

  // 📥 BUSCAR NOTIFICAÇÕES QUANDO O COMPONENTE CARREGA
  useEffect(() => {
    buscarNotificacoes();
  }, [buscarNotificacoes]);

  // 👁️ MARCAR COMO VISTA
  const toggleVista = (id) => {
    setNotificacoes(prev => prev.map(notif =>
      notif.id === id ? { ...notif, vista: !notif.vista } : notif
    ));
  };

  // 🗑️ REMOVER NOTIFICAÇÃO
  const removerNotificacao = (id) => {
    setNotificacoes(prev => prev.map(notif =>
      notif.id === id ? { ...notif, removing: true } : notif
    ));

    setTimeout(() => {
      setNotificacoes(prev => prev.filter(notif => notif.id !== id));
    }, 400);
  };

  // 🗑️ REMOVER TODAS
  const removerTodas = () => {
    if (notificacoes.length === 0) return;

    setNotificacoes(prev => prev.map(notif => ({ ...notif, removing: true })));

    setTimeout(() => {
      setNotificacoes([]);
    }, 500);
  };

  // 👁️ MARCAR TODAS COMO VISTAS
  const marcarTodasComoVistas = () => {
    setNotificacoes(prev => prev.map(notif => ({ ...notif, vista: true })));
  };

  // ➕ CRIAR NOVA NOTIFICAÇÃO (apenas médicos)
  const criarNotificacao = () => {
    if (!novaNotificacao.data || !novaNotificacao.hora) {
      mostrarToast('Por favor, preencha a data e a hora.', 'error');
      return;
    }

    // novaNotificacao.data vem do <input type="date"> no formato AAAA-MM-DD
    const [, mes, dia] = novaNotificacao.data.split('-');
    const dataFormatada = `${dia}/${mes} - ${novaNotificacao.hora}`;

    const novaNotif = {
      id: crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`,
      titulo: novaNotificacao.titulo,
      data: dataFormatada,
      vista: false,
      removing: false,
      detalhes: `Notificação criada por ${user?.nome}`
    };

    setNotificacoes(prev => [novaNotif, ...prev]);
    setNovaNotificacao({
      titulo: "Consulta Marcada",
      data: "",
      hora: ""
    });
    setMostrarFormulario(false);
    mostrarToast('Notificação criada com sucesso!', 'success');
  };

  const preencherAgora = () => {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');

    setNovaNotificacao(prev => ({
      ...prev,
      data: `${ano}-${mes}-${dia}`,
      hora: `${hora}:${minutos}`
    }));
  };

  const userInfo = user ? `${user.nome} - ${user.tipo === 'medico' ? 'Médico' : 'Paciente'}` : 'Não logado';
  const naoLidas = notificacoes.filter(n => !n.vista).length;

  return (
    <div className="conteudo-notificacoes">

      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.tipo}`}>
            <i className={`bi ${t.tipo === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`}></i>
            {t.mensagem}
          </div>
        ))}
      </div>

      {/* INFORMAÇÕES DO USUÁRIO LOGADO */}
      <div className={`user-info-card ${user?.tipo === 'medico' ? 'medico' : ''}`}>
        <h4>{user?.tipo === 'medico' ? '🩺' : '👤'} {userInfo}</h4>
        <p>
          <strong>Total de notificações:</strong> {notificacoes.length} |{' '}
          <strong> Não lidas:</strong> {naoLidas}
        </p>
        {usandoDadosMock && (
          <div className="mock-data-notice">
            <i className="bi bi-info-circle"></i>
            A mostrar dados de exemplo (sem ligação à API)
          </div>
        )}
      </div>

      {/* CABEÇALHO COM FILTROS */}
      <div className="notif-header">
        <h3>
          {user?.tipo === 'medico' ? '📋 Notificações da Clínica' : '🔔 Minhas Notificações'} ({notificacoes.length})
        </h3>

        <div className="notif-actions">
          {user?.tipo === 'medico' && (
            <button
              className="btn btn-primary"
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
              <i className="bi bi-plus-circle"></i>
              {mostrarFormulario ? "Cancelar" : "Nova"}
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={marcarTodasComoVistas}
            disabled={notificacoes.length === 0}
          >
            <i className="bi bi-eye"></i> Marcar Todas
          </button>
          <button
            className="btn btn-danger-outline"
            onClick={removerTodas}
            disabled={notificacoes.length === 0}
          >
            <i className="bi bi-trash"></i> Remover Todas
          </button>
        </div>
      </div>

      {/* FORMULÁRIO (só para médicos) */}
      {user?.tipo === 'medico' && mostrarFormulario && (
        <div className="notif-form">
          <h5><i className="bi bi-bell-plus"></i> Criar Nova Notificação para Pacientes</h5>
          <div className="notif-form-fields">
            <div className="notif-form-field">
              <label htmlFor="tipo-notificacao">Tipo de Notificação</label>
              <select
                id="tipo-notificacao"
                value={novaNotificacao.titulo}
                onChange={(e) => setNovaNotificacao({ ...novaNotificacao, titulo: e.target.value })}
              >
                {tiposNotificacao.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            <div className="notif-form-field">
              <label htmlFor="data-notificacao">Data</label>
              <input
                id="data-notificacao"
                type="date"
                value={novaNotificacao.data}
                onChange={(e) => setNovaNotificacao({ ...novaNotificacao, data: e.target.value })}
              />
            </div>
            <div className="notif-form-field">
              <label htmlFor="hora-notificacao">Hora</label>
              <input
                id="hora-notificacao"
                type="time"
                value={novaNotificacao.hora}
                onChange={(e) => setNovaNotificacao({ ...novaNotificacao, hora: e.target.value })}
              />
            </div>
          </div>
          <div className="notif-form-buttons">
            <button className="btn btn-secondary" onClick={preencherAgora}>
              <i className="bi bi-clock"></i> Preencher Agora
            </button>
            <button className="btn btn-primary" onClick={criarNotificacao}>
              <i className="bi bi-check-circle"></i> Criar Notificação
            </button>
          </div>
        </div>
      )}

      {/* LISTA DE NOTIFICAÇÕES */}
      {!carregando && notificacoes.length > 0 ? (
        <div className="cards-center-container">
          {notificacoes.map(notif => (
            <div
              key={notif.id}
              className={`card notification ${notif.vista ? 'visto' : 'nao-lida'} ${notif.removing ? 'removing' : ''}`}
            >
              <div className="card-body">
                <div className="text-container">
                  <h5 className="card-title">
                    {notif.titulo}
                    {!notif.vista && <span className="badge-nova">NOVA</span>}
                  </h5>
                  <p className="card-text">{notif.data}</p>
                  {notif.detalhes && (
                    <p className="card-detalhes">{notif.detalhes}</p>
                  )}
                </div>
                <div className="notification-icons">
                  <button
                    type="button"
                    className={`icon-btn view ${notif.vista ? 'vista' : ''}`}
                    onClick={() => toggleVista(notif.id)}
                    aria-label={notif.vista ? "Marcar como não lida" : "Marcar como lida"}
                    title={notif.vista ? "Marcar como não lida" : "Marcar como lida"}
                  >
                    <i className={`bi ${notif.vista ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                  <button
                    type="button"
                    className="icon-btn delete"
                    onClick={() => removerNotificacao(notif.id)}
                    aria-label="Remover notificação"
                    title="Remover notificação"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !carregando ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="bi bi-bell-slash"></i>
          </div>
          <h5>Nenhuma notificação</h5>
          <p>
            {user?.tipo === 'medico'
              ? "Você não tem notificações no momento."
              : "Você não tem notificações pendentes."}
          </p>
          {user?.tipo === 'medico' && (
            <button className="btn btn-primary" onClick={() => setMostrarFormulario(true)}>
              <i className="bi bi-plus-circle"></i> Criar Notificação
            </button>
          )}
        </div>
      ) : (
        <div className="loading-state">
          <p>Carregando notificações...</p>
        </div>
      )}
    </div>
  );
};

export default Notificacoes;