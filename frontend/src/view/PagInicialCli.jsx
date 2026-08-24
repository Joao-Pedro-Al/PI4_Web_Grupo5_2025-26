// src/view/PagInicialCli.jsx - DADOS REAIS DA BASE DE DADOS
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App.jsx';
import '../Pag_Inic_cli.css';

const BASE_URL = 'http://localhost:3000';

const PagInicialCli = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 CARREGAR CONSULTAS DA BD PARA O PACIENTE LOGADO (MÁX 3 CARDS MAIS RELEVANTES)
  const carregarConsultasPaciente = useCallback(async () => {
    setLoading(true);
    try {
      const perfilId = user?.idprefil || user?.id;
      if (!perfilId) {
        setLoading(false);
        return;
      }

      console.log('🔄 A carregar consultas do paciente ID/Perfil:', perfilId);
      const response = await fetch(`${BASE_URL}/api/consultas/list/${perfilId}`);
      const data = await response.json();

      if (data.success && data.data) {
        const agora = new Date();

        const formatadas = data.data.map(c => {
          let rawDate = c.data ? (typeof c.data === 'string' ? c.data.split('T')[0] : new Date(c.data).toISOString().split('T')[0]) : '2026-01-01';
          let rawHora = c.hora ? (c.hora.length === 5 ? `${c.hora}:00` : c.hora) : '00:00:00';
          
          const [y, m, d] = rawDate.split('-').map(Number);
          const [hh, mm, ss] = rawHora.split(':').map(Number);
          const dataObj = new Date(y, m - 1, d, hh, mm, ss || 0);

          let dataStr = rawDate;
          const partes = rawDate.split('-');
          if (partes.length === 3) {
            dataStr = `${partes[2].padStart(2, '0')}/${partes[1].padStart(2, '0')}/${partes[0]}`;
          }
          
          const horaInicio = c.hora ? c.hora.substring(0, 5) : '';
          const horaFim = c.horaFim ? c.horaFim.substring(0, 5) : '';
          const horario = horaFim ? `${horaInicio} — ${horaFim}` : horaInicio;
          const isPassada = dataObj < agora;

          return {
            id: c.idconsulta,
            title: c.TipoMarcacaoData?.desling || c.detalhes || 'Consulta Dentária',
            dataObj: dataObj,
            isPassada: isPassada,
            dataFormatted: dataStr,
            horario: horario,
            time: `${dataStr} (${horario})`,
            medico: c.medico || 'Médico Dentista',
            status: c.estadimarcacao ? (isPassada ? 'Realizada' : 'Confirmada') : 'Cancelada',
            tipo: c.TipoMarcacaoData?.desling || 'Consulta',
            descricao: c.detalhes || 'Consulta de rotina agendada na clínica.',
            guia: c.guia_tratamento || null,
            local: 'Clínica Dental Sorriso - Sala de Atendimento'
          };
        });

        // Separar entre passadas e futuras
        const passadas = formatadas.filter(c => c.isPassada).sort((a, b) => b.dataObj - a.dataObj);
        const futuras = formatadas.filter(c => !c.isPassada).sort((a, b) => a.dataObj - b.dataObj);

        let selecionadas = [];

        if (passadas.length > 0) {
          // 1. Última consulta realizada (passada mais recente)
          selecionadas.push({ ...passadas[0], tag: 'Última Consulta (Realizada)', tagColor: '#6c757d' });

          // 2. Próxima consulta (futura mais próxima)
          if (futuras.length > 0) {
            selecionadas.push({ ...futuras[0], tag: 'Próxima Consulta', tagColor: '#28a745' });
          }

          // 3. Consulta seguinte
          if (futuras.length > 1) {
            selecionadas.push({ ...futuras[1], tag: 'Consulta Seguinte', tagColor: '#17a2b8' });
          } else if (passadas.length > 1 && selecionadas.length < 3) {
            selecionadas.push({ ...passadas[1], tag: 'Consulta Anterior', tagColor: '#6c757d' });
          }
        } else {
          // Se não há passadas, selecionar até 3 futuras
          futuras.slice(0, 3).forEach((c, idx) => {
            let tag = idx === 0 ? 'Próxima Consulta' : `Consulta Futura (${idx + 1})`;
            let tagColor = idx === 0 ? '#28a745' : '#17a2b8';
            selecionadas.push({ ...c, tag, tagColor });
          });
        }

        console.log('✅ Consultas selecionadas para a Home (Máx 3):', selecionadas.length);
        setConsultas(selecionadas);
      }
    } catch (error) {
      console.error('Erro ao carregar consultas do paciente:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.idprefil, user?.id]);

  useEffect(() => {
    carregarConsultasPaciente();
  }, [carregarConsultasPaciente]);

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
  const handleAction = async (action, notificacao) => {
    switch(action) {
      case 'view':
        alert(`DETALHES DA CONSULTA\n\n📌 ${notificacao.title}\nData: ${notificacao.time}\nPaciente: ${user?.nome}\nMédico: ${notificacao.medico}\nLocal: ${notificacao.local}\nTipo: ${notificacao.tipo}\nDescrição: ${notificacao.descricao}`);
        break;
      
      case 'cancel':
        if (window.confirm(`CANCELAR CONSULTA\n\nPaciente: ${user?.nome}\n\nTem certeza que deseja cancelar esta consulta?\n\n${notificacao.title}\nData: ${notificacao.time}`)) {
          try {
            const res = await fetch(`${BASE_URL}/api/consultas/delete/${notificacao.id}`, {
              method: 'DELETE'
            });
            const d = await res.json();
            if (d.success) {
              alert('Consulta cancelada com sucesso!');
              await carregarConsultasPaciente();
            } else {
              alert(`Erro ao cancelar consulta: ${d.message}`);
            }
          } catch (e) {
            console.error('Erro ao cancelar consulta:', e);
            alert('Erro de ligação ao servidor.');
          }
        }
        break;
      
      default:
        break;
    }
  };

  // Função para ver agenda completa
  const handleViewAgenda = () => {
    navigate('/frontoffice/historico/');
  };

  // Função para baixar comprovante
  const handleDownloadComprovante = (notificacao) => {
    alert(`A descarregar comprovativo da consulta:\n\nPaciente: ${user?.nome}\nData: ${notificacao.time}\nMédico: ${notificacao.medico}\nLocal: ${notificacao.local}`);
  };

  // Extrair o último guia de tratamento do paciente
  const ultimoGuia = consultas.find(c => c.guia && c.guia.trim() !== '')?.guia;

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
              <i className="bi bi-person-circle me-2"></i>Bem-vindo, {user?.nome}!
            </h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <i className="bi bi-envelope me-1"></i><strong>Email:</strong> {user?.email}
              </div>
              <div>
                <i className="bi bi-person-badge me-1"></i><strong>Tipo de Conta:</strong> Paciente
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
        <h2><i className="bi bi-calendar-check me-2"></i>Minhas Consultas Agendadas</h2>
      </div>
      
      {/* Cards de consultas */}
      <div className="cards-container">
        {loading ? (
          <div className="text-center p-5">
            <i className="bi bi-arrow-repeat spin fs-1 text-primary"></i>
            <p className="mt-2 text-muted">A carregar as suas consultas da base de dados...</p>
          </div>
        ) : consultas.length > 0 ? (
          consultas.map((notificacao) => (
            <div 
              key={notificacao.id}
              className={`notification-card ${expandedCards.includes(notificacao.id) ? 'expanded' : ''}`}
            >
              <div className="card-header" onClick={() => toggleCard(notificacao.id)}>
                <div className="card-main-info">
                  <h3 className="card-title">
                    <i className="bi bi-calendar-check me-2"></i>{notificacao.title}
                  </h3>
                  <p className="card-time">
                    <i className="bi bi-clock me-1"></i>{notificacao.time}
                  </p>
                  <div className="d-flex gap-2 align-items-center mt-2 flex-wrap">
                    {notificacao.tag && (
                      <span className="badge" style={{ backgroundColor: notificacao.tagColor || '#6c757d', color: 'white', fontSize: '12px', padding: '5px 10px', borderRadius: '12px' }}>
                        {notificacao.tag}
                      </span>
                    )}
                    <div className={`card-badge status-${notificacao.status.toLowerCase()}`}>
                      <i className="bi bi-check-circle-fill me-1"></i>{notificacao.status}
                    </div>
                  </div>
                </div>
                <i className={`bi bi-chevron-down expand-icon ${expandedCards.includes(notificacao.id) ? 'rotated' : ''}`}></i>
              </div>
              
              {expandedCards.includes(notificacao.id) && (
                <div className="card-expanded-content">
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-person me-1"></i>Paciente:</span>
                      <span className="detail-value">{user?.nome}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-person-badge me-1"></i>Médico:</span>
                      <span className="detail-value">{notificacao.medico}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-geo-alt me-1"></i>Local:</span>
                      <span className="detail-value">{notificacao.local}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-clipboard me-1"></i>Tipo:</span>
                      <span className="detail-value">{notificacao.tipo}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-chat-text me-1"></i>Descrição:</span>
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
                        <i className="bi bi-eye-fill me-1"></i> Ver Detalhes
                      </button>
                      
                      <button 
                        className="btn-action btn-download"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadComprovante(notificacao);
                        }}
                      >
                        <i className="bi bi-download me-1"></i> Comprovante
                      </button>

                      {!notificacao.isPassada && notificacao.status !== 'Cancelada' && (
                        <button 
                          className="btn-action btn-cancel"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('cancel', notificacao);
                          }}
                        >
                          <i className="bi bi-x-circle-fill me-1"></i> Cancelar Consulta
                        </button>
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
            <p>Olá {user?.nome}, não possui consultas marcadas no momento na base de dados.</p>
          </div>
        )}
      </div>
      
      {/* Guia de Tratamento */}
      <div className="guia-tratamento">
        <h3><i className="bi bi-journal-medical me-2"></i>Guia de Tratamento de {user?.nome}</h3>
        <div className="guia-content">
          {ultimoGuia ? (
            <p>
              <strong>Indicação Médica Registada:</strong><br/>
              {ultimoGuia}
            </p>
          ) : (
            <p>
              <strong>Instruções gerais de cuidados:</strong><br/>
              • Lavar os dentes depois do almoço e do jantar<br/>
              • Evitar bruxamento dos dentes<br/>
              • Usar fio dental diariamente<br/>
              • Realizar bochechos com flúor 2x por semana
            </p>
          )}
          <div className="guia-actions">
            <button className="btn-guia" onClick={() => alert('A descarregar guia completo em PDF...')}>
              <i className="bi bi-download me-1"></i> Baixar Guia Completo
            </button>
            <button className="btn-guia" onClick={() => window.print()}>
              <i className="bi bi-printer me-1"></i> Imprimir
            </button>
          </div>
        </div>
      </div>
      
      {/* Botão Ver Agenda Completa */}
      <div className="ver-agenda-container">
        <button className="btn-ver-agenda" onClick={handleViewAgenda}>
          <i className="bi bi-calendar3 me-1"></i> Ver Histórico e Agenda Completa
        </button>
      </div>
    </div>
  );
};

export default PagInicialCli;