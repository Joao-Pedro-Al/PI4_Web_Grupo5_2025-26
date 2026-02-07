

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
            <CheckboxField label="Gravidez:" checked={form.gravidez} onChange={(e) => updateForm("gravidez", e.target.checked)} />
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
