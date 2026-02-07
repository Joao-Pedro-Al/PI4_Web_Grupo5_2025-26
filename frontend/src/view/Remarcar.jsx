import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useState } from "react";
// Importar o ícone se estiveres a usar lucide-react, ou podes usar um SVG simples

import '../perfis.css';

function Remarcar() {
  const [date, setDate] = useState("");
  const [hourStart, setHourStart] = useState("13");
  const [minuteStart, setMinuteStart] = useState("00");
  const [hourEnd, setHourEnd] = useState("15");
  const [minuteEnd, setMinuteEnd] = useState("00");
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (
      parseInt(hourEnd) < parseInt(hourStart) ||
      (parseInt(hourEnd) === parseInt(hourStart) && parseInt(minuteEnd) <= parseInt(minuteStart))
    ) {
      alert("A hora fim deve ser maior que a hora início.");
      return;
    }

    alert(
      `Horário confirmado:
Início: ${hourStart.padStart(2, "0")}:${minuteStart.padStart(2, "0")}
Fim: ${hourEnd.padStart(2, "0")}:${minuteEnd.padStart(2, "0")}`
    );
  };

  // Componente Reutilizável para o Time Picker da Imagem
  const TimePickerBox = ({ mainLabel, boxLabel, h, setH, m, setM }) => (
    <div className="col-2 ms-5 p-3" style={{
      border: "1.5px solid #A99C5E",
      borderRadius: "28px",
      backgroundColor: "#fff",
      minWidth: "120px"
    }}>
      <label style={{ color: "#A99C5E", fontSize: "12px", fontWeight: "500", marginBottom: "8px", display: "block" }}>
        {boxLabel}
      </label>
      
      <div className="d-flex justify-content-center align-items-center gap-2">
        {/* Bloco de Hora - Roxo (Ativo) */}
        <div className="text-center">
          <input
            type="text"
            value={h}
             
                
           onChange={(e) => setH(e.target.value.replace(/\D/g, '').slice(0, 2))}
            style={{
              width: "70px", height: "70px", fontSize: "1.5rem", textAlign: "center",
              borderRadius: "8px", border: "2px solid #A99C5E", color: "#1D1B20", backgroundColor: "#fff"
            }}
          />
          <div style={{ fontSize: "11px", color: "#A99C5E", marginTop: "4px" }}>Time label</div>
        </div>

        <span style={{ fontSize: "2rem", fontWeight: "bold", paddingBottom: "20px" }}>:</span>

        {/* Bloco de Minuto - Bege (Inativo) */}
        <div className="text-center">
          <input
            type="text"
            value={m}
            
            onChange={(e) => setM(e.target.value.replace(/\D/g, '').slice(0, 2))}
            style={{
              width: "70px", height: "70px", fontSize: "1.5rem", textAlign: "center",
              borderRadius: "8px", border: "none", backgroundColor: "#D7D0B0", color: "#1D1B20"
            }}
          />
          <div style={{ fontSize: "11px", color: "#A99C5E", marginTop: "4px" }}>Time label</div>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between mt-3 px-2">
       
     
      </div>
    </div>
  );

  return (
    <div className="container mt-5">
      {/* Títulos de Topo */}
      <div className="d-flex mb-3">
        <label className="col-7 fs-4" style={{ color: "#A99C5E", fontSize: 18 }}>Data</label>
        <label className="col-2 ms-5 fs-4" style={{ color: "#A99C5E", fontSize: 18 }}>Hora Início</label>
        <label className="ms-5 fs-4" style={{ color: "#A99C5E", fontSize: 18 }}>Hora Fim</label>
      </div>

      {/* Linha de Inputs */}
      <div className="row align-items-start">
        {/* Coluna Data */}
        <div className="col-7">
          <input
            type="date"
            className="form-control"
            style={{
              maxWidth: 350,
              color: "#A99C5E",
              border: "1.5px solid #A99C5E",
              borderRadius: 10,
              padding: "10px"
            }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Box Hora Início Adaptado */}
        <TimePickerBox 
          boxLabel="Hora-Inicio" 
          h={hourStart} setH={setHourStart} 
          m={minuteStart} setM={setMinuteStart} 
        />

        {/* Box Hora Fim Adaptado */}
        <TimePickerBox 
          boxLabel="Hora-Fim" 
          h={hourEnd} setH={setHourEnd} 
          m={minuteEnd} setM={setMinuteEnd} 
        />
      </div>

      {/* Motivo */}
      <div className="mt-4">
        <label className="fs-4" style={{ color: "#A99C5E" }}>Motivo pela mudança</label>
        <textarea
          className="form-control my-3"
          rows="5"
          style={{ maxWidth: 770, border: "1.5px solid #A99C5E", borderRadius: 10 }}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button
          className="btn fs-4 text-white my-3"
          style={{ 
            width: 200, 
            backgroundColor: "#A99C5E", 
            borderRadius: "10px",
            
          }}
          onClick={handleConfirm}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

export default Remarcar;



