import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../App.jsx';
import './Pag_Not.css';

import urlGlobal from './url_global.jsx';

const BASE_URL = urlGlobal.endsWith('/') ? urlGlobal.slice(0, -1) : urlGlobal;

const Notificacoes = () => {
  const { user } = useContext(AuthContext);

  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [criando, setCriando] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [perfis, setPerfis] = useState([]); // lista de perfis para o médico selecionar
  const [carregandoPerfis, setCarregandoPerfis] = useState(false);

  const [novaNotificacao, setNovaNotificacao] = useState({
    titulo: 'Consulta Marcada',
    descricao: '',
    prefil: '' // id do perfil destinatário ("" = Geral / Todos)
  });

  const tiposNotificacao = [
    'Consulta Marcada',
    'Consulta Remarcada',
    'Consulta Cancelada',
    'Consulta Confirmada',
    'Lembrete de Consulta',
    'Resultados Disponíveis',
    'Mensagem do Médico',
    'Informação Geral'
  ];

  const isMedico = user?.idtipoconta === 2 || user?.idtipoconta === 1;

  // 🍞 SISTEMA DE TOASTS
  const mostrarToast = useCallback((mensagem, tipo = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // 📅 FORMATAR DATA
  const formatarData = (dataBackend) => {
    if (!dataBackend) return '—';
    const data = new Date(dataBackend);
    if (isNaN(data)) return '—';
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} - ${hora}:${minutos}`;
  };

  // 📋 BUSCAR PERFIS (para o médico escolher o destinatário)
  const buscarPerfis = useCallback(async () => {
    if (!isMedico) return;
    setCarregandoPerfis(true);
    try {
      const resposta = await fetch(`${BASE_URL}/utilizadorperfil/list`);
      if (resposta.ok) {
        const dados = await resposta.json();
        if (dados.success) {
          setPerfis(dados.data);
        }
      }
    } catch (erro) {
      console.error('Erro ao buscar perfis:', erro);
    } finally {
      setCarregandoPerfis(false);
    }
  }, [isMedico]);

  // 🔄 BUSCAR NOTIFICAÇÕES DA API
  const buscarNotificacoes = useCallback(async () => {
    setCarregando(true);
    try {
      // O médico/admin vê TODAS; o paciente vê as suas especificas e gerais
      let url;
      if (isMedico) {
        url = `${BASE_URL}/api/notificacoes/list`;
      } else if (user?.idprefil) {
        url = `${BASE_URL}/api/notificacoes/list/${user.idprefil}`;
      } else {
        setNotificacoes([]);
        setCarregando(false);
        return;
      }

      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const dados = await resposta.json();

      if (dados.success) {
        const formatadas = dados.data.map(notif => ({
          id: notif.idnotificacao,
          titulo: notif.titulo,
          descricao: notif.descricao || '',
          data: formatarData(notif.data_criacao),
          vista: notif.visto,
          perfilNome: notif.PerfilData?.nome || 'Geral (Todos)',
          removing: false
        }));
        setNotificacoes(formatadas);
      } else {
        mostrarToast('Erro ao carregar notificações.', 'error');
      }
    } catch (erro) {
      console.error('Erro ao buscar notificações:', erro);
      mostrarToast('Não foi possível carregar notificações. Verifique se o servidor está ativo.', 'error');
    } finally {
      setCarregando(false);
    }
  }, [isMedico, user?.idprefil, mostrarToast]);

  // Carregar dados ao montar
  useEffect(() => {
    buscarNotificacoes();
    buscarPerfis();
  }, [buscarNotificacoes, buscarPerfis]);

  // 👁️ MARCAR COMO VISTA / NÃO VISTA (API)
  const toggleVista = async (id, vistaAtual) => {
    try {
      const novaVisibilidade = !vistaAtual;
      const resposta = await fetch(`${BASE_URL}/api/notificacoes/vista/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visto: novaVisibilidade })
      });

      if (!resposta.ok) throw new Error('Erro ao marcar notificação');

      // Atualizar localmente
      setNotificacoes(prev => prev.map(notif =>
        notif.id === id ? { ...notif, vista: novaVisibilidade } : notif
      ));
    } catch (erro) {
      console.error('Erro ao atualizar visibilidade:', erro);
      mostrarToast('Erro ao marcar notificação.', 'error');
    }
  };

  // 🗑️ REMOVER NOTIFICAÇÃO (API)
  const removerNotificacao = async (id) => {
    setNotificacoes(prev => prev.map(notif =>
      notif.id === id ? { ...notif, removing: true } : notif
    ));

    try {
      const resposta = await fetch(`${BASE_URL}/api/notificacoes/delete/${id}`, {
        method: 'DELETE'
      });
      if (!resposta.ok) throw new Error('Erro ao eliminar');

      setTimeout(() => {
        setNotificacoes(prev => prev.filter(notif => notif.id !== id));
      }, 400);
    } catch (erro) {
      console.error('Erro ao remover notificação:', erro);
      setNotificacoes(prev => prev.map(notif =>
        notif.id === id ? { ...notif, removing: false } : notif
      ));
      mostrarToast('Erro ao remover notificação.', 'error');
    }
  };

  // 🗑️ REMOVER TODAS (API)
  const removerTodas = async () => {
    if (notificacoes.length === 0) return;

    setNotificacoes(prev => prev.map(notif => ({ ...notif, removing: true })));

    try {
      if (isMedico) {
        await Promise.all(
          notificacoes.map(notif =>
            fetch(`${BASE_URL}/api/notificacoes/delete/${notif.id}`, { method: 'DELETE' })
          )
        );
      } else if (user?.idprefil) {
        await fetch(`${BASE_URL}/api/notificacoes/delete-all/${user.idprefil}`, { method: 'DELETE' });
      }

      setTimeout(() => setNotificacoes([]), 500);
      mostrarToast('Todas as notificações foram removidas!', 'success');
    } catch (erro) {
      console.error('Erro ao remover todas:', erro);
      setNotificacoes(prev => prev.map(notif => ({ ...notif, removing: false })));
      mostrarToast('Erro ao remover notificações.', 'error');
    }
  };

  // 👁️ MARCAR TODAS COMO VISTAS (API)
  const marcarTodasComoVistas = async () => {
    try {
      if (isMedico) {
        await Promise.all(
          notificacoes
            .filter(n => !n.vista)
            .map(n =>
              fetch(`${BASE_URL}/api/notificacoes/vista/${n.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visto: true })
              })
            )
        );
      } else if (user?.idprefil) {
        await fetch(`${BASE_URL}/api/notificacoes/vista-todas/${user.idprefil}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });
      }

      setNotificacoes(prev => prev.map(notif => ({ ...notif, vista: true })));
      mostrarToast('Todas marcadas como lidas!', 'success');
    } catch (erro) {
      console.error('Erro ao marcar todas como vistas:', erro);
      mostrarToast('Erro ao marcar notificações.', 'error');
    }
  };

  // ➕ CRIAR NOVA NOTIFICAÇÃO — guarda na base de dados (só médicos / admins)
  const criarNotificacao = async () => {
    if (!novaNotificacao.titulo) {
      mostrarToast('Por favor, selecione um tipo de notificação.', 'error');
      return;
    }

    setCriando(true);
    try {
      const payload = {
        titulo: novaNotificacao.titulo,
        descricao: novaNotificacao.descricao || null,
        prefil: novaNotificacao.prefil ? Number(novaNotificacao.prefil) : null,
        visto: false
      };

      console.log('📤 A criar notificação:', payload);

      const resposta = await fetch(`${BASE_URL}/api/notificacoes/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const dados = await resposta.json();

      if (dados.success) {
        mostrarToast('Notificação criada e guardada com sucesso!', 'success');
        setNovaNotificacao({ titulo: 'Consulta Marcada', descricao: '', prefil: '' });
        setMostrarFormulario(false);
        await buscarNotificacoes();
      } else {
        mostrarToast(`Erro: ${dados.error || 'Não foi possível criar a notificação.'}`, 'error');
      }
    } catch (erro) {
      console.error('Erro ao criar notificação:', erro);
      mostrarToast('Erro de conexão ao servidor.', 'error');
    } finally {
      setCriando(false);
    }
  };

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

      {/* INFORMAÇÕES DO UTILIZADOR */}
      <div className={`user-info-card ${isMedico ? 'medico' : ''}`}>
        <h4><i className={`bi ${isMedico ? 'bi-person-badge' : 'bi-person'} me-2`}></i>{user?.nome || 'Utilizador'} — {isMedico ? 'Médico / Gestor' : 'Paciente'}</h4>
        <p>
          <strong>Total:</strong> {notificacoes.length} notificações &nbsp;|&nbsp;
          <strong>Não lidas:</strong> {naoLidas}
        </p>
      </div>

      {/* CABEÇALHO */}
      <div className="notif-header">
        <h3>
          <i className={`bi ${isMedico ? 'bi-clipboard-data' : 'bi-bell'} me-2`}></i>
          {isMedico ? 'Gestão de Notificações' : 'Minhas Notificações'} ({notificacoes.length})
        </h3>

        <div className="notif-actions">
          {isMedico && (
            <button
              id="btn-nova-notificacao"
              className="btn btn-primary"
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
              <i className={`bi ${mostrarFormulario ? 'bi-x-circle' : 'bi-plus-circle'}`}></i>
              {mostrarFormulario ? 'Cancelar' : 'Nova'}
            </button>
          )}
          <button
            id="btn-marcar-todas"
            className="btn btn-primary"
            onClick={marcarTodasComoVistas}
            disabled={notificacoes.length === 0 || naoLidas === 0}
          >
            <i className="bi bi-eye"></i> Marcar Todas
          </button>
          <button
            id="btn-remover-todas"
            className="btn btn-danger-outline"
            onClick={removerTodas}
            disabled={notificacoes.length === 0}
          >
            <i className="bi bi-trash"></i> Remover Todas
          </button>
          <button
            id="btn-atualizar"
            className="btn btn-secondary"
            onClick={buscarNotificacoes}
            disabled={carregando}
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      {/* FORMULÁRIO DE CRIAR (só médicos/admins) */}
      {isMedico && mostrarFormulario && (
        <div className="notif-form">
          <h5><i className="bi bi-bell-plus"></i> Criar Nova Notificação</h5>

          <div className="notif-form-fields">
            {/* Tipo / Título */}
            <div className="notif-form-field">
              <label htmlFor="tipo-notificacao">Tipo de Notificação *</label>
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

            {/* Destinatário */}
            <div className="notif-form-field">
              <label htmlFor="destPerfil">Destinatário</label>
              <select
                id="destPerfil"
                value={novaNotificacao.prefil}
                onChange={(e) => setNovaNotificacao({ ...novaNotificacao, prefil: e.target.value })}
                disabled={carregandoPerfis}
              >
                <option value="">— Geral (Todos os utilizadores) —</option>
                {perfis.map(p => (
                  <option key={p.idutilizadorprefil} value={p.idutilizadorprefil}>
                    {p.nome} {p.profissao ? `(${p.profissao})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div className="notif-form-field" style={{ marginBottom: '15px' }}>
            <label htmlFor="descricao-notificacao">Descrição / Mensagem</label>
            <textarea
              id="descricao-notificacao"
              rows={3}
              placeholder="Escreva os detalhes da notificação..."
              value={novaNotificacao.descricao}
              onChange={(e) => setNovaNotificacao({ ...novaNotificacao, descricao: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--cor-primaria)',
                resize: 'vertical',
                fontFamily: 'inherit',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="notif-form-buttons">
            <button
              id="btn-cancelar-form"
              className="btn btn-secondary"
              onClick={() => setMostrarFormulario(false)}
              disabled={criando}
            >
              <i className="bi bi-x"></i> Cancelar
            </button>
            <button
              id="btn-guardar-notificacao"
              className="btn btn-primary"
              onClick={criarNotificacao}
              disabled={criando}
            >
              {criando
                ? <><i className="bi bi-hourglass-split"></i> A guardar...</>
                : <><i className="bi bi-check-circle"></i> Guardar Notificação</>
              }
            </button>
          </div>
        </div>
      )}

      {/* LISTA DE NOTIFICAÇÕES */}
      {carregando ? (
        <div className="loading-state">
          <i className="bi bi-arrow-repeat" style={{ fontSize: '32px', animation: 'spin 1s linear infinite', display: 'block', marginBottom: '10px' }}></i>
          <p>A carregar notificações...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : notificacoes.length > 0 ? (
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
                  <p className="card-text">
                    <i className="bi bi-clock" style={{ marginRight: '4px' }}></i>
                    {notif.data}
                  </p>
                  {/* Nome do destinatário (só médico vê) */}
                  {isMedico && (
                    <p className="card-text" style={{ fontSize: '12px', marginTop: '4px' }}>
                      <i className="bi bi-person" style={{ marginRight: '4px' }}></i>
                      Para: {notif.perfilNome}
                    </p>
                  )}
                  {notif.descricao && (
                    <p className="card-detalhes">{notif.descricao}</p>
                  )}
                </div>
                <div className="notification-icons">
                  <button
                    type="button"
                    className={`icon-btn view ${notif.vista ? 'vista' : ''}`}
                    onClick={() => toggleVista(notif.id, notif.vista)}
                    aria-label={notif.vista ? 'Marcar como não lida' : 'Marcar como lida'}
                    title={notif.vista ? 'Marcar como não lida' : 'Marcar como lida'}
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
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="bi bi-bell-slash"></i>
          </div>
          <h5>Nenhuma notificação</h5>
          <p>
            {isMedico
              ? 'Não existem notificações. Crie a primeira!'
              : 'Não tem notificações pendentes.'}
          </p>
          {isMedico && (
            <button
              id="btn-criar-primeira"
              className="btn btn-primary"
              onClick={() => setMostrarFormulario(true)}
            >
              <i className="bi bi-plus-circle"></i> Criar Notificação
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Notificacoes;