

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../perfis.css";
import axios from "axios";




/* =======================
   COMPONENTES DE ESTILO
======================= */
const SelectButton = ({ label, options, value, onChange }) => (
  <div className="mb-4">
    <label style={{ color: "#A99C5E", fontSize: "14px" }}>{label}</label>
    <div className="dropdown">
      <button
        className="btn dropdown-toggle w-100 text-start text-white shadow-none"
        type="button"
        data-bs-toggle="dropdown"
        style={{ backgroundColor: "#A99C5E", borderRadius: "10px", height: "42px", fontFamily: "Poppins" }}
      >
        {value || label}
      </button>
      <ul className="dropdown-menu w-100 shadow py-0">
        {options.map((opt) => (
          <li key={opt}>
            <button
              className={`dropdown-item ${value === opt ? "active" : ""}`}
              type="button"
              onClick={() => onChange(opt)}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const InputField = ({ label, type = "text", value, onChange }) => (
  <div className="mb-4">
    <label style={{ color: "#A99C5E", fontSize: "14px" }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="form-control shadow-none"
      style={{ border: "1.5px solid #A99C5E", borderRadius: "10px", height: "42px", fontFamily: "Poppins" }}
    />
  </div>
);

const CheckboxField = ({ label, checked, onChange }) => (
  <div className="d-flex align-items-center justify-content-between mb-4">
    <label style={{ color: "#A99C5E", fontSize: "14px", marginRight: "10px" }}>{label}</label>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{
        width: "20px",
        height: "20px",
        accentColor: "#A99C5E",
        cursor: "pointer",
        border: "1.5px solid #A99C5E"
      }}
    />
  </div>
);

const GoldenButton = ({ label, onClick, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    className="btn shadow-none text-white"
    style={{
      backgroundColor: "#A99C5E",
      borderRadius: "10px",
      padding: "10px 40px",
      fontSize: "16px",
      fontFamily: "Poppins",
      border: "none",
      transition: "0.3s opacity"
    }}
    onMouseOver={(e) => (e.target.style.opacity = "0.8")}
    onMouseOut={(e) => (e.target.style.opacity = "1")}
  >
    {label}
  </button>
);

/* =======================
   COMPONENTE PRINCIPAL
======================= */
function Criarperfil() {
  const [form, setForm] = useState({
    nome: "",
    nif: "",
    gmail: "",
    datanascimento: "",
    profissao: "",
    // Valores numéricos para o SQL
    idclasse: null,
    idestadocivil: null,
    idgenero: null,
    // Labels para a UI
    classeLabel: "",
    estadoCivilLabel: "",
    generoLabel: "",
    // Histórico Médico
    alergias: "",
    medicamentos: "",
    condicoesSaude: "",
    // Histórico Dentário
    motivoConsulta: "",
    historicoTratamentos: "",
    anestesiaLocal: false,
    dorSensibilidade: false,
    condicoesDentariasPre: false,
    detalhesPreExistentes: "",
    habitosHigieneOral: "",
    consumoSubstancias: false,
    detalhesSubstancias: "",
    atividadesDesportivas: "",
    tipoBruxismo: "",
    historicoClinica: "",
    infoAdicional: "",
    resultadosAnteriores: ""
  });

  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = async () => {
    try {
      // Enviamos apenas o necessário para o backend
      // Nota: idgenero, idestadocivil e idclasse já estarão como Números
      const response = await axios.post("http://localhost:3000/Utilizadorperfil/create", form);
      
      if (response.data.success) {
        alert("Perfil criado com sucesso!");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao guardar dados.");
    }
  };

  const titleBarStyle = {
    border: "1.5px solid #A99C5E",
    borderRadius: "6px",
    padding: "6px 16px",
    color: "#A99C5E",
    fontSize: "18px",
    marginBottom: "40px",
    marginTop: "40px",
    fontFamily: "Poppins"
  };

  return (
    <div className="container py-5" style={{ fontFamily: "Poppins" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        <div style={{ ...titleBarStyle, marginTop: 0 }}>Identificação Pessoal</div>
        <div className="row justify-content-center" style={{ columnGap: "120px" }}>
          <div className="col-md-5">
            <InputField label="Username" value={form.nome} onChange={(e) => updateForm("nome", e.target.value)} />
            <InputField label="Email" value={form.gmail} onChange={(e) => updateForm("gmail", e.target.value)} />
            <InputField label="Profissão" value={form.profissao} onChange={(e) => updateForm("profissao", e.target.value)} />
            
            <SelectButton 
              label="Estado Civil" 
              options={["Solteiro", "Casado", "Divorciado"]} 
              value={form.estadoCivilLabel} 
              onChange={(val) => {
                const map = { "Solteiro": 1, "Casado": 2, "Divorciado": 3 };
                setForm({...form, idestadocivil: map[val], estadoCivilLabel: val});
              }} 
            />
          </div>
          <div className="col-md-5">
            <InputField label="NIF / SNS" value={form.nif} onChange={(e) => updateForm("nif", e.target.value)} />
            <InputField label="Data de Nascimento" type="date" value={form.datanascimento} onChange={(e) => updateForm("datanascimento", e.target.value)} />
            
            <SelectButton 
              label="Tipo de Conta" 
              options={["Paciente", "Doutor"]} 
              value={form.classeLabel} 
              onChange={(val) => {
                const map = { "Paciente": 1, "Doutor": 2 };
                setForm({...form, idclasse: map[val], classeLabel: val});
              }} 
            />
            <SelectButton 
              label="Género" 
              options={["Masculino", "Feminino", "Outro"]} 
              value={form.generoLabel} 
              onChange={(val) => {
                const map = { "Masculino": 1, "Feminino": 2, "Outro": 3 };
                setForm({...form, idgenero: map[val], generoLabel: val});
              }} 
            />
          </div>
        </div>

        <div style={titleBarStyle}>Histórico Médico Geral</div>
        <div className="row justify-content-center" style={{ columnGap: "120px" }}>
          <div className="col-md-5">
            <InputField label="Alergias" value={form.alergias} onChange={(e) => updateForm("alergias", e.target.value)} />
            <InputField label="Medicamentos" value={form.medicamentos} onChange={(e) => updateForm("medicamentos", e.target.value)} />
          </div>
          <div className="col-md-5">
            <InputField label="Condições de Saúde" value={form.condicoesSaude} onChange={(e) => updateForm("condicoesSaude", e.target.value)} />
          </div>
        </div>

        <div style={titleBarStyle}>Histórico Dentário</div>
        <div className="row justify-content-center" style={{ columnGap: "120px" }}>
          <div className="col-md-5">
            <InputField label="Motivo da consulta inicial:" value={form.motivoConsulta} onChange={(e) => updateForm("motivoConsulta", e.target.value)} />
            <CheckboxField label="Experiência com anestesias locais:" checked={form.anestesiaLocal} onChange={(e) => updateForm("anestesiaLocal", e.target.checked)} />
            <CheckboxField label="Condições Dentárias Pré-existentes:" checked={form.condicoesDentariasPre} onChange={(e) => updateForm("condicoesDentariasPre", e.target.checked)} />
            <InputField label="Se Tem, escreva abaixo:" value={form.detalhesPreExistentes} onChange={(e) => updateForm("detalhesPreExistentes", e.target.value)} />
            <InputField label="Habitos de Higiene Oral:" value={form.habitosHigieneOral} onChange={(e) => updateForm("habitosHigieneOral", e.target.value)} />
            <CheckboxField label="Consumo de substâncias:" checked={form.consumoSubstancias} onChange={(e) => updateForm("consumoSubstancias", e.target.checked)} />
            <InputField label="Se usa, escreva abaixo:" value={form.detalhesSubstancias} onChange={(e) => updateForm("detalhesSubstancias", e.target.value)} />
          </div>
          <div className="col-md-5">
            <InputField label="Histórico de tratamentos passados:" value={form.historicoTratamentos} onChange={(e) => updateForm("historicoTratamentos", e.target.value)} />
            <CheckboxField label="Histórico de dor ou sensibilidade:" checked={form.dorSensibilidade} onChange={(e) => updateForm("dorSensibilidade", e.target.checked)} />
            <InputField label="Atividades Desportivas:" value={form.atividadesDesportivas} onChange={(e) => updateForm("atividadesDesportivas", e.target.value)} />
            <SelectButton 
              label="Bruxismo" 
              options={["Não tem", "Tem"]} 
              value={form.tipoBruxismo} 
              onChange={(val) => updateForm("tipoBruxismo", val)} 
            />
          </div>
        </div>

        <div style={titleBarStyle}>Tratamentos Anteriores e Resultados</div>
        <div className="row justify-content-center" style={{ columnGap: "120px" }}>
          <div className="col-md-5">
            <InputField label="Histórico de tratamentos realizados:" value={form.historicoClinica} onChange={(e) => updateForm("historicoClinica", e.target.value)} />
            <InputField label="Informação adicional relevante:" value={form.infoAdicional} onChange={(e) => updateForm("infoAdicional", e.target.value)} />
          </div>
          <div className="col-md-5">
            <InputField label="Resultados de tratamentos anteriores:" value={form.resultadosAnteriores} onChange={(e) => updateForm("resultadosAnteriores", e.target.value)} />
            <div className="mt-2 text-center">
              <label style={{ color: "#A99C5E", fontSize: "14px", display: "block", marginBottom: "10px" }}>Anexar exames clínicos</label>
              <GoldenButton label="Anexar" onClick={() => alert("Seletor de ficheiros")} />
            </div>
          </div>
        </div>

        {/* BOTÃO DE SALVAR FINAL */}
        <div className="text-center mt-5 mb-5">
          <GoldenButton label="GUARDAR PERFIL COMPLETO" onClick={handleSave} />
        </div>

      </div>
    </div>
  );
}

export default Criarperfil;
/*const Criarperfil = () => {
  const [form, setForm] = useState({
    nome: "", gmail: "", nif: "", profissao: "", datanascimento: "",
    idgenero: 1, idestadocivil: 1, idclasse: 1
  });

  const handleSave = async () => {
    const baseUrl = "http://localhost:3000/Utilizadorperfil/create";
    try {
      // O objeto enviado deve ter as chaves que o controller espera
      const response = await axios.post(baseUrl, form);
      if (response.data.success) {
        alert("Sucesso: " + response.data.message);
      }
    } catch (error) {
      alert("Erro ao gravar: " + error.message);
    }
  };

  return (
    <div className="container mt-4">
      <input className="form-control mb-2" placeholder="Nome" onChange={e => setForm({...form, nome: e.target.value})} />
      <input className="form-control mb-2" placeholder="Email" onChange={e => setForm({...form, gmail: e.target.value})} />
      <input className="form-control mb-2" placeholder="NIF" onChange={e => setForm({...form, nif: e.target.value})} />
      <input className="form-control mb-2" type="date" onChange={e => setForm({...form, datanascimento: e.target.value})} />
      
      <label>Género</label>
      <select className="form-control mb-2" value={form.idgenero} onChange={e => setForm({...form, idgenero: parseInt(e.target.value)})}>
        <option value="1">Masculino</option>
        <option value="2">Feminino</option>
      </select>

      <label>Estado Civil</label>
      <select className="form-control mb-2" value={form.idestadocivil} onChange={e => setForm({...form, idestadocivil: parseInt(e.target.value)})}>
        <option value="1">Solteiro</option>
        <option value="2">Casado</option>
      </select>

      <label>Tipo de Conta</label>
      <select className="form-control mb-4" value={form.idclasse} onChange={e => setForm({...form, idclasse: parseInt(e.target.value)})}>
        <option value="1">Paciente</option>
        <option value="2">Doutor</option>
      </select>

      <button className="btn btn-primary" onClick={handleSave}>Guardar Perfil</button>
    </div>
  );
};

export default Criarperfil;*/
/* =======================
   COMPONENTES REUTILIZÁVEIS
======================= */
/*const SelectButton = ({ label, options, value, onChange }) => (
  <div className="mb-4">
    <label style={{ color: "#A99C5E", fontSize: "14px" }}>{label}</label>
    <div className="dropdown">
      <button
        className="btn dropdown-toggle w-100 text-start text-white shadow-none"
        type="button"
        data-bs-toggle="dropdown"
        style={{ backgroundColor: "#A99C5E", borderRadius: "10px", height: "42px", fontFamily: "Poppins" }}
      >
        {value || label}
      </button>
      <ul className="dropdown-menu w-100 shadow py-0">
        {options.map((opt) => (
          <li key={opt}>
            <button
              className={`dropdown-item ${value === opt ? "active" : ""}`}
              onClick={() => onChange(opt)}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const InputField = ({ label, type = "text", value, onChange }) => (
  <div className="mb-4">
    <label style={{ color: "#A99C5E", fontSize: "14px" }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="form-control shadow-none"
      style={{ border: "1.5px solid #A99C5E", borderRadius: "10px", height: "42px", fontFamily: "Poppins" }}
    />
  </div>
);*/

// NOVO: Componente para as Checkboxes da imagem do Figma
/*const CheckboxField = ({ label, checked, onChange }) => (
  <div className="d-flex align-items-center justify-content-between mb-4">
    <label style={{ color: "#A99C5E", fontSize: "14px", marginRight: "10px" }}>{label}</label>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{
        width: "20px",
        height: "20px",
        accentColor: "#A99C5E", // Cor dourada ao selecionar
        cursor: "pointer",
        border: "1.5px solid #A99C5E"
      }}
    />
  </div>
);*/
/* =======================
   BOTÃO DOURADO (FIGMA)
======================= */
/*const GoldenButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="btn shadow-none text-white"
    style={{
      backgroundColor: "#A99C5E", // O dourado exato das tuas barras
      borderRadius: "10px",
      padding: "10px 40px",
      fontSize: "16px",
      fontFamily: "Poppins",
      border: "none",
      transition: "0.3s opacity"
    }}
    onMouseOver={(e) => e.target.style.opacity = "0.8"}
    onMouseOut={(e) => e.target.style.opacity = "1"}
  >
    {label}
  </button>
);*/
/*function Criarperfil() {
  const [form, setForm] = useState({
    nome: "", 
    nif: "", 
    gmail: "", 
    datanascimento: "", 
    profissao: "", 
    idclasse: "", 
    idestadocivil: "",
    idgenero: "",
   /* alergias: "",
    medicamentos: "",
    condicoesSaude: "",
    motivoConsulta: "",
    historicoTratamentos: "",
    anestesiaLocal: false,
    dorSensibilidade: false,
    condicoesDentariasPre: false,
    detalhesPreExistentes: "",
    habitosHigieneOral: "",
    consumoSubstancias: false,
    detalhesSubstancias: "",
    atividadesDesportivas: "",
    tipoBruxismo: "",
    historicoClinica: "",
    infoAdicional: "",
    resultadosAnteriores: ""
  });

  const updateForm = (key, value) => setForm({ ...form, [key]: value });*/

  // --- FUNÇÃO PARA ADICIONAR NO BACKEND ---
  /*const handleSave = async (e) => {
    if (e) e.preventDefault();
    
    const baseUrl = "http://localhost:3000/Utilizadorperfil/create";

    try {
      // Enviamos o objeto 'form' inteiro para o backend
      const response = await axios.post(baseUrl, form);
      
      if (response.data.success) {
        alert("Perfil criado com sucesso!");
        console.log(response.data);
      } else {
        alert("Aviso: " + response.data.message);
      }
    } catch (error) {
      console.error("Erro ao conectar:", error);
      alert("Erro ao salvar no servidor: " + (error.response?.data?.message || error.message));
    }
  };

  const titleBarStyle = {
    border: "1.5px solid #A99C5E",
    borderRadius: "6px",
    padding: "6px 16px",
    color: "#A99C5E",
    fontSize: "18px",
    marginBottom: "40px",
    marginTop: "40px"
  };

  return (
    <div className="container py-5" style={{ fontFamily: "Poppins" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        
        <div style={{ ...titleBarStyle, marginTop: 0 }}>Identificação Pessoal</div>
        <div className="row justify-content-center" style={{ columnGap: "120px" }}>
          <div className="col-md-5">
            <InputField label="Username" value={form.nome} onChange={(e) => updateForm("nome", e.target.value)} />
            <InputField label="Email" value={form.gmail} onChange={(e) => updateForm("gmail", e.target.value)} />
            <InputField label="Profissão" value={form.profissao} onChange={(e) => updateForm("profissao", e.target.value)} />
            <SelectButton label="Estado Civil" options={["Solteiro", "Casado", "Divorciado"]} value={form.idestadocivil} onChange={(val) => updateForm("idestadocivil", val)} />
          </div>
          <div className="col-md-5">
            <InputField label="NIF / SNS" value={form.nif} onChange={(e) => updateForm("nif", e.target.value)} />
            <InputField label="Data de Nascimento" type="date" value={form.datanascimento} onChange={(e) => updateForm("datanascimento", e.target.value)} />
            <SelectButton label="Tipo de Conta" options={["Paciente", "Doutor"]} value={form.idclasse} onChange={(val) => updateForm("idclasse", val)} />
            <SelectButton label="Género" options={["Masculino", "Feminino", "Outro"]} value={form.idgenero} onChange={(val) => updateForm("idgenero", val)} />
          </div>
        </div>

       
        <div style={titleBarStyle}>Histórico Médico Geral</div>
        <div className="row justify-content-center" style={{ columnGap: "120px" }}>
          <div className="col-md-5">
            <InputField label="Alergias" value={form.alergias} onChange={(e) => updateForm("alergias", e.target.value)} />
            <InputField label="Medicamentos" value={form.medicamentos} onChange={(e) => updateForm("medicamentos", e.target.value)} />
          </div>
          <div className="col-md-5">
            <InputField label="Condições de Saúde" value={form.condicoesSaude} onChange={(e) => updateForm("condicoesSaude", e.target.value)} />
          </div>
        </div>

     
        <div style={titleBarStyle}>Histórico Dentário</div>
        <div className="row justify-content-center" style={{ columnGap: "120px" }}>
          <div className="col-md-5">
            <InputField label="Motivo da consulta inicial:" value={form.motivoConsulta} onChange={(e) => updateForm("motivoConsulta", e.target.value)} />
            <CheckboxField label="Experiência com anestesias locais:" checked={form.anestesiaLocal} onChange={(e) => updateForm("anestesiaLocal", e.target.checked)} />
            <CheckboxField label="Condições Dentárias Pré-existentes:" checked={form.condicoesDentariasPre} onChange={(e) => updateForm("condicoesDentariasPre", e.target.checked)} />
            <InputField label="Se Tem, escreva abaixo:" value={form.detalhesPreExistentes} onChange={(e) => updateForm("detalhesPreExistentes", e.target.value)} />
          </div>
          <div className="col-md-5">
            <InputField label="Histórico de tratamentos:" value={form.historicoTratamentos} onChange={(e) => updateForm("historicoTratamentos", e.target.value)} />
            <CheckboxField label="Histórico de dor/sensibilidade:" checked={form.dorSensibilidade} onChange={(e) => updateForm("dorSensibilidade", e.target.checked)} />
            <SelectButton label="Bruxismo" options={["Não tem", "Tem"]} value={form.tipoBruxismo} onChange={(val) => updateForm("tipoBruxismo", val)} />
          </div>
        </div>
        <div style={titleBarStyle}>Tratamentos Anteriores e Resultados</div>
<div className="row justify-content-center" style={{ columnGap: "120px" }}>
  

  <div className="col-md-5">
    <InputField 
      label="Histórico de tratamentos realizados na clinimaleios e/ou em outras instituições." 
      value={form.historicoClinica} 
      onChange={(e) => updateForm("historicoClinica", e.target.value)} 
    />
    <InputField 
      label="Informação adicional relevante fornecida pelo paciente" 
      value={form.infoAdicional} 
      onChange={(e) => updateForm("infoAdicional", e.target.value)} 
    />
  </div>


  <div className="col-md-5">
    <InputField 
      label="Resultados de tratamentos anteriores" 
      value={form.resultadosAnteriores} 
      onChange={(e) => updateForm("resultadosAnteriores", e.target.value)} 
    />

  
    <div className="mt-2">
      <label style={{ color: "#A99C5E", fontSize: "14px", display: "block", marginBottom: "10px" }}>
        Anexar exames clínicos
      </label>
      <GoldenButton 
        label="Anexar" 
        onClick={() => alert("Abrir seletor de ficheiros...")} 
      />
    </div>
  </div>
</div>

      
        <div className="d-flex justify-content-center mt-5">
          <GoldenButton 
            label="FINALIZAR E GUARDAR PERFIL" 
            onClick={handleSave} 
          />
        </div>

      </div>
    </div>
  );
}

export default Criarperfil;*/

/*const Criarperfil = () => {
  // 1. Estados (Hooks) sempre no topo
  const [campnome, setcampnome] = useState("");
  const [campprofissao, setcampProfissao] = useState("");
  const [campgmail, setcampGmail] = useState("");
  const [campnif, setcampNif] = useState("");

  // 2. Função de Salvar (Definida antes do return)
  const SendSave = (e) => {
    if (e) e.preventDefault(); // Previne o reload da página

    const baseUrl = "http://localhost:3000/Utilizadorperfil/create";
    const datapost = {
      nome: campnome,
      gmail: campgmail,
      nif: campnif,
      profissao: campprofissao,
    };

    axios.post(baseUrl, datapost)
      .then(response => {
        if (response.data.success === true) {
          alert(response.data.message);
        } else {
          alert(response.data.message);
        }
      })
      .catch(error => {
        alert("Error 34 " + (error.response?.data?.message || error.message));
      });
  };

  // 3. Renderização (O que aparece na tela)
  return (
    <div className="container mt-4">
      <div className="form-group row mb-3">
        <label htmlFor="inputnome" className="col-sm-2 col-form-label">Nome</label>
        <div className="col-sm-10">
          <input 
            type="text" 
            className="form-control" 
            id="inputnome"
            placeholder="Teu nome"
            value={campnome} 
            onChange={(e) => setcampnome(e.target.value)} 
          />
        </div>
      </div>

      <div className="form-group row mb-3">
        <label htmlFor="inputnif" className="col-sm-2 col-form-label">NIF</label>
        <div className="col-sm-10">
          <input 
            type="text" 
            className="form-control" 
            id="inputnif"
            placeholder="Teu NIF"
            value={campnif} 
            onChange={(e) => setcampNif(e.target.value)} 
          />
        </div>
      </div>

      <div className="form-group row mb-3">
        <label htmlFor="inputgmail" className="col-sm-2 col-form-label">Gmail</label>
        <div className="col-sm-10">
          <input 
            type="email" 
            className="form-control" 
            id="inputgmail"
            placeholder="Teu Gmail"
            value={campgmail} 
            onChange={(e) => setcampGmail(e.target.value)} 
          />
        </div>
      </div>

      <div className="form-group row mb-3">
        <label htmlFor="inputprofissao" className="col-sm-2 col-form-label">Profissão</label>
        <div className="col-sm-10">
          <input 
            type="text" 
            className="form-control" 
            id="inputprofissao"
            placeholder="Tua profissão"
            value={campprofissao} 
            onChange={(e) => setcampProfissao(e.target.value)} 
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        onClick={(e) => SendSave(e)}
      >
        Save
      </button>
    </div>
  );
};

export default Criarperfil;


/* =======================
   COMPONENTE PRINCIPAL
======================= */
/*function Criarperfil() {
  const [form, setForm] = useState({
    nome: "", 
    nif: "", 
    gmail: "", 
    datanascimento: "", 
    profissao: "", 
    idclasse: "", 
    idestadocivil: "",
     idgenero: "",
    alergias: "",
     medicamentos: "",
      condicoesSaude: "",
    // Campos do Histórico Dentário (Figma)
    motivoConsulta: "",
    historicoTratamentos: "",
    anestesiaLocal: false,
    dorSensibilidade: false,
    condicoesDentariasPre: false,
    detalhesPreExistentes: ""
  });


  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  // Estilo comum para as barras de título
  const titleBarStyle = {
    border: "1.5px solid #A99C5E",
    borderRadius: "6px",
    padding: "6px 16px",
    color: "#A99C5E",
    fontSize: "18px",
    marginBottom: "40px",
    marginTop: "40px"
  };

  return (
    <div className="container py-5" style={{ fontFamily: "Poppins" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
       
        <div style={{ ...titleBarStyle, marginTop: 0 }}>Identificação Pessoal</div>
        <div className="row justify-content-center" style={{ columnGap: "120px" }}>
          <div className="col-md-5">
            <InputField label="Username" value={form.nome} onChange={(e) => updateForm("nome", e.target.value)} />
            <InputField label="Email" value={form.gmail} onChange={(e) => updateForm("gmail", e.target.value)} />
            <InputField label="Profissão" value={form.profissao} onChange={(e) => updateForm("profissao", e.target.value)} />
            <SelectButton label="Estado Civil" options={["Solteiro", "Casado", "Divorciado"]} value={form.idestadocivil} onChange={(val) => updateForm("idestadocivil", val)} />
          </div>
          <div className="col-md-5">
            <InputField label="NIF / SNS" value={form.nif} onChange={(e) => updateForm("nif", e.target.value)} />
            <InputField label="Data de Nascimento" type="date" value={form.datanascimento} onChange={(e) => updateForm("datanascimento", e.target.value)} />
            <SelectButton label="Tipo de Conta" options={["Paciente", "Doutor"]} value={form.idclasse} onChange={(val) => updateForm("idclasse", val)} />
            <SelectButton label="Género" options={["Masculino", "Feminino", "Outro"]} value={form.idgenero} onChange={(val) => updateForm("idgenero", val)} />
          </div>
        </div>

       
        <div style={titleBarStyle}>Histórico Médico Geral</div>
        <div className="row justify-content-center" style={{ columnGap: "120px" }}>
          <div className="col-md-5">
            <InputField label="Alergias" value={form.alergias} onChange={(e) => updateForm("alergias", e.target.value)} />
            <InputField label="Medicamentos" value={form.medicamentos} onChange={(e) => updateForm("medicamentos", e.target.value)} />
          </div>
          <div className="col-md-5">
            <InputField label="Condições de Saúde" value={form.condicoesSaude} onChange={(e) => updateForm("condicoesSaude", e.target.value)} />
          </div>
        </div>

        
        <div style={titleBarStyle}>Histórico Dentário</div>
        <div className="row justify-content-center" style={{ columnGap: "120px" }}>
          
         
          <div className="col-md-5">
            <InputField 
              label="Motivo da consulta inicial:" 
              value={form.motivoConsulta} 
              onChange={(e) => updateForm("motivoConsulta", e.target.value)} 
            />
            
            <CheckboxField 
              label="Experiência com anestesias locais ou gerais:" 
              checked={form.anestesiaLocal} 
              onChange={(e) => updateForm("anestesiaLocal", e.target.checked)} 
            />

            <CheckboxField 
              label="Condições Dentárias Pré-existentes:" 
              checked={form.condicoesDentariasPre} 
              onChange={(e) => updateForm("condicoesDentariasPre", e.target.checked)} 
            />

            <InputField 
              label="Se Tem, escreva abaixo:" 
              value={form.detalhesPreExistentes} 
              onChange={(e) => updateForm("detalhesPreExistentes", e.target.value)} 
            />

             <InputField 
              label="Habitos de Higiene Oral:" 
              value={form.habitosHigieneOral} 
              onChange={(e) => updateForm("habitosHigieneOral", e.target.value)} 
            />
             <CheckboxField 
              label="Comsumo de substâncias:" 
              checked={form.consumoSubstancias} 
              onChange={(e) => updateForm("consumoSubstancias", e.target.checked)} 
            />
             <InputField 
              label="Se usa, escreva abaixo:" 
              value={form.detalhesSubstancias} 
              onChange={(e) => updateForm("detalhesSubstancias", e.target.value)} 
            />
          </div>

         
          <div className="col-md-5">
            <InputField 
              label="Histórico de tratamentos dentários passados:" 
              value={form.historicoTratamentos} 
              onChange={(e) => updateForm("historicoTratamentos", e.target.value)} 
            />

            <CheckboxField 
              label="Histórico de dor, desconforto ou sensibilidade dentária:" 
              checked={form.dorSensibilidade} 
              onChange={(e) => updateForm("dorSensibilidade", e.target.checked)} 
            />
              <InputField 
              label="Atividades Desportivas:" 
              value={form.atividadesDesportivas} 
              onChange={(e) => updateForm("atividadesDesportivas", e.target.value)} 
            />
             <SelectButton label="Bruxismo" options={["Não tem", "Tem"]} value={form.tipoBruxismo} onChange={(val) => updateForm("tipoBruxismo", val)} />
          </div>
        </div>

<div style={titleBarStyle}>Tratamentos Anteriores e Resultados</div>
<div className="row justify-content-center" style={{ columnGap: "120px" }}>
  

  <div className="col-md-5">
    <InputField 
      label="Histórico de tratamentos realizados na clinimaleios e/ou em outras instituições." 
      value={form.historicoClinica} 
      onChange={(e) => updateForm("historicoClinica", e.target.value)} 
    />
    <InputField 
      label="Informação adicional relevante fornecida pelo paciente" 
      value={form.infoAdicional} 
      onChange={(e) => updateForm("infoAdicional", e.target.value)} 
    />
  </div>


  <div className="col-md-5">
    <InputField 
      label="Resultados de tratamentos anteriores" 
      value={form.resultadosAnteriores} 
      onChange={(e) => updateForm("resultadosAnteriores", e.target.value)} 
    />

  
    <div className="mt-2">
      <label style={{ color: "#A99C5E", fontSize: "14px", display: "block", marginBottom: "10px" }}>
        Anexar exames clínicos
      </label>
      <GoldenButton 
        label="Anexar" 
        onClick={() => alert("Abrir seletor de ficheiros...")} 
      />
    </div>
  </div>
</div>
     
   
      </div>
      
    </div>
    
  );
}*/

//export default Criarperfil;