const ConsultaHistorico = ({titulo, horas, data, detalhes, guia, idCon, acompanhante, medico}) => {
  if (guia == null || guia === '') { guia = "N/A"; }
  const horaStr = horas ? horas.substring(0, 5) : '';
  
  let dataFormatada = data || '';
  if (data) {
    if (typeof data === 'string' && data.includes('-')) {
      const partes = data.split('T')[0].split('-');
      if (partes.length === 3) {
        dataFormatada = `${partes[2].padStart(2, '0')}/${partes[1].padStart(2, '0')}/${partes[0]}`;
      }
    } else {
      const dt = new Date(data);
      if (!isNaN(dt.getTime())) {
        const dia = String(dt.getDate()).padStart(2, '0');
        const mes = String(dt.getMonth() + 1).padStart(2, '0');
        const ano = dt.getFullYear();
        dataFormatada = `${dia}/${mes}/${ano}`;
      }
    }
  }

  const imprimirDeclaracao = (tipo) => {
    let tituloDoc = "DECLARAÇÃO DE PRESENÇA EM CONSULTA DENTÁRIA";
    let textoPresenca = "";

    if (tipo === 'acompanhante') {
      const nomeAcomp = acompanhante || "Acompanhante / Tutor";
      tituloDoc = "DECLARAÇÃO DE PRESENÇA DE ACOMPANHANTE";
      textoPresenca = `Declara-se, para os devidos efeitos legais ou de justificação de ausência, que <b>${nomeAcomp}</b> esteve presente na <b>CliniMolelos</b> no dia <b>${dataFormatada}</b>, às <b>${horaStr}</b>, na qualidade de acompanhante / encarregado(a) de educação para a realização de consulta médica dentária.`;
    } else {
      textoPresenca = `Declara-se, para os devidos efeitos, que o(a) paciente esteve presente na <b>CliniMolelos</b> no dia <b>${dataFormatada}</b> às <b>${horaStr}</b>, para a realização de ato médico-dentário (<b>${detalhes || titulo}</b>).`;
    }

    const dataHojeStr = new Date().toLocaleDateString('pt-PT');
    const medicoNome = medico || 'Dra. Maria Santos';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${tituloDoc} — CliniMolelos</title>
          <style>
            @page { size: A4; margin: 25mm 20mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #2B2519; line-height: 1.7; }
            .header { text-align: center; border-bottom: 2.5px solid #A99C5E; padding-bottom: 15px; margin-bottom: 30px; }
            .header h1 { color: #A99C5E; margin: 0; font-size: 24px; letter-spacing: 1.5px; }
            .header p { margin: 5px 0 0; color: #666; font-size: 13px; text-transform: uppercase; }
            .doc-title { text-align: center; color: #2B2519; font-size: 17px; font-weight: bold; margin-bottom: 30px; text-transform: uppercase; text-decoration: underline; text-underline-offset: 5px; }
            .content { font-size: 15.5px; margin: 30px 0; text-align: justify; background: #FAF8F5; padding: 30px; border-radius: 10px; border: 1px solid #E5DFD5; }
            .footer { margin-top: 60px; text-align: right; }
            .sig-line { border-top: 1.5px solid #2B2519; width: 260px; display: inline-block; margin-top: 50px; text-align: center; font-size: 13px; font-weight: 600; padding-top: 6px; }
            .clinic-footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CLINIMOLELOS</h1>
            <p>Clínica de Medicina Dentária & Bem-Estar</p>
          </div>

          <div class="doc-title">${tituloDoc}</div>

          <div class="content">
            <p>${textoPresenca}</p>
            <p style="margin-top: 20px;">Por ser verdade e ter sido solicitada, passa-se a presente declaração que segue devidamente autenticada.</p>
          </div>

          <p style="margin-top: 30px; font-size: 14px;"><b>Data de Emissão:</b> ${dataHojeStr}</p>
          <p style="font-size: 14px;"><b>Médico Responsável:</b> ${medicoNome}</p>

          <div class="footer">
            <div class="sig-line">
              Assinatura e Carimbo Médico<br>
              <i style="font-weight: normal; color: #666; font-size: 11px;">CliniMolelos</i>
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

  const dataConsultaObj = data ? new Date(typeof data === 'string' && !data.includes('T') ? `${data}T23:59:59` : data) : null;
  const hojeZero = new Date();
  hojeZero.setHours(0, 0, 0, 0);

  const eConsultaFutura = dataConsultaObj && dataConsultaObj > hojeZero;
  const temAcompanhante = acompanhante && acompanhante.trim() !== '';

  return (
    <div className=" px-0 col-12 mb-3">
        <div className="card div--cartao--consulta" id={idCon + "-aberto"}>
            <div className="card-body div--cartao--consulta px-4 py-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1 me-3">
                        <h4 className="card-title fw-bold mb-1">{titulo}</h4>
                        <p className="card-text mb-0 text-nowrap">{dataFormatada} - {horaStr}</p>
                    </div>
                    <i className="bi bi-chevron-down i--cartao--seta fs-2 flex-shrink-0"></i>
                </div>
            </div>
        </div>

        <div className="card div--cartao--consulta d-none" id={idCon + "-fechado"}>
            <div className="card-body div--cartao--consulta px-4 py-3">
              <div className="w-100">

                <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1 me-3">
                        <h4 className="card-title fw-bold mb-1">{titulo}</h4>
                        <p className="card-text mb-0 text-nowrap">{dataFormatada} - {horaStr}</p>
                    </div>
                    <i className="bi bi-chevron-right i--cartao--seta fs-2 flex-shrink-0"></i>
                </div>

                <hr className="hr--cartao my-3" />

                <div className="mb-2">
                    <h5 className="fw-bold mb-1">Detalhes / Observações:</h5>
                    <p className="mb-0">{detalhes || 'Sem observações registadas.'}</p>
                </div>

                <div className="mb-3">
                    <h5 className="fw-bold mb-1">Guia de Tratamento:</h5>
                    <p className="mb-0">{guia}</p>
                </div>

                {temAcompanhante && (
                  <div className="mb-3 p-2 bg-light rounded border" style={{ fontSize: '13.5px' }}>
                    <i className="bi bi-people-fill me-1 text-secondary"></i>
                    <strong>Acompanhante Registado:</strong> {acompanhante}
                  </div>
                )}

                <div className="mt-3 pt-2 border-top">
                    {eConsultaFutura ? (
                      <div className="text-muted small fst-italic">
                        <i className="bi bi-info-circle me-1" style={{ color: '#A99C5E' }}></i>
                        As declarações de presença ficam disponíveis após a data da consulta.
                      </div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        <button 
                          type="button" 
                          className="btn shadow-none text-white d-inline-flex align-items-center gap-2"
                          style={{ backgroundColor: '#A99C5E', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '500' }}
                          onClick={(e) => { e.stopPropagation(); imprimirDeclaracao('paciente'); }}
                          title="Descarregar Declaração de Presença Oficial"
                        >
                          <i className="bi bi-file-earmark-check-fill"></i> Declaração de Presença
                          <i className="bi bi-download ms-1"></i>
                        </button>

                        {/* Botão Acompanhante: Só renderiza se houver acompanhante registado! */}
                        {temAcompanhante && (
                          <button 
                            type="button" 
                            className="btn shadow-none text-dark d-inline-flex align-items-center gap-2"
                            style={{ border: '1.5px solid #A99C5E', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '500', backgroundColor: '#FAF8F5' }}
                            onClick={(e) => { e.stopPropagation(); imprimirDeclaracao('acompanhante'); }}
                            title={`Descarregar Declaração para ${acompanhante}`}
                          >
                            <i className="bi bi-person-check-fill" style={{ color: '#A99C5E' }}></i> Declaração do Acompanhante
                            <i className="bi bi-download ms-1"></i>
                          </button>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
        </div>
    </div>
  );
};

export default ConsultaHistorico;