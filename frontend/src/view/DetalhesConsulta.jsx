import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App.jsx';
import url from './url_global';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  const [tituloComprovativo, setTituloComprovativo] = useState('Comprovativo de Presença em Consulta');

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
        setSucessoMsg('Apontamentos e observações guardados com sucesso!');
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
      
      let tituloDoc = 'Comprovativo de Presença em Consulta Dentária';
      if (tipoDoc === 'Declaração do Acompanhante') {
        const nomeAcomp = window.prompt("Nome do Acompanhante / Encarregado de Educação:", "") || "Acompanhante";
        tituloDoc = `Declaração de Acompanhante — ${nomeAcomp}`;
      } else {
        tituloDoc = tituloComprovativo || 'Comprovativo de Presença em Consulta Dentária';
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

    const conteudo = `
      <html>
        <head>
          <title>${comp.titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #A99C5E; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #A99C5E; margin: 0; }
            .content { font-size: 16px; margin-bottom: 40px; }
            .footer { margin-top: 60px; text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CLÍNICA DENTÁRIA - COMPROVATIVO OFICIAL</h1>
            <p>Documento Emitido em ${new Date(comp.data_emissao).toLocaleDateString('pt-PT')}</p>
          </div>
          <div class="content">
            <p><strong>DECLARAÇÃO DE PRESENÇA</strong></p>
            <p>Declara-se para os devidos efeitos que o(a) paciente <strong>${pacienteNome}</strong> (NIF/SNS: ${nif}) esteve presente nesta clínica no dia <strong>${dataStr}</strong> entre as <strong>${consulta?.hora}</strong> e <strong>${consulta?.horaFim || 'término da consulta'}</strong> para a realização de consulta / tratamento de medicina dentária (<strong>${consulta?.TipoMarcacaoData?.desling || consulta?.detalhes || 'Consulta Dentária'}</strong>).</p>
            <p><strong>Médico Responsável:</strong> ${consulta?.medico || 'Dr(a). Médico Dentista'}</p>
          </div>
          <div class="footer">
            <p>Assinatura e Carimbo Médico:</p>
            <p>_____________________________________</p>
            <p>${consulta?.medico || 'Médico Dentista'}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(conteudo);
    printWindow.document.close();
    printWindow.print();
  };

  const handleImprimirReceita = () => {
    if (!receitaTexto.trim()) {
      alert('Por favor escreva o texto ou medicação prescrita antes de imprimir.');
      return;
    }
    const pacienteNome = consulta?.UtilizadorData?.nome || 'Paciente';
    const dataStr = new Date().toLocaleDateString('pt-PT');

    const conteudo = `
      <html>
        <head>
          <title>Receita Médica — ${pacienteNome}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #A99C5E; padding-bottom: 15px; margin-bottom: 25px; }
            .header h2 { color: #A99C5E; margin: 0; }
            .prescription { font-size: 15px; background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; white-space: pre-wrap; }
            .footer { margin-top: 50px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RECEITA / PRESCRIÇÃO MÉDICA</h2>
            <p><strong>Paciente:</strong> ${pacienteNome} | <strong>Data:</strong> ${dataStr}</p>
            <p><strong>Médico Prescritor:</strong> ${consulta?.medico || 'Dr(a). Médico Dentista'}</p>
          </div>
          <h3>Medicamentos e Posologia:</h3>
          <div class="prescription">${receitaTexto}</div>
          <div class="footer">
            <p>Assinatura do Médico:</p>
            <p>_____________________________________</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(conteudo);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">A carregar consulta...</span>
        </div>
        <p className="mt-2 text-muted">A carregar detalhes da consulta...</p>
      </div>
    );
  }

  if (erro && !consulta) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {erro}
        </div>
        <button onClick={() => navigate('/backoffice/paginainicial')} className="btn btn-secondary">
          <i className="bi bi-arrow-left me-1"></i> Voltar à Agenda
        </button>
      </div>
    );
  }

  const paciente = consulta?.UtilizadorData;
  const dataFormatada = consulta?.data ? new Date(consulta.data).toLocaleDateString('pt-PT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : '';

  return (
    <div className="container-fluid py-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Botão de Voltar */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <button onClick={() => navigate('/backoffice/paginainicial')} className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Voltar à Agenda
        </button>
        {paciente && (
          <Link to={`/backoffice/perfis/${paciente.idutilizadorprefil}`} className="btn btn-outline-primary btn-sm">
            <i className="bi bi-person-bounding-box me-1"></i> Ver Perfil Completo do Paciente
          </Link>
        )}
      </div>

      {/* Cartão do Cabeçalho da Consulta */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderLeft: '6px solid #A99C5E' }}>
        <div className="card-body py-3">
          <div className="row align-items-center">
            <div className="col-md-7">
              <h4 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>
                <i className="bi bi-journal-medical text-warning me-2"></i>
                Consulta de {consulta?.TipoMarcacaoData?.desling || consulta?.detalhes || 'Medicina Dentária'}
              </h4>
              <p className="text-muted mb-0">
                <i className="bi bi-calendar-event me-1"></i> {dataFormatada} | <i className="bi bi-clock me-1"></i> {consulta?.hora} — {consulta?.horaFim || 'N/A'}
              </p>
            </div>
            <div className="col-md-5 text-md-end mt-2 mt-md-0">
              <span className="badge bg-secondary p-2 me-2">
                <i className="bi bi-person-badge me-1"></i> {consulta?.medico || 'Médico Dentista'}
              </span>
              <span className={`badge p-2 ${urgencia === 'Muito Urgente' ? 'bg-danger' : urgencia === 'Urgente' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                <i className="bi bi-exclamation-diamond-fill me-1"></i> Urgência: {urgencia}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {sucessoMsg && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> {sucessoMsg}
        </div>
      )}
      {erro && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {erro}
        </div>
      )}

      <div className="row g-4">
        
        {/* COLUNA ESQUERDA: APONTAMENTOS MÉDICOS E GUIA DE TRATAMENTO */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold py-3 border-bottom d-flex align-items-center justify-content-between">
              <span><i className="bi bi-pencil-square me-2 text-primary"></i>Apontamentos & Notas do Médico</span>
              <button 
                onClick={handleGuardarApontamentos} 
                disabled={saving}
                className="btn btn-sm text-white" 
                style={{ backgroundColor: '#A99C5E' }}
              >
                {saving ? 'A guardar...' : <><i className="bi bi-save me-1"></i> Guardar Notas</>}
              </button>
            </div>
            <div className="card-body">
              
              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">Nível de Urgência da Consulta:</label>
                <select 
                  className="form-select"
                  value={urgencia}
                  onChange={(e) => setUrgencia(e.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgente">Urgente</option>
                  <option value="Muito Urgente">Muito Urgente</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">Detalhes / Observações da Consulta:</label>
                <textarea 
                  className="form-control"
                  rows={4}
                  placeholder="Escreva aqui as observações do médico, sintomas relatados ou procedimentos realizados..."
                  value={detalhes}
                  onChange={(e) => setDetalhes(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">Guia de Tratamento / Recomendações Pós-Consulta:</label>
                <textarea 
                  className="form-control"
                  rows={4}
                  placeholder="Instruções para o paciente, próximos passos de tratamento, cuidados pós-procedimento..."
                  value={guiaTratamento}
                  onChange={(e) => setGuiaTratamento(e.target.value)}
                />
              </div>

              <div className="mb-3 p-3 bg-light rounded border">
                <label className="form-label fw-bold text-primary mb-1">
                  <i className="bi bi-people-fill me-2"></i>Nome do Acompanhante / Encarregado de Educação:
                </label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Ex: Maria Santos (Mãe / Pai / Acompanhante)"
                  value={acompanhante}
                  onChange={(e) => setAcompanhante(e.target.value)}
                />
                <small className="text-muted d-block mt-1">Preencha se a consulta teve a presença de um pai, mãe ou tutor legal para permitir emitir a declaração de acompanhante.</small>
              </div>

            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: RECEITAS E COMPROVATIVOS DE PRESENÇA */}
        <div className="col-lg-5">
          
          {/* RECEITA MÉDICA */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white fw-bold py-3 border-bottom d-flex align-items-center justify-content-between">
              <span><i className="bi bi-capsule me-2 text-danger"></i>Receita Médica / Prescrição</span>
              <button 
                onClick={handleImprimirReceita} 
                className="btn btn-outline-danger btn-sm"
              >
                <i className="bi bi-printer me-1"></i> Imprimir Receita
              </button>
            </div>
            <div className="card-body">
              <textarea 
                className="form-control mb-2"
                rows={4}
                placeholder="Exemplo: Amoxicilina 875mg (1 comprimido de 12h em 12h durante 7 dias)&#10;Paracetamol 1000mg (1 comprimido de 8h em 8h em caso de dor)"
                value={receitaTexto}
                onChange={(e) => setReceitaTexto(e.target.value)}
              />
              <small className="text-muted"><i className="bi bi-info-circle me-1"></i> O texto acima será formatado no modelo oficial pronto a imprimir.</small>
            </div>
          </div>

          {/* COMPROVATIVO DE PRESENÇA */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold py-3 border-bottom d-flex align-items-center justify-content-between">
              <span><i className="bi bi-file-earmark-text me-2 text-success"></i>Comprovativo de Presença / Atestado</span>
            </div>
            <div className="card-body">
              
              <div className="mb-3">
                <label className="form-label text-muted small">Título do Documento Personalizado:</label>
                <input 
                  type="text" 
                  className="form-control form-control-sm mb-2" 
                  value={tituloComprovativo} 
                  onChange={(e) => setTituloComprovativo(e.target.value)}
                />
                <div className="d-grid gap-2">
                  <button 
                    onClick={() => handleGerarComprovativo('Declaração de Presença')}
                    disabled={gerandoComprovativo}
                    className="btn btn-success btn-sm"
                  >
                    {gerandoComprovativo ? 'A emitir...' : <><i className="bi bi-file-earmark-check me-1"></i> Emitir Declaração de Presença (Paciente)</>}
                  </button>

                  <button 
                    onClick={() => handleGerarComprovativo('Declaração do Acompanhante')}
                    disabled={gerandoComprovativo}
                    className="btn btn-outline-success btn-sm"
                  >
                    {gerandoComprovativo ? 'A emitir...' : <><i className="bi bi-people me-1"></i> Emitir Declaração do Acompanhante</>}
                  </button>
                </div>
              </div>

              <hr />

              <h6 className="fw-bold mb-2 text-secondary">Documentos Emitidos:</h6>
              {comprovativos.length === 0 ? (
                <p className="text-muted small italic">Nenhum comprovativo emitido até ao momento.</p>
              ) : (
                <ul className="list-group list-group-flush small">
                  {comprovativos.map((comp) => (
                    <li key={comp.idcomprovativo} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                      <div>
                        <strong>{comp.titulo}</strong>
                        <br />
                        <span className="text-muted" style={{ fontSize: '11px' }}>
                          Emitido em: {new Date(comp.data_emissao).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleImprimirDocumento(comp)}
                        className="btn btn-sm btn-outline-primary"
                        title="Imprimir / Visualizar"
                      >
                        <i className="bi bi-printer"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default DetalhesConsulta;
