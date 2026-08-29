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
    <div className="container-fluid py-4" style={{ fontFamily: 'Poppins, sans-serif', maxWidth: '1100px' }}>

      {/* ── TOP NAV ── */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <button
          onClick={() => navigate('/backoffice/paginainicial')}
          className="btn d-inline-flex align-items-center gap-2 shadow-sm"
          style={{ borderRadius: '10px', padding: '8px 18px', fontWeight: '500', border: '1.5px solid #D1C7B7', color: '#2B2519', background: '#fff' }}
        >
          <i className="bi bi-arrow-left"></i> Voltar à Agenda
        </button>
        {paciente && (
          <Link
            to={`/backoffice/perfis/${paciente.idutilizadorprefil}`}
            className="btn d-inline-flex align-items-center gap-2 shadow-sm text-white"
            style={{ backgroundColor: '#A99C5E', borderRadius: '10px', padding: '8px 18px', fontWeight: '500' }}
          >
            <i className="bi bi-person-bounding-box"></i> Ver Perfil do Paciente
          </Link>
        )}
      </div>

      {/* ── HERO CARD: IDENTIFICAÇÃO DA CONSULTA ── */}
      <div className="rounded-4 shadow-sm mb-4 p-4" style={{ background: 'linear-gradient(135deg, #2B2519 0%, #3d3529 100%)', color: '#fff' }}>
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <div className="d-flex gap-2 mb-2 flex-wrap">
              <span className="badge px-3 py-2 rounded-3" style={{ backgroundColor: '#A99C5E', fontSize: '13px' }}>
                <i className="bi bi-journal-medical me-1"></i>
                {consulta?.TipoMarcacaoData?.desling || 'Consulta Dentária'}
              </span>
              <span className={`badge px-3 py-2 rounded-3 ${urgencia === 'Muito Urgente' ? 'bg-danger' : urgencia === 'Urgente' ? 'bg-warning text-dark' : 'bg-success'}`}>
                <i className="bi bi-exclamation-diamond-fill me-1"></i> {urgencia}
              </span>
            </div>
            <h2 className="fw-bold mb-1" style={{ fontSize: '26px' }}>
              {paciente?.nome || 'Paciente sem nome'}
            </h2>
            <div className="d-flex flex-wrap gap-3 opacity-75" style={{ fontSize: '14px' }}>
              <span><i className="bi bi-calendar3 me-1"></i> {dataFormatada}</span>
              <span><i className="bi bi-clock me-1"></i> {consulta?.hora?.substring(0, 5)}{consulta?.horaFim ? ` — ${consulta.horaFim.substring(0, 5)}` : ''}</span>
              <span><i className="bi bi-person-badge me-1"></i> {consulta?.medico || 'Médico Dentista'}</span>
            </div>
          </div>
          <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.07)', minWidth: '200px', fontSize: '14px' }}>
            <div className="mb-1"><span className="opacity-60">NIF / SNS:</span> <strong>{paciente?.nif || '—'}</strong></div>
            <div className="mb-1"><span className="opacity-60">Contacto:</span> <strong>{paciente?.contactoprincipal || '—'}</strong></div>
            <div><span className="opacity-60">Email:</span> <strong>{paciente?.gmail || '—'}</strong></div>
          </div>
        </div>
      </div>

      {/* ── ALERTAS ── */}
      {sucessoMsg && (
        <div className="alert alert-success rounded-3 shadow-sm mb-3" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> {sucessoMsg}
        </div>
      )}
      {erro && (
        <div className="alert alert-danger rounded-3 shadow-sm mb-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {erro}
        </div>
      )}

      {/* ── SECÇÃO 1: URGÊNCIA + OBSERVAÇÕES ── */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header border-0 rounded-top-4 py-3 px-4 d-flex align-items-center justify-content-between"
          style={{ background: '#FAF8F5', borderBottom: '2px solid #E5DFD5' }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-clipboard-pulse fs-5" style={{ color: '#A99C5E' }}></i>
            <h5 className="mb-0 fw-bold" style={{ color: '#2B2519' }}>Observações Clínicas</h5>
          </div>
          <button
            onClick={handleGuardarApontamentos}
            disabled={saving}
            className="btn text-white shadow-sm d-flex align-items-center gap-2"
            style={{ backgroundColor: '#A99C5E', borderRadius: '10px', padding: '8px 20px', fontWeight: '600', fontSize: '14px' }}
          >
            <i className="bi bi-floppy2-fill"></i>
            {saving ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </div>
        <div className="card-body p-4">
          <div className="row g-4">
            <div className="col-md-4">
              <label className="form-label fw-semibold mb-2" style={{ color: '#2B2519', fontSize: '14px' }}>
                <i className="bi bi-exclamation-diamond me-1" style={{ color: '#A99C5E' }}></i> Nível de Urgência
              </label>
              <select
                className="form-select shadow-none"
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value)}
                style={{ borderRadius: '10px', border: '1.5px solid #E5DFD5', padding: '10px 14px', fontSize: '14px' }}
              >
                <option value="Normal">🟢 Normal (Rotina)</option>
                <option value="Urgente">🟡 Urgente (Dor moderada)</option>
                <option value="Muito Urgente">🔴 Muito Urgente (Emergência)</option>
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label fw-semibold mb-2" style={{ color: '#2B2519', fontSize: '14px' }}>
                <i className="bi bi-stethoscope me-1" style={{ color: '#A99C5E' }}></i> Observações Médicas & Sintomas Relatados
              </label>
              <textarea
                className="form-control shadow-none"
                rows={3}
                placeholder="Diagnóstico clínico, procedimentos efetuados, dentes intervencionados, sintomas descritos pelo paciente..."
                value={detalhes}
                onChange={(e) => setDetalhes(e.target.value)}
                style={{ borderRadius: '10px', border: '1.5px solid #E5DFD5', padding: '12px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECÇÃO 2: GUIA DE TRATAMENTO ── */}
      <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ borderLeft: '4px solid #A99C5E' }}>
        <div className="card-header border-0 rounded-top-4 py-3 px-4"
          style={{ background: 'linear-gradient(90deg, #FAF8F5, #fff)', borderBottom: '2px solid #F0EBE0' }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-journal-check fs-5" style={{ color: '#A99C5E' }}></i>
            <h5 className="mb-0 fw-bold" style={{ color: '#A99C5E' }}>Guia de Tratamento & Recomendações</h5>
            <span className="badge rounded-pill ms-1" style={{ backgroundColor: '#F0EBE0', color: '#7a6d3f', fontSize: '11px' }}>
              Visível ao Paciente
            </span>
          </div>
        </div>
        <div className="card-body p-4">
          <textarea
            className="form-control shadow-none"
            rows={5}
            placeholder="Instruções para o paciente, posologia, cuidados de higiene oral pós-tratamento, próximos passos recomendados pelo médico..."
            value={guiaTratamento}
            onChange={(e) => setGuiaTratamento(e.target.value)}
            style={{ borderRadius: '10px', border: '1.5px solid #D1C7B7', padding: '14px', fontSize: '14px', resize: 'vertical', lineHeight: '1.7' }}
          />
          <div className="mt-2 d-flex align-items-center gap-1" style={{ fontSize: '13px', color: '#888' }}>
            <i className="bi bi-info-circle"></i>
            <span>Este texto aparece automaticamente na Página Inicial do Paciente e no seu histórico de consultas.</span>
          </div>
        </div>
      </div>

      {/* ── SECÇÃO 3: ACOMPANHANTE ── */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header border-0 rounded-top-4 py-3 px-4"
          style={{ background: '#FAF8F5', borderBottom: '2px solid #E5DFD5' }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-people fs-5" style={{ color: '#A99C5E' }}></i>
            <h5 className="mb-0 fw-bold" style={{ color: '#2B2519' }}>Acompanhante / Encarregado de Educação</h5>
          </div>
        </div>
        <div className="card-body p-4">
          <input
            type="text"
            className="form-control shadow-none"
            placeholder="Nome completo do acompanhante ou encarregado de educação (Ex: Carlos Alberto Ferreira)"
            value={acompanhante}
            onChange={(e) => setAcompanhante(e.target.value)}
            style={{ borderRadius: '10px', border: '1.5px solid #E5DFD5', padding: '12px 16px', fontSize: '14px', maxWidth: '520px' }}
          />
          <div className="mt-2 d-flex align-items-center gap-1" style={{ fontSize: '13px', color: '#888' }}>
            <i className="bi bi-info-circle"></i>
            <span>Ao preencher este campo, a declaração de acompanhante fica disponível para emissão com 1 clique.</span>
          </div>
        </div>
      </div>

      {/* ── SECÇÃO 4: RECEITA MÉDICA ── */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header border-0 rounded-top-4 py-3 px-4 d-flex align-items-center justify-content-between"
          style={{ background: '#FAF8F5', borderBottom: '2px solid #E5DFD5' }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-capsule fs-5 text-danger"></i>
            <h5 className="mb-0 fw-bold" style={{ color: '#2B2519' }}>Receita / Prescrição Médica</h5>
          </div>
          <button
            onClick={handleImprimirReceita}
            className="btn d-flex align-items-center gap-2 shadow-sm"
            style={{ borderRadius: '10px', padding: '8px 20px', fontWeight: '600', fontSize: '14px', border: '1.5px solid #dc3545', color: '#dc3545', background: '#fff' }}
          >
            <i className="bi bi-printer-fill"></i> Imprimir Receita
          </button>
        </div>
        <div className="card-body p-4">
          <textarea
            className="form-control shadow-none"
            rows={4}
            placeholder={"Exemplo:\n• Amoxicilina 875mg — 1 comp. 12h/12h durante 7 dias\n• Ibuprofeno 600mg — 1 comp. 8h/8h se dor (máx. 5 dias)"}
            value={receitaTexto}
            onChange={(e) => setReceitaTexto(e.target.value)}
            style={{ borderRadius: '10px', border: '1.5px solid #E5DFD5', padding: '14px', fontSize: '14px', resize: 'vertical', lineHeight: '1.7', maxWidth: '640px' }}
          />
          <div className="mt-2 d-flex align-items-center gap-1" style={{ fontSize: '13px', color: '#888' }}>
            <i className="bi bi-info-circle"></i>
            <span>Gera automaticamente em papel timbrado oficial da CliniMolelos.</span>
          </div>
        </div>
      </div>

      {/* ── SECÇÃO 5: DECLARAÇÕES DE PRESENÇA ── */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header border-0 rounded-top-4 py-3 px-4"
          style={{ background: '#FAF8F5', borderBottom: '2px solid #E5DFD5' }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-text fs-5" style={{ color: '#A99C5E' }}></i>
            <h5 className="mb-0 fw-bold" style={{ color: '#2B2519' }}>Declarações de Presença Oficiais</h5>
          </div>
        </div>
        <div className="card-body p-4">
          <div className="d-flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => handleGerarComprovativo('Declaração de Presença')}
              disabled={gerandoComprovativo}
              className="btn text-white shadow-sm d-flex align-items-center gap-2"
              style={{ backgroundColor: '#A99C5E', borderRadius: '10px', padding: '10px 22px', fontWeight: '600', fontSize: '14px' }}
            >
              <i className="bi bi-file-earmark-check-fill"></i>
              {gerandoComprovativo ? 'A emitir...' : 'Emitir Declaração do Paciente'}
            </button>
            <button
              onClick={() => handleGerarComprovativo('Declaração do Acompanhante')}
              disabled={gerandoComprovativo}
              className="btn shadow-sm d-flex align-items-center gap-2"
              style={{ borderRadius: '10px', padding: '10px 22px', fontWeight: '600', fontSize: '14px', border: '1.5px solid #A99C5E', color: '#A99C5E', background: '#fff' }}
            >
              <i className="bi bi-people-fill"></i>
              {gerandoComprovativo ? 'A emitir...' : 'Emitir Declaração de Acompanhante'}
            </button>
          </div>

          {comprovativos.length > 0 && (
            <>
              <p className="fw-semibold mb-3" style={{ fontSize: '14px', color: '#555', borderTop: '1.5px solid #E5DFD5', paddingTop: '16px' }}>
                <i className="bi bi-archive me-1" style={{ color: '#A99C5E' }}></i> Documentos já emitidos para esta consulta:
              </p>
              <div className="d-flex flex-column gap-2">
                {comprovativos.map((comp) => (
                  <div
                    key={comp.idcomprovativo}
                    className="d-flex align-items-center justify-content-between p-3 rounded-3"
                    style={{ background: '#FAF8F5', border: '1px solid #E5DFD5', fontSize: '14px' }}
                  >
                    <div>
                      <strong style={{ color: '#2B2519' }}>{comp.titulo}</strong>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                        <i className="bi bi-clock-history me-1"></i>
                        Emitido a {new Date(comp.data_emissao || new Date()).toLocaleDateString('pt-PT')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleImprimirDocumento(comp)}
                      className="btn btn-sm shadow-sm d-flex align-items-center gap-1"
                      style={{ borderRadius: '8px', border: '1.5px solid #D1C7B7', color: '#2B2519', background: '#fff', fontWeight: '500', whiteSpace: 'nowrap' }}
                      title="Imprimir / Visualizar Declaração"
                    >
                      <i className="bi bi-printer"></i> Imprimir
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {comprovativos.length === 0 && (
            <div className="text-center py-3" style={{ fontSize: '13px', color: '#aaa' }}>
              <i className="bi bi-folder2-open d-block fs-3 mb-1 opacity-40"></i>
              Nenhuma declaração emitida ainda para esta consulta.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default DetalhesConsulta;
