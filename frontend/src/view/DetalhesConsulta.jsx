import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App.jsx';
import url from './url_global';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const BASE_URL = url || 'http://localhost:3000/';

function DetalhesConsulta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [consulta, setConsulta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');
  const [sucessoMsg, setSucessoMsg] = useState('');

  // Formulário de apontamentos
  const [detalhes, setDetalhes] = useState('');
  const [guiaTratamento, setGuiaTratamento] = useState('');
  const [urgencia, setUrgencia] = useState('Normal');
  const [acompanhante, setAcompanhante] = useState('');

  // Receita Médica
  const [receitaTexto, setReceitaTexto] = useState('');

  // Comprovativos
  const [comprovativos, setComprovativos] = useState([]);
  const [gerandoComprovativo, setGerandoComprovativo] = useState(false);
  const [tituloComprovativo, setTituloComprovativo] = useState('Declaração de Presença em Consulta Dentária');

  const carregarConsulta = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}api/consultas/get/${id}`);
      if (res.data && res.data.success) {
        const data = res.data.data;
        setConsulta(data);
        setDetalhes(data.detalhes || '');
        setGuiaTratamento(data.guia_tratamento || '');
        setUrgencia(data.urgencia || 'Normal');
        setAcompanhante(data.acompanhante || data.UtilizadorData?.posUtilizador?.nome || '');
        
        carregarComprovativos(data.idutilizadorprefil);
      } else {
        setErro(res.data?.message || 'Consulta não encontrada.');
      }
    } catch (err) {
      console.error('Erro ao carregar consulta:', err);
      setErro('Erro ao ligar ao servidor para carregar a consulta.');
    } finally {
      setLoading(false);
    }
  };

  const carregarComprovativos = async (pacienteId) => {
    try {
      const res = await axios.get(`${BASE_URL}api/comprovativo/paciente/${pacienteId}`);
      if (res.data && res.data.success) {
        const lista = res.data.data.filter(c => c.idconsulta === Number(id));
        setComprovativos(lista.length > 0 ? lista : res.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar comprovativos:', err);
    }
  };

  useEffect(() => {
    if (id) {
      carregarConsulta();
    }
  }, [id]);

  const handleGuardarApontamentos = async () => {
    try {
      setSaving(true);
      setSucessoMsg('');
      setErro('');

      const res = await axios.put(`${BASE_URL}api/consultas/update/${id}`, {
        detalhes: detalhes,
        guia_tratamento: guiaTratamento,
        urgencia: urgencia,
        acompanhante: acompanhante
      });

      if (res.data && res.data.success) {
        setSucessoMsg('Apontamentos e Guia de Tratamento guardados com sucesso!');
        setTimeout(() => setSucessoMsg(''), 4000);
      } else {
        setErro(res.data?.message || 'Erro ao guardar dados.');
      }
    } catch (err) {
      console.error('Erro ao atualizar consulta:', err);
      setErro('Erro de rede ao guardar apontamentos.');
    } finally {
      setSaving(false);
    }
  };

  const handleGerarComprovativo = async (tipoDoc = 'Declaração de Presença') => {
    if (!consulta) return;
    try {
      setGerandoComprovativo(true);
      setErro('');
      
      let tituloDoc = 'Declaração de Presença em Consulta Dentária';
      if (tipoDoc === 'Declaração do Acompanhante') {
        const nomeAcomp = acompanhante.trim() || window.prompt("Nome do Acompanhante / Encarregado de Educação:", "") || "Acompanhante";
        tituloDoc = `Declaração de Acompanhante — ${nomeAcomp}`;
      } else {
        tituloDoc = tituloComprovativo || 'Declaração de Presença em Consulta Dentária';
      }

      const payload = {
        idconsulta: Number(id),
        idutilizadorprefil: consulta.idutilizadorprefil,
        tipo_documento: tipoDoc,
        titulo: tituloDoc,
        valor: 0.00
      };

      const res = await axios.post(`${BASE_URL}api/comprovativo/create`, payload);

      if (res.data && res.data.success) {
        setSucessoMsg(`Documento ("${tipoDoc}") emitido com sucesso!`);
        await carregarComprovativos(consulta.idutilizadorprefil);
        setTimeout(() => setSucessoMsg(''), 4000);
      } else {
        setErro(res.data?.message || 'Erro ao gerar comprovativo.');
      }
    } catch (err) {
      console.error('Erro ao emitir comprovativo:', err);
      setErro('Erro de ligação ao emitir comprovativo.');
    } finally {
      setGerandoComprovativo(false);
    }
  };

  const handleImprimirDocumento = (comp) => {
    const pacienteNome = consulta?.UtilizadorData?.nome || 'Paciente';
    const nif = consulta?.UtilizadorData?.nif || 'Não indicado';
    const dataStr = consulta?.data ? new Date(consulta.data).toLocaleDateString('pt-PT') : '';
    const horaInicio = consulta?.hora ? consulta.hora.substring(0, 5) : '';
    const horaFim = consulta?.horaFim ? consulta.horaFim.substring(0, 5) : (consulta?.horafim ? consulta.horafim.substring(0, 5) : '');
    const horario = horaFim ? `${horaInicio} às ${horaFim}` : horaInicio;

    const eAcomp = comp.tipo_documento === 'Declaração do Acompanhante' || comp.titulo.includes('Acompanhante');
    const nomeAlvo = eAcomp ? (acompanhante || 'o(a) encarregado(a) de educação / acompanhante') : pacienteNome;

    const textoDeclaracao = eAcomp
      ? `Declara-se, para os devidos efeitos, que <strong>${nomeAlvo}</strong> esteve presente na <strong>CliniMolelos</strong> no dia <strong>${dataStr}</strong>, no período das <strong>${horario}</strong>, na qualidade de acompanhante do paciente <strong>${pacienteNome}</strong> (NIF: ${nif}) para a realização de consulta médica dentária.`
      : `Declara-se, para os devidos efeitos, que o(a) paciente <strong>${pacienteNome}</strong> (NIF: ${nif}) esteve presente na <strong>CliniMolelos</strong> no dia <strong>${dataStr}</strong>, no período das <strong>${horario}</strong>, para a realização de consulta / ato médico dentário (<strong>${consulta?.TipoMarcacaoData?.desling || consulta?.detalhes || 'Consulta de Medicina Dentária'}</strong>).`;

    const conteudo = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${comp.titulo} — CliniMolelos</title>
          <style>
            @page { size: A4; margin: 25mm 20mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2B2519; margin: 0; padding: 20px; line-height: 1.7; }
            .header { text-align: center; border-bottom: 2.5px solid #A99C5E; padding-bottom: 20px; margin-bottom: 35px; }
            .logo-title { color: #A99C5E; font-size: 26px; font-weight: bold; letter-spacing: 1.5px; margin: 0; }
            .subtitle { color: #666; font-size: 13px; margin: 5px 0 0; text-transform: uppercase; letter-spacing: 1px; }
            .doc-title { text-align: center; color: #2B2519; font-size: 18px; font-weight: bold; margin-bottom: 35px; text-transform: uppercase; text-decoration: underline; text-underline-offset: 6px; }
            .content { font-size: 16px; text-align: justify; background: #FAF8F5; padding: 30px; border-radius: 12px; border: 1px solid #E5DFD5; margin-bottom: 40px; }
            .content p { margin: 0 0 15px; }
            .content p:last-child { margin-bottom: 0; }
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

          <div class="doc-title">${comp.titulo}</div>

          <div class="content">
            <p>${textoDeclaracao}</p>
            <p>Por ser verdade e ter sido solicitada para os fins convenientes, emite-se a presente declaração que vai devidamente assinada e autenticada pela direção clínica.</p>
          </div>

          <div class="meta-info">
            <p><strong>Médico Responsável:</strong> ${consulta?.medico || 'Dra. Maria Santos'}</p>
            <p><strong>Data de Emissão:</strong> ${new Date(comp.data_emissao || new Date()).toLocaleDateString('pt-PT')}</p>
          </div>

          <div class="footer">
            <div class="sig-box">
              Assinatura e Carimbo Médico<br>
              <span style="font-weight: normal; color: #666; font-size: 11px;">CliniMolelos</span>
            </div>
          </div>

          <div class="clinic-footer">
            CliniMolelos • Sistema de Saúde Dentária Integrada • Documento Oficial Autenticado
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(conteudo);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
  };

  const handleImprimirReceita = () => {
    if (!receitaTexto.trim()) {
      alert('Por favor escreva o texto da prescrição antes de imprimir.');
      return;
    }
    const pacienteNome = consulta?.UtilizadorData?.nome || 'Paciente';
    const nif = consulta?.UtilizadorData?.nif || 'Não indicado';
    const dataStr = new Date().toLocaleDateString('pt-PT');

    const conteudo = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receita Médica — ${pacienteNome}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2B2519; padding: 25px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2.5px solid #A99C5E; padding-bottom: 15px; margin-bottom: 25px; }
            .logo-title { color: #A99C5E; font-size: 24px; font-weight: bold; letter-spacing: 1px; margin: 0; }
            .subtitle { color: #666; font-size: 12px; margin-top: 4px; text-transform: uppercase; }
            .patient-box { background: #FAF8F5; border: 1px solid #E5DFD5; border-radius: 10px; padding: 15px; margin-bottom: 25px; font-size: 14px; }
            .prescription-title { color: #A99C5E; font-size: 16px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; }
            .prescription { font-size: 15px; background: #ffffff; padding: 25px; border-radius: 10px; border: 1.5px solid #A99C5E; white-space: pre-wrap; line-height: 1.8; min-height: 220px; }
            .footer { margin-top: 50px; text-align: right; }
            .sig-box { display: inline-block; text-align: center; border-top: 1.5px solid #2B2519; width: 260px; padding-top: 6px; font-size: 13px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="logo-title">CLINIMOLELOS</h1>
            <p class="subtitle">Receituário / Prescrição Médica</p>
          </div>

          <div class="patient-box">
            <div style="display: flex; justify-content: space-between;">
              <div><strong>Paciente:</strong> ${pacienteNome}</div>
              <div><strong>NIF / SNS:</strong> ${nif}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 6px;">
              <div><strong>Médico Prescritor:</strong> ${consulta?.medico || 'Dra. Maria Santos'}</div>
              <div><strong>Data:</strong> ${dataStr}</div>
            </div>
          </div>

          <div class="prescription-title">Posologia & Instruções de Tratamento:</div>
          <div class="prescription">${receitaTexto}</div>

          <div class="footer">
            <div class="sig-box">
              Assinatura do Médico<br>
              <span style="font-weight: normal; color: #666; font-size: 11px;">CliniMolelos</span>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(conteudo);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" style={{ color: '#A99C5E', width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">A carregar consulta...</span>
        </div>
        <p className="mt-3 text-muted fw-bold">A carregar detalhes da consulta...</p>
      </div>
    );
  }

  if (erro && !consulta) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger shadow-sm rounded-4 p-4 text-center">
          <i className="bi bi-exclamation-triangle-fill fs-1 text-danger mb-2 d-block"></i>
          <h4>{erro}</h4>
          <button onClick={() => navigate('/backoffice/paginainicial')} className="btn text-white mt-3" style={{ backgroundColor: '#A99C5E', borderRadius: '10px' }}>
            <i className="bi bi-arrow-left me-1"></i> Voltar à Agenda
          </button>
        </div>
      </div>
    );
  }

  const paciente = consulta?.UtilizadorData;
  const dataFormatada = consulta?.data ? new Date(consulta.data).toLocaleDateString('pt-PT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : 'Data não indicada';

  return (
    <div className="container-fluid py-4" style={{ fontFamily: 'Poppins, sans-serif', maxWidth: '1240px' }}>
      
      {/* Top Bar Navigation */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <button 
          onClick={() => navigate('/backoffice/paginainicial')} 
          className="btn btn-outline-secondary d-inline-flex align-items-center shadow-sm"
          style={{ borderRadius: '10px', padding: '8px 16px', fontWeight: '500' }}
        >
          <i className="bi bi-arrow-left me-2"></i> Voltar à Agenda
        </button>

        {paciente && (
          <Link 
            to={`/backoffice/perfis/${paciente.idutilizadorprefil}`} 
            className="btn text-white d-inline-flex align-items-center shadow-sm"
            style={{ backgroundColor: '#A99C5E', borderRadius: '10px', padding: '8px 18px', fontWeight: '500' }}
          >
            <i className="bi bi-person-bounding-box me-2"></i> Ver Perfil Completo do Paciente
          </Link>
        )}
      </div>

      {/* Hero Header Card */}
      <div className="card shadow-sm border-0 mb-4 rounded-4" style={{ background: 'linear-gradient(135deg, #FAF8F5 0%, #FFFFFF 100%)', borderLeft: '6px solid #A99C5E' }}>
        <div className="card-body p-4">
          <div className="row align-items-center g-3">
            <div className="col-lg-7">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge" style={{ backgroundColor: '#A99C5E', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '13px' }}>
                  <i className="bi bi-journal-medical me-1"></i> {consulta?.TipoMarcacaoData?.desling || 'Consulta Dentária'}
                </span>
                <span className={`badge px-3 py-2 rounded-3 ${urgencia === 'Muito Urgente' ? 'bg-danger' : urgencia === 'Urgente' ? 'bg-warning text-dark' : 'bg-success'}`}>
                  <i className="bi bi-exclamation-diamond-fill me-1"></i> {urgencia}
                </span>
              </div>
              <h3 className="fw-bold mb-2" style={{ color: '#2B2519' }}>
                {paciente?.nome || 'Paciente sem nome'}
              </h3>
              <div className="d-flex flex-wrap gap-3 text-secondary" style={{ fontSize: '14px' }}>
                <span><i className="bi bi-calendar3 me-1 text-warning"></i> {dataFormatada}</span>
                <span><i className="bi bi-clock me-1 text-warning"></i> {consulta?.hora?.substring(0, 5)} {consulta?.horaFim ? `— ${consulta.horaFim.substring(0, 5)}` : ''}</span>
                <span><i className="bi bi-person-badge me-1 text-warning"></i> {consulta?.medico || 'Médico Dentista'}</span>
              </div>
            </div>

            <div className="col-lg-5 text-lg-end border-start-lg ps-lg-4">
              <div className="p-3 bg-white rounded-3 border shadow-none text-start text-lg-end">
                <div style={{ fontSize: '13px', color: '#666' }}>
                  <strong>NIF/SNS:</strong> {paciente?.nif || 'Não indicado'}<br/>
                  <strong>Contacto:</strong> {paciente?.contactoprincipal || 'Sem telefone'}<br/>
                  <strong>Email:</strong> {paciente?.gmail || 'Sem email'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {sucessoMsg && (
        <div className="alert alert-success alert-dismissible fade show rounded-3 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill me-2 fs-5 align-middle"></i> {sucessoMsg}
        </div>
      )}
      {erro && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5 align-middle"></i> {erro}
        </div>
      )}

      {/* Main Grid */}
      <div className="row g-4">
        
        {/* COLUNA ESQUERDA: APONTAMENTOS MÉDICOS E GUIA DE TRATAMENTO */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
              <h5 className="fw-bold mb-0" style={{ color: '#2B2519' }}>
                <i className="bi bi-clipboard-pulse me-2" style={{ color: '#A99C5E' }}></i>
                Apontamentos & Notas Clínicas
              </h5>
              <button 
                onClick={handleGuardarApontamentos} 
                disabled={saving}
                className="btn text-white shadow-sm" 
                style={{ backgroundColor: '#A99C5E', borderRadius: '10px', padding: '8px 18px', fontSize: '14px', fontWeight: '500' }}
              >
                {saving ? 'A guardar...' : <><i className="bi bi-save2 me-1"></i> Guardar Alterações</>}
              </button>
            </div>
            <div className="card-body p-4">
              
              <div className="mb-4">
                <label className="form-label fw-bold" style={{ color: '#2B2519' }}>
                  Nível de Urgência da Consulta:
                </label>
                <select 
                  className="form-select shadow-none"
                  value={urgencia}
                  onChange={(e) => setUrgencia(e.target.value)}
                  style={{ borderRadius: '10px', border: '1.5px solid #E5DFD5', padding: '10px 14px' }}
                >
                  <option value="Normal">🟢 Normal (Rotina / Manutenção)</option>
                  <option value="Urgente">🟡 Urgente (Dor moderada / Necessidade rápida)</option>
                  <option value="Muito Urgente">🔴 Muito Urgente (Emergência aguda / Trauma)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold" style={{ color: '#2B2519' }}>
                  Observações Médicas & Sintomas Relatados:
                </label>
                <textarea 
                  className="form-control shadow-none"
                  rows={4}
                  placeholder="Registo dos procedimentos efetuados, diagnóstico clínico, dentes intervencionados ou observações da consulta..."
                  value={detalhes}
                  onChange={(e) => setDetalhes(e.target.value)}
                  style={{ borderRadius: '10px', border: '1.5px solid #E5DFD5', padding: '12px' }}
                />
              </div>

              <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: '#FAF8F5', border: '1.5px solid #A99C5E' }}>
                <label className="form-label fw-bold" style={{ color: '#A99C5E' }}>
                  <i className="bi bi-journal-check me-2"></i>Guia de Tratamento & Recomendações (Visível ao Paciente):
                </label>
                <textarea 
                  className="form-control shadow-none"
                  rows={4}
                  placeholder="Instruções para o paciente, posologia, cuidados de higiene pós-tratamento, próximos passos recomendados..."
                  value={guiaTratamento}
                  onChange={(e) => setGuiaTratamento(e.target.value)}
                  style={{ borderRadius: '10px', border: '1px solid #D1C7B7', backgroundColor: '#FFFFFF', padding: '12px' }}
                />
                <small className="text-muted d-block mt-2">
                  <i className="bi bi-info-circle me-1"></i> Este texto é automaticamente apresentado na Página Inicial do Paciente e no seu histórico.
                </small>
              </div>

              <div className="p-3 bg-light rounded-3 border">
                <label className="form-label fw-bold text-secondary mb-1">
                  <i className="bi bi-people me-2" style={{ color: '#A99C5E' }}></i>Nome do Acompanhante / Encarregado de Educação:
                </label>
                <input 
                  type="text"
                  className="form-control shadow-none"
                  placeholder="Ex: Carlos Alberto Ferreira (Pai / Mãe / Tutor Legal)"
                  value={acompanhante}
                  onChange={(e) => setAcompanhante(e.target.value)}
                  style={{ borderRadius: '10px', border: '1.5px solid #E5DFD5' }}
                />
                <small className="text-muted d-block mt-1">
                  Ao registar o acompanhante, a declaração de presença de acompanhante fica disponível com 1 clique para emissão e download.
                </small>
              </div>

            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: RECEITAS E COMPROVATIVOS DE PRESENÇA */}
        <div className="col-lg-5">
          
          {/* RECEITA MÉDICA */}
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
              <h6 className="fw-bold mb-0" style={{ color: '#2B2519' }}>
                <i className="bi bi-capsule me-2 text-danger"></i>
                Receita / Prescrição Médica
              </h6>
              <button 
                onClick={handleImprimirReceita} 
                className="btn btn-sm btn-outline-danger shadow-sm d-inline-flex align-items-center"
                style={{ borderRadius: '8px', padding: '6px 14px', fontWeight: '500' }}
              >
                <i className="bi bi-printer me-1"></i> Imprimir
              </button>
            </div>
            <div className="card-body p-4">
              <textarea 
                className="form-control shadow-none mb-2"
                rows={4}
                placeholder="Exemplo:&#10;• Amoxicilina 875mg (1 comp. 12h/12h durante 7 dias)&#10;• Ibuprofeno 600mg (1 comp. 8h/8h em caso de dor)"
                value={receitaTexto}
                onChange={(e) => setReceitaTexto(e.target.value)}
                style={{ borderRadius: '10px', border: '1.5px solid #E5DFD5', fontSize: '13.5px' }}
              />
              <small className="text-muted"><i className="bi bi-info-circle me-1"></i> Formata automaticamente em papel timbrado oficial da CliniMolelos.</small>
            </div>
          </div>

          {/* COMPROVATIVOS DE PRESENÇA */}
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white py-3 px-4 border-bottom">
              <h6 className="fw-bold mb-0" style={{ color: '#2B2519' }}>
                <i className="bi bi-file-earmark-text me-2" style={{ color: '#A99C5E' }}></i>
                Declarações de Presença Oficiais
              </h6>
            </div>
            <div className="card-body p-4">
              
              <div className="mb-3">
                <div className="d-grid gap-2">
                  <button 
                    onClick={() => handleGerarComprovativo('Declaração de Presença')}
                    disabled={gerandoComprovativo}
                    className="btn text-white py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                    style={{ backgroundColor: '#A99C5E', borderRadius: '10px', fontWeight: '500' }}
                  >
                    <i className="bi bi-file-earmark-check-fill"></i>
                    {gerandoComprovativo ? 'A emitir...' : 'Emitir Declaração do Paciente'}
                  </button>

                  <button 
                    onClick={() => handleGerarComprovativo('Declaração do Acompanhante')}
                    disabled={gerandoComprovativo}
                    className="btn btn-outline-secondary py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                    style={{ borderRadius: '10px', fontWeight: '500' }}
                  >
                    <i className="bi bi-people-fill" style={{ color: '#A99C5E' }}></i>
                    {gerandoComprovativo ? 'A emitir...' : 'Emitir Declaração de Acompanhante'}
                  </button>
                </div>
              </div>

              <hr className="my-3" />

              <h6 className="fw-bold mb-3 text-secondary" style={{ fontSize: '14px' }}>
                Documentos Emitidos para esta Consulta:
              </h6>
              {comprovativos.length === 0 ? (
                <div className="text-center py-3 text-muted" style={{ fontSize: '13px' }}>
                  <i className="bi bi-folder2-open d-block fs-3 mb-1 text-secondary opacity-50"></i>
                  Nenhuma declaração emitida ainda.
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {comprovativos.map((comp) => (
                    <div 
                      key={comp.idcomprovativo} 
                      className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center border-bottom"
                      style={{ fontSize: '13px' }}
                    >
                      <div className="me-2">
                        <strong className="text-dark d-block">{comp.titulo}</strong>
                        <span className="text-muted" style={{ fontSize: '11px' }}>
                          <i className="bi bi-clock-history me-1"></i>
                          Emitido a {new Date(comp.data_emissao || new Date()).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleImprimirDocumento(comp)}
                        className="btn btn-sm btn-outline-secondary"
                        style={{ borderRadius: '8px' }}
                        title="Imprimir Declaração"
                      >
                        <i className="bi bi-printer"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default DetalhesConsulta;
