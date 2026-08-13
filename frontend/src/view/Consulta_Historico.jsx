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
return (
    <div className=" px-0 col-12 mb-3">
        <div className="card div--cartao--consulta" id={idCon + "-aberto"}>
            <div className="card-body div--cartao--consulta px-4 py-3">
                <div className="row align-items-center">
                <div className="col-10">
                    <h4 className="card-title fw-bold mb-1">{titulo}</h4>
                    <p className="card-text">{dataFormatada} - {horaStr}</p>
                </div>
                <i className="bi bi-chevron-down i--cartao--seta text-center fs-2 col-2"></i>
                </div>
            </div>
        </div>

        <div className="card div--cartao--consulta d-none" id={idCon + "-fechado"}>
            <div className="card-body div--cartao--consulta px-4 py-3">

                <div className="row align-items-center">
                    <div className="col-10">
                        <h4 className="card-title fw-bold mb-1">{titulo}</h4>
                        <p className="card-text">{dataFormatada} - {horaStr}</p>
                    </div>
                    <i className="bi bi-chevron-right i--cartao--seta text-center fs-2 col-2"></i>
                    </div>

                    
                    <div className="row align-items-center">

                    <hr className="hr--cartao mx-3 my-3 col-11" />

                    <div className="col-12 mb-2">
                        <h5 className="fw-bold mb-1">Detalhes:</h5>
                        <p className="mb-0">{detalhes}</p>
                    </div>

                    <div className="col-12 mb-3">
                        <h5 className="fw-bold mb-1">Guia de Tratamento:</h5>
                        <p className="mb-0">{guia}</p>
                    </div>

                    <div className="row m-0">
                        <button type="button" className="btn shadow-none text-white div__button--presenca px-1 col-12 mb-2 mb-xl-0 col-xl-6">Declaração de Presença<i className="bi bi-download ms-2 button__img--icon"></i></button>
                        <button type="button" className="btn shadow-none text-white d-flex justify-content-center div__button--presenca px-1 offset-xl-1 col-xl-5">Declaração do Acompanhante<i className="bi bi-download mx-2 my-auto ms-xl-0 button__img--icon"></i></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
);
}
export default ConsultaHistorico;