// src/view/PagInicialCli.jsx - VERSÃO ATUALIZADA COM NAVEGAÇÃO
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App.jsx';
import '../Pag_Inic_cli.css';

const PagInicialCli = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState([]);
  const [notificacoes, setNotificacoes] = useState([
    {
      id: 1,
      title: "Consulta Remarcada",
      time: "02/05 - 18:30",
      pacienteId: user?.id || 1, // Usa ID da conta
      medico: "Dr. Carlos Santos",
      status: "Confirmada",
      tipo: "Limpeza",
      descricao: "Consulta de rotina para limpeza dental",
      local: "Clínica Dental Sorriso - Sala 3"
    },
    {
      id: 2,
      title: "Consulta Marcada",
      time: "04/20 - 9:30",
      pacienteId: user?.id || 1, // Usa ID da conta
      medico: "Dra. Ana Costa",
      status: "Pendente",
      tipo: "Check-up",
      descricao: "Exame dentário completo",
      local: "Clínica Dental Sorriso - Sala 1"
    }
  ]);

  // Função para ir para notificações
  const handleVerNotificacoes = () => {
    navigate('/frontoffice/notificacoes/');
  };

  // Função para expandir/recolher cards
  const toggleCard = (id) => {
    if (expandedCards.includes(id)) {
      setExpandedCards(expandedCards.filter(cardId => cardId !== id));
    } else {
      setExpandedCards([...expandedCards, id]);
    }
  };

  // Funções para ações do paciente
  const handleAction = (action, notificacao) => {
    switch(action) {
      case 'view':
        alert(`📋 DETALHES DA CONSULTA\n\n📌 ${notificacao.title}\n📅 ${notificacao.time}\n👤 Paciente: ${user?.nome}\n👨‍⚕️ Médico: ${notificacao.medico}\n🏥 Local: ${notificacao.local}\n📝 Tipo: ${notificacao.tipo}\n📋 Descrição: ${notificacao.descricao}`);
        break;
      
      
        const novaData = prompt(`📅 REMARCAR CONSULTA\n\nPaciente: ${user?.nome}\n\nDigite a nova data/hora (formato: DD/MM - HH:MM):\nExemplo: 15/12 - 14:30`, notificacao.time);
        if (novaData && novaData.trim() !== '') {
          setNotificacoes(notificacoes.map(n => 
            n.id === notificacao.id ? { 
              ...n, 
              time: novaData.trim(),
              title: "Consulta Remarcada",
              status: "Remarcada"
            } : n
          ));
          alert('✅ Consulta remarcada com sucesso!');
        }
        break;
      
      case 'confirm':
        setNotificacoes(notificacoes.map(n => 
          n.id === notificacao.id ? { 
            ...n, 
            status: "Confirmada"
          } : n
        ));
        alert('✅ Consulta confirmada com sucesso!');
        break;
      
      case 'cancel':
        if (window.confirm(`❌ CANCELAR CONSULTA\n\nPaciente: ${user?.nome}\n\nTem certeza que deseja cancelar esta consulta?\n\n${notificacao.title}\n📅 ${notificacao.time}`)) {
          setNotificacoes(notificacoes.map(n => 
            n.id === notificacao.id ? { 
              ...n, 
              title: "Consulta Cancelada",
              status: "Cancelada"
            } : n
          ));
          alert('❌ Consulta cancelada com sucesso!');
        }
        break;
      
      default:
        break;
    }
  };

  // Função para ver agenda
  const handleViewAgenda = () => {
    navigate('/frontoffice/historico/');
  };

  // Função para solicitar nova consulta
  const handleSolicitarConsulta = () => {
    const tipo = prompt(`📝 SOLICITAR NOVA CONSULTA\n\nPaciente: ${user?.nome}\n\nTipo de consulta (Limpeza, Check-up, Extração, Ortodontia):`);
    if (!tipo) return;
    
    const descricao = prompt('📋 Descreva o motivo da consulta:');
    if (!descricao) return;
    
    // Adicionar nova consulta
    const novaConsulta = {
      id: notificacoes.length + 1,
      title: "Consulta Solicitada",
      time: "A confirmar",
      pacienteId: user?.id,
      medico: "A definir",
      status: "Pendente",
      tipo: tipo,
      descricao: descricao,
      local: "Clínica Dental Sorriso"
    };
    
    setNotificacoes([...notificacoes, novaConsulta]);
    alert(`✅ Solicitação enviada!\n\n👤 Paciente: ${user?.nome}\n📝 Tipo: ${tipo}\n📋 Motivo: ${descricao}\n\nA clínica entrará em contato para confirmar a data.`);
  };

  // Função para baixar comprovante
  const handleDownloadComprovante = (notificacao) => {
    alert(`📄 Baixando comprovante da consulta:\n\nPaciente: ${user?.nome}\n📅 ${notificacao.time}\n👨‍⚕️ ${notificacao.medico}\n🏥 ${notificacao.local}`);
  };

  return (
    <div className="pagina-cliente-conteudo">
      {/* Cabeçalho com informações do usuário */}
     <div style={{
  backgroundColor: '#f0f7ff',
  border: '2px solid #A99C5E',
  borderRadius: '10px',
  padding: '15px',
  marginBottom: '20px'
}}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <h3 style={{ color: '#A99C5E', marginBottom: '10px' }}>
        <i className="bi bi-person-circle"></i> Bem-vindo, {user?.nome}!
      </h3>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <strong>👤 ID Conta:</strong> {user?.id}
        </div>
        <div>
          <strong>📧 Email:</strong> {user?.email}
        </div>
        <div>
          <strong>🎫 Tipo:</strong> Paciente
        </div>
        <div>
          <strong>🔢 idtipoconta:</strong> {user?.idtipoconta}
        </div>
        <div>
          <strong>🆔 ID Perfil:</strong> {user?.idprefil || 'Não vinculado'}
        </div>
      </div>
    </div>
    
    {/* Botão para Notificações */}
    <button 
      onClick={handleVerNotificacoes}
      style={{
        backgroundColor: '#A99C5E',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '30px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: 'bold'
      }}
    >
      <i className="bi bi-bell-fill"></i> Ver Notificações
    </button>
  </div>
</div>
      
      {/* Título das consultas */}
      <div className="titulo-secao">
        <h2><i className="bi bi-calendar-check"></i> Minhas Consultas</h2>
        <button className="btn-solicitar" onClick={handleSolicitarConsulta}>
          <i className="bi bi-calendar-plus"></i> Solicitar Consulta
        </button>
      </div>
      
      {/* Cards de consultas */}
      <div className="cards-container">
        {notificacoes.length > 0 ? (
          notificacoes
            .filter(notif => notif.pacienteId === user?.id)
            .map((notificacao) => (
            <div 
              key={notificacao.id}
              className={`notification-card ${expandedCards.includes(notificacao.id) ? 'expanded' : ''}`}
            >
              <div className="card-header" onClick={() => toggleCard(notificacao.id)}>
                <div className="card-main-info">
                  <h3 className="card-title">
                    <i className="bi bi-calendar-check"></i> {notificacao.title}
                  </h3>
                  <p className="card-time">
                    <i className="bi bi-clock"></i> {notificacao.time}
                  </p>
                  <div className={`card-badge status-${notificacao.status.toLowerCase()}`}>
                    {notificacao.status === 'Confirmada' ? '✅ Confirmada' :
                     notificacao.status === 'Pendente' ? '⏳ Pendente' :
                     notificacao.status === 'Cancelada' ? '❌ Cancelada' :
                     notificacao.status === 'Remarcada' ? '🔄 Remarcada' : notificacao.status}
                  </div>
                </div>
                <i className={`bi bi-chevron-down expand-icon ${expandedCards.includes(notificacao.id) ? 'rotated' : ''}`}></i>
              </div>
              
              {expandedCards.includes(notificacao.id) && (
                <div className="card-expanded-content">
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-person"></i> Paciente:</span>
                      <span className="detail-value">{user?.nome}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-person-badge"></i> Médico:</span>
                      <span className="detail-value">{notificacao.medico}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-geo-alt"></i> Local:</span>
                      <span className="detail-value">{notificacao.local}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-clipboard"></i> Tipo:</span>
                      <span className="detail-value">{notificacao.tipo}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-chat-text"></i> Descrição:</span>
                      <span className="detail-value">{notificacao.descricao}</span>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <div className="action-buttons">
                      <button 
                        className="btn-action btn-view"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('view', notificacao);
                        }}
                      >
                        <i className="bi bi-eye-fill"></i> Ver Detalhes
                      </button>
                      
                      <button 
                        className="btn-action btn-download"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadComprovante(notificacao);
                        }}
                      >
                        <i className="bi bi-download"></i> Comprovante
                      </button>
                      
                      {notificacao.status === 'Pendente' && (
                        <button 
                          className="btn-action btn-confirm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('confirm', notificacao);
                          }}
                        >
                          <i className="bi bi-check-circle-fill"></i> Confirmar
                        </button>
                      )}
                      
    {notificacao.status !== 'Cancelada' && notificacao.status !== 'Remarcada' && (
                        <>
                          <button 
                            className="btn-action btn-reschedule"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction('reschedule', notificacao);
                            }}
                          >
                            <i className="bi bi-calendar2-event"></i> Remarcar
                          </button>
                          
                          <button 
                            className="btn-action btn-cancel"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction('cancel', notificacao);
                            }}
                          >
                            <i className="bi bi-x-circle-fill"></i> Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <i className="bi bi-calendar-x"></i>
            <h4>Nenhuma consulta agendada</h4>
            <p>Olá {user?.nome}, você não possui consultas marcadas no momento.</p>
            <button className="btn-solicitar" onClick={handleSolicitarConsulta}>
              <i className="bi bi-calendar-plus"></i> Solicitar Minha Primeira Consulta
            </button>
          </div>
        )}
      </div>
      
      {/* Guia de Tratamento */}
      <div className="guia-tratamento">
        <h3><i className="bi bi-journal-medical"></i> Guia de Tratamento de {user?.nome}</h3>
        <div className="guia-content">
          <p>
            <strong>📋 Instruções personalizadas:</strong><br/>
            • Lavar os dentes depois do almoço e do jantar<br/>
            • Evitar bruxamento dos dentes<br/>
            • Diminuir a quantidade de chocolate consumido<br/>
            • Usar fio dental diariamente<br/>
            • Realizar bochechos com flúor 2x por semana
          </p>
          <div className="guia-actions">
            <button className="btn-guia">
              <i className="bi bi-download"></i> Baixar Guia Completo
            </button>
            <button className="btn-guia">
              <i className="bi bi-printer"></i> Imprimir
            </button>
            <button className="btn-guia">
              <i className="bi bi-share"></i> Compartilhar com Familiar
            </button>
          </div>
        </div>
      </div>
      
      {/* Botão Ver Agenda */}
      <div className="ver-agenda-container">
        <button className="btn-ver-agenda" onClick={handleViewAgenda}>
          <i className="bi bi-calendar3"></i> Ver Agenda Completa de {user?.nome}
        </button>
      </div>
    </div>
  );
};

export default PagInicialCli;