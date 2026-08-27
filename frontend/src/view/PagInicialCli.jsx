// src/view/PagInicialCli.jsx - DADOS REAIS DA BASE DE DADOS COM GUIA DE TRATAMENTO E DECLARAÇÕES OFICIAIS
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App.jsx';
import '../Pag_Inic_cli.css';
import urlGlobal from './url_global';

const BASE_URL = urlGlobal.endsWith('/') ? urlGlobal.slice(0, -1) : urlGlobal;

const PagInicialCli = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [ultimoGuiaInfo, setUltimoGuiaInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 CARREGAR CONSULTAS DA BD PARA O PACIENTE LOGADO
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

        // 1. Processar todas as consultas
        const todasFormatadas = data.data.map(c => {
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
          const horaFim = c.horaFim ? c.horaFim.substring(0, 5) : (c.horafim ? c.horafim.substring(0, 5) : '');
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
            acompanhante: c.acompanhante || null,
            local: 'CliniMolelos - Sala de Medicina Dentária'
          };
        });

        // 2. Extrair o ÚLTIMO Guia de Tratamento anotado pelo médico
        const consultasComGuia = [...todasFormatadas]
          .filter(c => (c.guia && c.guia.trim() !== '') || (c.descricao && c.descricao.trim() !== ''))
          .sort((a, b) => b.dataObj - a.dataObj);

        if (consultasComGuia.length > 0) {
          const maisRecente = consultasComGuia[0];
          setUltimoGuiaInfo({
            texto: maisRecente.guia || maisRecente.descricao,
            data: maisRecente.dataFormatted,
            medico: maisRecente.medico,
            tipo: maisRecente.title
          });
        } else {
          setUltimoGuiaInfo(null);
        }

        // 3. Separar entre passadas e futuras para os 3 cards do topo
        const passadas = todasFormatadas.filter(c => c.isPassada).sort((a, b) => b.dataObj - a.dataObj);
        const futuras = todasFormatadas.filter(c => !c.isPassada).sort((a, b) => a.dataObj - b.dataObj);

        let selecionadas = [];

        if (passadas.length > 0) {
          selecionadas.push({ ...passadas[0], tag: 'Última Consulta (Realizada)', tagColor: '#6c757d' });

          if (futuras.length > 0) {
            selecionadas.push({ ...futuras[0], tag: 'Próxima Consulta', tagColor: '#28a745' });
          }

          if (futuras.length > 1) {
            selecionadas.push({ ...futuras[1], tag: 'Consulta Seguinte', tagColor: '#17a2b8' });
          } else if (passadas.length > 1 && selecionadas.length < 3) {
            selecionadas.push({ ...passadas[1], tag: 'Consulta Anterior', tagColor: '#6c757d' });
          }
        } else {
          futuras.slice(0, 3).forEach((c, idx) => {
            let tag = idx === 0 ? 'Próxima Consulta' : `Consulta Futura (${idx + 1})`;
            let tagColor = idx === 0 ? '#28a745' : '#17a2b8';
            selecionadas.push({ ...c, tag, tagColor });
          });
        }

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

  const handleVerNotificacoes = () => {
    navigate('/frontoffice/notificacoes/');
  };

  const toggleCard = (id) => {
    if (expandedCards.includes(id)) {
      setExpandedCards(expandedCards.filter(cardId => cardId !== id));
    } else {
      setExpandedCards([...expandedCards, id]);
    }
  };

  // Impressão oficial do comprovativo do paciente
  const handleImprimirComprovativoPaciente = (notificacao) => {
    const pacienteNome = user?.nome || 'Paciente';
    const dataStr = notificacao.dataFormatted;
    const horario = notificacao.horario;
    const medico = notificacao.medico || 'Dra. Maria Santos';
    const tipo = notificacao.title || 'Consulta de Medicina Dentária';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Declaração de Presença — ${pacienteNome}</title>
          <style>
            @page { size: A4; margin: 25mm 20mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2B2519; margin: 0; padding: 20px; line-height: 1.7; }
            .header { text-align: center; border-bottom: 2.5px solid #A99C5E; padding-bottom: 20px; margin-bottom: 35px; }
            .logo-title { color: #A99C5E; font-size: 26px; font-weight: bold; letter-spacing: 1.5px; margin: 0; }
            .subtitle { color: #666; font-size: 13px; margin: 5px 0 0; text-transform: uppercase; letter-spacing: 1px; }
            .doc-title { text-align: center; color: #2B2519; font-size: 18px; font-weight: bold; margin-bottom: 35px; text-transform: uppercase; text-decoration: underline; text-underline-offset: 6px; }
            .content { font-size: 16px; text-align: justify; background: #FAF8F5; padding: 30px; border-radius: 12px; border: 1px solid #E5DFD5; margin-bottom: 40px; }
            .content p { margin: 0 0 15px; }
            .meta-info { font-size: 14px; color: #555; margin-top: 30px; }
            .footer { margin-top: 60px; text-align: right; }
            .sig-box { display: inline-block; text-align: center; border-top: 1.5px solid #2B2519; width: 280px; padding-top: 8px; font-size: 13px; font-weight: 600; }
            .clinic-footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="logo-title">CLINIMOLELOS</h1>
            <p class="subtitle">Clínica de Medicina Dentária & Bem-Estar</p>
          </div>

          <div class="doc-title">Declaração de Presença em Consulta</div>

          <div class="content">
            <p>Declara-se, para os devidos efeitos legais e laborais, que o(a) paciente <strong>${pacienteNome}</strong> esteve presente nas instalações da <strong>CliniMolelos</strong> no dia <strong>${dataStr}</strong>, no período das <strong>${horario}</strong>, para a realização de ato médico-dentário (<strong>${tipo}</strong>).</p>
            <p>Por ser verdade e ter sido solicitada pelo interessado, emite-se a presente declaração que segue devidamente autenticada.</p>
          </div>

          <div class="meta-info">
            <p><strong>Médico Responsável:</strong> ${medico}</p>
            <p><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString('pt-PT')}</p>
          </div>

          <div class="footer">
            <div class="sig-box">
              Assinatura e Carimbo Médico<br>
              <span style="font-weight: normal; color: #666; font-size: 11px;">CliniMolelos</span>
            </div>
          </div>

          <div class="clinic-footer">
            CliniMolelos • Sistema de Gestão Dentária • Documento Oficial Autenticado
          </div>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    printWin.document.write(htmlContent);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 250);
  };

  // Impressão oficial do comprovativo do acompanhante (DIRETO, sem prompt!)
  const handleImprimirComprovativoAcompanhante = (notificacao) => {
    const nomeAcompanhante = notificacao.acompanhante || 'Acompanhante';
    const pacienteNome = user?.nome || 'Paciente';
    const dataStr = notificacao.dataFormatted;
    const horario = notificacao.horario;
    const medico = notificacao.medico || 'Dra. Maria Santos';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Declaração de Acompanhante — ${nomeAcompanhante}</title>
          <style>
            @page { size: A4; margin: 25mm 20mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2B2519; margin: 0; padding: 20px; line-height: 1.7; }
            .header { text-align: center; border-bottom: 2.5px solid #A99C5E; padding-bottom: 20px; margin-bottom: 35px; }
            .logo-title { color: #A99C5E; font-size: 26px; font-weight: bold; letter-spacing: 1.5px; margin: 0; }
            .subtitle { color: #666; font-size: 13px; margin: 5px 0 0; text-transform: uppercase; letter-spacing: 1px; }
            .doc-title { text-align: center; color: #2B2519; font-size: 18px; font-weight: bold; margin-bottom: 35px; text-transform: uppercase; text-decoration: underline; text-underline-offset: 6px; }
            .content { font-size: 16px; text-align: justify; background: #FAF8F5; padding: 30px; border-radius: 12px; border: 1px solid #E5DFD5; margin-bottom: 40px; }
            .content p { margin: 0 0 15px; }
            .meta-info { font-size: 14px; color: #555; margin-top: 30px; }
            .footer { margin-top: 60px; text-align: right; }
            .sig-box { display: inline-block; text-align: center; border-top: 1.5px solid #2B2519; width: 280px; padding-top: 8px; font-size: 13px; font-weight: 600; }
            .clinic-footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="logo-title">CLINIMOLELOS</h1>
            <p class="subtitle">Clínica de Medicina Dentária & Bem-Estar</p>
          </div>

          <div class="doc-title">Declaração de Presença de Acompanhante</div>

          <div class="content">
            <p>Declara-se, para os devidos efeitos legais ou de justificação de ausência, que <strong>${nomeAcompanhante}</strong> esteve presente na <strong>CliniMolelos</strong> no dia <strong>${dataStr}</strong>, no período das <strong>${horario}</strong>, na qualidade de acompanhante / encarregado(a) de educação do(a) paciente <strong>${pacienteNome}</strong> durante a sua consulta médica dentária.</p>
            <p>Por ser verdade e ter sido solicitada, emite-se a presente declaração que segue devidamente autenticada.</p>
          </div>

          <div class="meta-info">
            <p><strong>Médico Responsável:</strong> ${medico}</p>
            <p><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString('pt-PT')}</p>
          </div>

          <div class="footer">
            <div class="sig-box">
              Assinatura e Carimbo Médico<br>
              <span style="font-weight: normal; color: #666; font-size: 11px;">CliniMolelos</span>
            </div>
          </div>

          <div class="clinic-footer">
            CliniMolelos • Sistema de Gestão Dentária • Documento Oficial Autenticado
          </div>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    printWin.document.write(htmlContent);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 250);
  };

  // Impressão oficial do Guia de Tratamento (DOCUMENTO FORMATADO, não a página inteira!)
  const handleImprimirGuiaTratamento = () => {
    const pacienteNome = user?.nome || 'Paciente';
    const email = user?.email || 'Sem email';
    const dataStr = ultimoGuiaInfo?.data || new Date().toLocaleDateString('pt-PT');
    const medico = ultimoGuiaInfo?.medico || 'Dra. Maria Santos';
    const textoGuia = ultimoGuiaInfo?.texto || '• Lavar os dentes 2 a 3 vezes ao dia\n• Utilizar fio dentário diariamente\n• Realizar bochechos com elixir fluoretado\n• Evitar alimentos excessivamente açucarados ou duros';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Guia de Tratamento — ${pacienteNome}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2B2519; margin: 0; padding: 25px; line-height: 1.7; }
            .header { text-align: center; border-bottom: 2.5px solid #A99C5E; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-title { color: #A99C5E; font-size: 26px; font-weight: bold; letter-spacing: 1.5px; margin: 0; }
            .subtitle { color: #666; font-size: 12px; margin-top: 4px; text-transform: uppercase; }
            .patient-box { background: #FAF8F5; border: 1.5px solid #E5DFD5; border-radius: 12px; padding: 20px; margin-bottom: 30px; }
            .patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14.5px; }
            .guide-title { color: #A99C5E; font-size: 17px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; }
            .guide-box { background: #ffffff; border: 2px solid #A99C5E; border-radius: 12px; padding: 25px; white-space: pre-wrap; font-size: 15px; line-height: 1.8; min-height: 220px; margin-bottom: 40px; }
            .footer { margin-top: 50px; text-align: right; }
            .sig-box { display: inline-block; text-align: center; border-top: 1.5px solid #2B2519; width: 280px; padding-top: 8px; font-size: 13px; font-weight: 600; }
            .clinic-footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 11px; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="logo-title">CLINIMOLELOS</h1>
            <p class="subtitle">Guia de Tratamento & Recomendações Clínicas</p>
          </div>

          <div class="patient-box">
            <div class="patient-grid">
              <div><strong>Paciente:</strong> ${pacienteNome}</div>
              <div><strong>Email:</strong> ${email}</div>
              <div><strong>Médico Prescritor:</strong> ${medico}</div>
              <div><strong>Data do Registo:</strong> ${dataStr}</div>
            </div>
          </div>

          <div class="guide-title">📋 Recomendações & Cuidados Médicos:</div>
          <div class="guide-box">${textoGuia}</div>

          <div class="footer">
            <div class="sig-box">
              Assinatura e Validação Médica<br>
              <span style="font-weight: normal; color: #666; font-size: 11px;">CliniMolelos</span>
            </div>
          </div>

          <div class="clinic-footer">
            CliniMolelos • Documento Clínico Oficial
          </div>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    printWin.document.write(htmlContent);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 250);
  };

  const handleViewAgenda = () => {
    navigate('/frontoffice/historico/');
  };

  return (
    <div className="pagina-cliente-conteudo">
      {/* Cabeçalho com informações do usuário */}
      <div style={{
        backgroundColor: '#f0f7ff',
        border: '2px solid #A99C5E',
        borderRadius: '12px',
        padding: '18px 20px',
        marginBottom: '25px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3 style={{ color: '#A99C5E', marginBottom: '8px', fontWeight: 'bold' }}>
              <i className="bi bi-person-circle me-2"></i>Bem-vindo, {user?.nome}!
            </h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', color: '#444' }}>
              <div>
                <i className="bi bi-envelope-fill me-1 text-secondary"></i><strong>Email:</strong> {user?.email || 'Registado na clínica'}
              </div>
              <div>
                <i className="bi bi-person-badge-fill me-1 text-secondary"></i><strong>Tipo de Conta:</strong> Paciente
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleVerNotificacoes}
            style={{
              backgroundColor: '#A99C5E',
              color: 'white',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '30px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(169, 156, 94, 0.3)'
            }}
          >
            <i className="bi bi-bell-fill"></i> Ver Notificações
          </button>
        </div>
      </div>
      
      {/* Título das consultas */}
      <div className="titulo-secao">
        <h2><i className="bi bi-calendar-check me-2" style={{ color: '#A99C5E' }}></i>Minhas Consultas Agendadas</h2>
      </div>
      
      {/* Cards de consultas */}
      <div className="cards-container">
        {loading ? (
          <div className="text-center p-5">
            <i className="bi bi-arrow-repeat spin fs-1" style={{ color: '#A99C5E' }}></i>
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
                    <i className="bi bi-calendar-check me-2" style={{ color: '#A99C5E' }}></i>{notificacao.title}
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
                    {notificacao.acompanhante && (
                      <span className="badge bg-light text-dark border" style={{ fontSize: '11.5px', padding: '5px 9px', borderRadius: '10px' }}>
                        <i className="bi bi-people-fill me-1 text-secondary"></i> Acomp: {notificacao.acompanhante}
                      </span>
                    )}
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
                    {notificacao.acompanhante && (
                      <div className="detail-item">
                        <span className="detail-label"><i className="bi bi-people me-1"></i>Acompanhante:</span>
                        <span className="detail-value text-primary font-weight-bold">{notificacao.acompanhante}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-geo-alt me-1"></i>Local:</span>
                      <span className="detail-value">{notificacao.local}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-clipboard me-1"></i>Tipo:</span>
                      <span className="detail-value">{notificacao.tipo}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><i className="bi bi-chat-text me-1"></i>Descrição / Notas:</span>
                      <span className="detail-value">{notificacao.descricao}</span>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <div className="action-buttons d-flex flex-wrap gap-2">
                      {/* Botão Declaração de Presença do Paciente */}
                      <button 
                        className="btn-action btn-download"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImprimirComprovativoPaciente(notificacao);
                        }}
                        title="Descarregar Declaração de Presença Oficial"
                      >
                        <i className="bi bi-file-earmark-check me-1"></i> Declaração de Presença
                      </button>
                      
                      {/* Botão Declaração do Acompanhante (APENAS se tiver acompanhante registado) */}
                      {notificacao.acompanhante && notificacao.acompanhante.trim() !== '' && (
                        <button 
                          className="btn-action"
                          style={{
                            backgroundColor: '#FAF8F5',
                            border: '1.5px solid #A99C5E',
                            color: '#2B2519',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImprimirComprovativoAcompanhante(notificacao);
                          }}
                          title={`Descarregar Declaração de Acompanhante para ${notificacao.acompanhante}`}
                        >
                          <i className="bi bi-people-fill me-1" style={{ color: '#A99C5E' }}></i> Declaração Acompanhante
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
      
      {/* Guia de Tratamento (Último anotado pelo médico) */}
      <div className="guia-tratamento" style={{ borderRadius: '14px', border: '2px solid #A99C5E', padding: '25px', backgroundColor: '#FAF8F5', marginTop: '30px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h3 style={{ color: '#2B2519', margin: 0, fontWeight: 'bold' }}>
            <i className="bi bi-journal-medical me-2" style={{ color: '#A99C5E' }}></i>
            Último Guia de Tratamento de {user?.nome}
          </h3>
          {ultimoGuiaInfo && (
            <span className="badge" style={{ backgroundColor: '#A99C5E', color: 'white', padding: '6px 12px', borderRadius: '8px' }}>
              Registado a {ultimoGuiaInfo.data} por {ultimoGuiaInfo.medico}
            </span>
          )}
        </div>

        <div className="guia-content">
          {ultimoGuiaInfo ? (
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #E5DFD5', fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#333' }}>
              <strong>Instruções do Médico ({ultimoGuiaInfo.medico}):</strong><br/>
              {ultimoGuiaInfo.texto}
            </div>
          ) : (
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #E5DFD5', fontSize: '14.5px', color: '#555' }}>
              <strong>Recomendações gerais de saúde oral:</strong><br/>
              • Lavar os dentes após as refeições principais (mínimo 2x ao dia)<br/>
              • Utilizar fio dentário antes de deitar<br/>
              • Realizar bochechos com elixir fluoretado<br/>
              • Consultar o médico dentista de 6 em 6 meses
            </div>
          )}

          <div className="guia-actions mt-3 d-flex gap-3">
            <button 
              className="btn-guia"
              onClick={handleImprimirGuiaTratamento}
              style={{
                backgroundColor: '#A99C5E',
                color: 'white',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="bi bi-printer-fill"></i> Imprimir / Descarregar Guia em PDF
            </button>
          </div>
        </div>
      </div>
      
      {/* Botão Ver Agenda Completa */}
      <div className="ver-agenda-container mt-4">
        <button className="btn-ver-agenda" onClick={handleViewAgenda}>
          <i className="bi bi-calendar3 me-2"></i> Ver Histórico e Agenda Completa
        </button>
      </div>
    </div>
  );
};

export default PagInicialCli;