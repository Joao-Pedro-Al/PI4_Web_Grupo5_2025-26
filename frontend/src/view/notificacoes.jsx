import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App.jsx';
import './Pag_Not.css';

const Notificacoes = () => {
  const { user } = useContext(AuthContext);
  
  // Estado para perfil ativo (agora usa o ID do usuário logado)
  const [perfilAtivo, setPerfilAtivo] = useState(user?.id || 1);
  
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
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

  // 🔄 FUNÇÃO PARA BUSCAR NOTIFICAÇÕES DA API
  const buscarNotificacoes = async () => {
    if (!user?.id) {
      // Se não tem usuário, usa dados mockados baseados no tipo
      const mockNotificacoes = getMockNotificacoes();
      setNotificacoes(mockNotificacoes);
      setCarregando(false);
      return;
    }
    
    setCarregando(true);
    try {
      // Tenta buscar da API
      const resposta = await fetch(`http://localhost:3000/api/notificacoes/list/${user.id}`);
      
      if (!resposta.ok) {
        throw new Error('API não disponível');
      }
      
      const dados = await resposta.json();
      
      if (dados.success) {
        // Transforma os dados da API para o formato do frontend
        const notificacoesFormatadas = dados.data.map(notif => ({
          id: notif.idnotificacao,
          titulo: notif.titulo,
          data: formatarDataBackend(notif.data_criacao || new Date()),
          vista: notif.visto,
          removing: false
        }));
        
        setNotificacoes(notificacoesFormatadas);
      } else {
        console.error('Erro ao buscar notificações:', dados.error);
        // Fallback para dados mockados
        const mockNotificacoes = getMockNotificacoes();
        setNotificacoes(mockNotificacoes);
      }
    } catch (erro) {
      console.error('Erro de conexão, usando dados mockados:', erro);
      // Fallback para dados mockados
      const mockNotificacoes = getMockNotificacoes();
      setNotificacoes(mockNotificacoes);
    } finally {
      setCarregando(false);
    }
  };

  // 📋 FUNÇÃO PARA GERAR NOTIFICAÇÕES MOCKADAS BASEADAS NO TIPO DE USUÁRIO
  const getMockNotificacoes = () => {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    
    if (user?.tipo === 'medico') {
      // NOTIFICAÇÕES PARA MÉDICOS
      return [
        {
          id: 1,
          titulo: "Nova Consulta Marcada",
          data: formatarData(hoje),
          vista: false,
          removing: false,
          detalhes: "Paciente: João Silva às 10:30"
        },
        {
          id: 2,
          titulo: "Consulta Remarcada",
          data: formatarData(hoje),
          vista: true,
          removing: false,
          detalhes: "Maria Santos para amanhã 14:00"
        },
        {
          id: 3,
          titulo: "Resultados de Exames Disponíveis",
          data: formatarData(amanha),
          vista: false,
          removing: false,
          detalhes: "Raio-X do paciente Carlos disponível"
        },
        {
          id: 4,
          titulo: "Lembrete de Reunião",
          data: formatarData(hoje),
          vista: true,
          removing: false,
          detalhes: "Reunião de equipe às 16:00"
        }
      ];
    } else {
      // NOTIFICAÇÕES PARA PACIENTES
      return [
        {
          id: 1,
          titulo: "Consulta Confirmada",
          data: formatarData(hoje),
          vista: false,
          removing: false,
          detalhes: "Consulta com Dr. Carlos amanhã às 10:00"
        },
        {
          id: 2,
          titulo: "Lembrete de Consulta",
          data: formatarData(amanha),
          vista: true,
          removing: false,
          detalhes: "Sua consulta está marcada para amanhã"
        },
        {
          id: 3,
          titulo: "Resultados de Exames",
          data: formatarData(hoje),
          vista: false,
          removing: false,
          detalhes: "Seus resultados de exames estão disponíveis"
        },
        {
          id: 4,
          titulo: "Mensagem do Médico",
          data: formatarData(hoje),
          vista: true,
          removing: false,
          detalhes: "Dr. Carlos enviou uma mensagem sobre seu tratamento"
        }
      ];
    }
  };

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

  // ➕ CRIAR NOVA NOTIFICAÇÃO (apenas médicos)
  const criarNotificacao = () => {
    if (!novaNotificacao.data || !novaNotificacao.hora) {
      alert("Por favor, preencha a data e hora");
      return;
    }

    const novaNotif = {
      id: notificacoes.length + 1,
      titulo: novaNotificacao.titulo,
      data: `${novaNotificacao.data} - ${novaNotificacao.hora}`,
      vista: false,
      removing: false,
      detalhes: `Notificação criada por ${user?.nome}`
    };

    setNotificacoes([novaNotif, ...notificacoes]);
    setNovaNotificacao({
      titulo: "Consulta Marcada",
      data: "",
      hora: ""
    });
    setMostrarFormulario(false);
    alert('✅ Notificação criada com sucesso!');
  };

  // 📥 BUSCAR NOTIFICAÇÕES QUANDO O COMPONENTE CARREGA
  useEffect(() => {
    buscarNotificacoes();
  }, [user?.id, user?.tipo]);

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

  // 🔽 FUNÇÕES DE FORMATAÇÃO DO FORMULÁRIO
  const formatarDataInput = (data) => {
    const apenasNumeros = data.replace(/\D/g, '');
    if (apenasNumeros.length >= 2) {
      return `${apenasNumeros.substring(0, 2)}/${apenasNumeros.substring(2, 4)}`;
    }
    return data;
  };

  const formatarHora = (hora) => {
    const apenasNumeros = hora.replace(/\D/g, '');
    if (apenasNumeros.length >= 2) {
      return `${apenasNumeros.substring(0, 2)}:${apenasNumeros.substring(2, 4)}`;
    }
    return hora;
  };

  // Informações do usuário logado
  const userInfo = user ? `${user.nome} - ${user.tipo === 'medico' ? 'Médico' : 'Paciente'}` : 'Não logado';

  return (
    <div className="conteudo-notificacoes">
      
      {/* INFORMAÇÕES DO USUÁRIO LOGADO */}
      <div style={{
        backgroundColor: user?.tipo === 'medico' ? '#f0f7ff' : '#f7f0ff',
        border: '2px solid #A99C5E',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: '#A99C5E', marginBottom: '10px' }}>
          {user?.tipo === 'medico' ? '🩺' : '👤'} {userInfo}
        </h4>
        <p style={{ color: '#666', fontSize: '14px' }}>
          <strong>Total de notificações:</strong> {notificacoes.length} | 
          <strong> Não lidas:</strong> {notificacoes.filter(n => !n.vista).length}
        </p>
      </div>

      {/* CABEÇALHO COM FILTROS */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        padding: "0 10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <h3 style={{ color: "#A99C5E", margin: 0, fontSize: "20px" }}>
            {user?.tipo === 'medico' ? '📋 Notificações da Clínica' : '🔔 Minhas Notificações'} 
            ({notificacoes.length})
          </h3>
        </div>
        
        {/* BOTÕES DE AÇÃO */}
        <div style={{ display: "flex", gap: "10px" }}>
          {user?.tipo === 'medico' && (
            <button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              style={{ 
                backgroundColor: "#A99C5E", 
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "8px 15px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <i className="bi bi-plus-circle"></i> 
              {mostrarFormulario ? "Cancelar" : "Nova"}
            </button>
          )}
          <button 
            onClick={marcarTodasComoVistas}
            style={{ 
              backgroundColor: "#A99C5E", 
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: notificacoes.length === 0 ? 0.5 : 1
            }}
            disabled={notificacoes.length === 0}
          >
            <i className="bi bi-eye"></i> Marcar Todas
          </button>
          <button 
            onClick={removerTodas}
            style={{ 
              backgroundColor: "#fff0f0", 
              color: "#c0392b",
              border: "2px solid #e74c3c",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: notificacoes.length === 0 ? 0.5 : 1
            }}
            disabled={notificacoes.length === 0}
          >
            <i className="bi bi-trash"></i> Remover Todas
          </button>
        </div>
      </div>

      {/* FORMULÁRIO (só para médicos) */}
      {user?.tipo === 'medico' && mostrarFormulario && (
        <div style={{
          backgroundColor: "#FFF9E6",
          border: "1px solid #A99C5E",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px"
        }}>
          <h5 style={{ color: "#A99C5E", marginBottom: "15px" }}>
            <i className="bi bi-bell-plus"></i> Criar Nova Notificação para Pacientes
          </h5>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginBottom: "15px" }}>
            <div style={{ flex: "1", minWidth: "200px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#827847", fontSize: "14px" }}>
                Tipo de Notificação
              </label>
              <select
                value={novaNotificacao.titulo}
                onChange={(e) => setNovaNotificacao({...novaNotificacao, titulo: e.target.value})}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #A99C5E",
                  backgroundColor: "white",
                  color: "#333"
                }}
              >
                {tiposNotificacao.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: "1", minWidth: "150px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#827847", fontSize: "14px" }}>
                Data (DD/MM)
              </label>
              <input
                type="text"
                value={novaNotificacao.data}
                onChange={(e) => setNovaNotificacao({...novaNotificacao, data: formatarDataInput(e.target.value)})}
                placeholder="DD/MM"
                maxLength="5"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #A99C5E"
                }}
              />
            </div>
            <div style={{ flex: "1", minWidth: "150px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#827847", fontSize: "14px" }}>
                Hora (HH:MM)
              </label>
              <input
                type="text"
                value={novaNotificacao.hora}
                onChange={(e) => setNovaNotificacao({...novaNotificacao, hora: formatarHora(e.target.value)})}
                placeholder="HH:MM"
                maxLength="5"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #A99C5E"
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              onClick={() => {
                const agora = new Date();
                const dia = String(agora.getDate()).padStart(2, '0');
                const mes = String(agora.getMonth() + 1).padStart(2, '0');
                const hora = String(agora.getHours()).padStart(2, '0');
                const minutos = String(agora.getMinutes()).padStart(2, '0');
                
                setNovaNotificacao({
                  ...novaNotificacao,
                  data: `${dia}/${mes}`,
                  hora: `${hora}:${minutos}`
                });
              }}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <i className="bi bi-clock"></i> Preencher Agora
            </button>
            <button
              onClick={criarNotificacao}
              style={{
                backgroundColor: "#A99C5E",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
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
              className={`card notification 
                ${notif.vista ? 'visto' : ''} 
                ${notif.removing ? 'removing' : ''}`}
              style={{
                borderLeft: notif.vista ? 'none' : '5px solid #ff6b6b'
              }}
            >
              <div className="card-body">
                <div className="text-container">
                  <h5 className="card-title">
                    {notif.titulo}
                    {!notif.vista && (
                      <span style={{
                        backgroundColor: '#ff6b6b',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        marginLeft: '10px'
                      }}>
                        NOVA
                      </span>
                    )}
                  </h5>
                  <p className="card-text">{notif.data}</p>
                  {notif.detalhes && (
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      {notif.detalhes}
                    </p>
                  )}
                </div>
                <div className="notification-icons">
                  <i 
                    className={`bi ${notif.vista ? 'bi-eye-slash' : 'bi-eye'} toggle-view`}
                    onClick={() => toggleVista(notif.id)}
                    title={notif.vista ? "Marcar como não lida" : "Marcar como lida"}
                    style={{ color: notif.vista ? '#827847' : '#4a6bff' }}
                  ></i>
                  <i 
                    className="bi bi-trash delete"
                    onClick={() => removerNotificacao(notif.id)}
                    title="Remover notificação"
                  ></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !carregando ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "48px", color: "#A99C5E", marginBottom: "15px", opacity: 0.5 }}>
            <i className="bi bi-bell-slash"></i>
          </div>
          <h5 style={{ color: "#A99C5E", marginBottom: "8px", fontSize: "16px", fontWeight: "600" }}>
            Nenhuma notificação
          </h5>
          <p style={{ color: "#827847", marginBottom: "25px", fontSize: "10px" }}>
            {user?.tipo === 'medico' 
              ? "Você não tem notificações no momento." 
              : "Você não tem notificações pendentes."}
          </p>
          {user?.tipo === 'medico' && (
            <button 
              onClick={() => setMostrarFormulario(true)}
              style={{ 
                backgroundColor: "#A99C5E", 
                color: "white",
                padding: "8px 20px",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer"
              }}
            >
              <i className="bi bi-plus-circle"></i> Criar Notificação
            </button>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p style={{ color: "#A99C5E" }}>Carregando notificações...</p>
        </div>
      )}
    </div>
  );
};

export default Notificacoes;