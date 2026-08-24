const ConsultaHistorico = ({titulo, horas, data, detalhes, guia, idCon}) => {
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
    let tituloDoc = "DECLARAÇÃO DE PRESENÇA EM CONSULTA";
    let textoPresenca = "";

    if (tipo === 'acompanhante') {
      const nomeAcompanhante = window.prompt("Por favor, introduza o nome do Encarregado de Educação / Acompanhante:", "");
      if (!nomeAcompanhante) return;
      tituloDoc = "DECLARAÇÃO DE PRESENÇA DE ACOMPANHANTE";
      textoPresenca = `Declara-se, para os devidos efeitos, que <b>${nomeAcompanhante}</b> esteve presente nesta clínica no dia <b>${dataFormatada}</b>, às <b>${horaStr}</b>, na qualidade de acompanhante para a consulta médica de medicina dentária.`;
    } else {
      textoPresenca = `Declara-se, para os devidos efeitos, que o paciente esteve presente nesta clínica no dia <b>${dataFormatada}</b> às <b>${horaStr}</b>, para realização de consulta de medicina dentária (<b>${detalhes || titulo}</b>).`;
    }

    const dataHojeStr = new Date().toLocaleDateString('pt-PT');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${tituloDoc}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #A99C5E; padding-bottom: 15px; margin-bottom: 30px; }
            .header h1 { color: #A99C5E; margin: 0; font-size: 22px; text-transform: uppercase; }
            .header p { margin: 5px 0 0; color: #666; font-size: 13px; }
            .content { font-size: 15px; margin: 40px 0; text-align: justify; background: #fafafa; padding: 25px; border-radius: 8px; border: 1px solid #eee; }
            .footer { margin-top: 70px; text-align: right; }
            .sig-line { border-top: 1px solid #333; width: 250px; display: inline-block; margin-top: 50px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CLÍNICA DENTÁRIA GRUPO 5</h1>
            <p>Declaração Oficial de Presença Médica</p>
          </div>

          <h3 style="text-align: center; margin-bottom: 25px; color: #2c3e50;">${tituloDoc}</h3>

          <div class="content">
            <p>${textoPresenca}</p>
            <p style="margin-top: 20px;">Por ser verdade e ter sido solicitado, passa-se a presente declaração que vai devidamente autenticada.</p>
          </div>

          <p style="margin-top: 30px;"><b>Data de Emissão:</b> ${dataHojeStr}</p>

          <div class="footer">
            <div class="sig-line">
              Assinatura e Carimbo Médico<br>
              <i>Clínica Dentária</i>
            </div>
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
                    <h5 className="fw-bold mb-1">Detalhes:</h5>
                    <p className="mb-0">{detalhes}</p>
                </div>

                <div className="mb-3">
                    <h5 className="fw-bold mb-1">Guia de Tratamento:</h5>
                    <p className="mb-0">{guia}</p>
                </div>

                <div className="mt-3 pt-2 border-top">
                    {eConsultaFutura ? (
                      <div className="text-muted small fst-italic">
                        <i className="bi bi-info-circle me-1" style={{ color: '#A99C5E' }}></i>
                        As declarações de presença ficam disponíveis após a realização da consulta.
                      </div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        <button 
                          type="button" 
                          className="btn shadow-none text-white d-inline-flex align-items-center gap-2"
                          style={{ backgroundColor: '#A99C5E', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '500' }}
                          onClick={(e) => { e.stopPropagation(); imprimirDeclaracao('paciente'); }}
                        >
                          <i className="bi bi-file-earmark-check-fill"></i> Declaração de Presença
                          <i className="bi bi-download ms-1"></i>
                        </button>

                        <button 
                          type="button" 
                          className="btn shadow-none text-dark d-inline-flex align-items-center gap-2"
                          style={{ border: '1.5px solid #A99C5E', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '500', backgroundColor: '#fcf8e3' }}
                          onClick={(e) => { e.stopPropagation(); imprimirDeclaracao('acompanhante'); }}
                        >
                          <i className="bi bi-person-check-fill"></i> Declaração do Acompanhante
                          <i className="bi bi-download ms-1"></i>
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>
        </div>
    </div>
    
);
}
export default ConsultaHistorico;