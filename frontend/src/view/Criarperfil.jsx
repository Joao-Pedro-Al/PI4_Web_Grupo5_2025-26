import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  <div className="d-flex align-items-center mb-4" style={{ gap: "8px" }}>
    <label style={{ color: "#A99C5E", fontSize: "14px", cursor: "pointer", margin: 0 }}>
      {label}
    </label>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{
        width: "20px",
        height: "20px",
        accentColor: "#A99C5E",
        cursor: "pointer",
        border: "1.5px solid #A99C5E",
        marginLeft: "4px"
      }}
    />
  </div>
);


const SectionTitle = ({ step, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
    <div style={{
      backgroundColor: "#A99C5E",
      color: "white",
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "14px",
      flexShrink: 0
    }}>{step}</div>
    <h5 style={{ color: "#A99C5E", margin: 0, fontFamily: "Poppins", fontWeight: 600 }}>{title}</h5>
  </div>
);

const ToggleField = ({ label, checked, onChange }) => (
  <div className="d-flex align-items-center mb-4" style={{ gap: "8px" }}>
    <label style={{ color: "#A99C5E", fontSize: "14px", cursor: "pointer", margin: 0 }}>
      {label}
    </label>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{
        width: "20px",
        height: "20px",
        accentColor: "#A99C5E",
        cursor: "pointer",
        marginLeft: "4px"
      }}
    />
  </div>
);

const GoldenButton = ({ label, onClick, disabled = false, className = "", styleOverride = {} }) => {
  const baseStyle = {
    backgroundColor: "#A99C5E",
    borderRadius: "10px",
    padding: "10px 40px",
    fontSize: "16px",
    fontFamily: "Poppins",
    border: "none",
    transition: "0.3s opacity",
    color: "white",
    display: "inline-block",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn shadow-none text-white ${className}`}
      style={{ ...baseStyle, ...styleOverride, opacity: disabled ? 0.6 : 1 }}
      onMouseOver={(e) => { if (!disabled) e.currentTarget.style.opacity = "0.8"; }}
      onMouseOut={(e) => { if (!disabled) e.currentTarget.style.opacity = "1"; }}
    >
      {label}
    </button>
  );
};


/* =======================
   COMPONENTE PRINCIPAL
======================= */
function Criarperfil() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
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

  // Ficheiros anexados (exames clínicos)
  const [ficheiros, setFicheiros] = useState([]);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const novos = Array.from(e.target.files);
    setFicheiros((prev) => [...prev, ...novos]);
  };

  const removerFicheiro = (index) => {
    setFicheiros((prev) => prev.filter((_, i) => i !== index));
  };

  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = async () => {
    if (!form.nome) {
      alert("Por favor, preencha pelo menos o Nome / Username.");
      return;
    }

    setIsSaving(true);
    try {

      if (response.data.success) {
        alert("Perfil criado com sucesso!");
        navigate("/backoffice/perfis");
      } else {
        alert("Erro ao criar perfil: " + (response.data.message || "Tente novamente"));
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao guardar dados no servidor: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-fluid" style={{ fontFamily: "Poppins", paddingTop: "20px", paddingBottom: "40px" }}>
      <div style={{ maxWidth: "1100px", width: "100%", margin: "0 auto" }}>
        
        <div className="secao-perfil" style={{ marginTop: 0 }}>
          <SectionTitle step={1} title="Identificação pessoal" />
          <div className="grid-campos">
            <div>
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
            <div>
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
              <ToggleField label="Gravidez" checked={!!form.gravidez} onChange={(e) => updateForm("gravidez", e.target.checked)} />
            </div>
          </div>
        </div>

        <div className="secao-perfil">
          <SectionTitle step={2} title="Histórico médico geral" />
          <div className="grid-campos">
            <div>
              <InputField label="Alergias" value={form.alergias} onChange={(e) => updateForm("alergias", e.target.value)} />
              <InputField label="Medicamentos" value={form.medicamentos} onChange={(e) => updateForm("medicamentos", e.target.value)} />
            </div>
            <div>
              <InputField label="Condições de Saúde" value={form.condicoesSaude} onChange={(e) => updateForm("condicoesSaude", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="secao-perfil">
          <SectionTitle step={3} title="Histórico dentário" />
          <div className="grid-campos">
            <div>
              <InputField label="Motivo da consulta inicial:" value={form.motivoConsulta} onChange={(e) => updateForm("motivoConsulta", e.target.value)} />
              <ToggleField label="Experiência com anestesias locais" checked={form.anestesiaLocal} onChange={(e) => updateForm("anestesiaLocal", e.target.checked)} />
              <ToggleField label="Condições dentárias pré-existentes" checked={form.condicoesDentariasPre} onChange={(e) => updateForm("condicoesDentariasPre", e.target.checked)} />
              <InputField label="Se Tem, escreva abaixo:" value={form.detalhesPreExistentes} onChange={(e) => updateForm("detalhesPreExistentes", e.target.value)} />
              <InputField label="Habitos de Higiene Oral:" value={form.habitosHigieneOral} onChange={(e) => updateForm("habitosHigieneOral", e.target.value)} />
              <ToggleField label="Consumo de substâncias" checked={form.consumoSubstancias} onChange={(e) => updateForm("consumoSubstancias", e.target.checked)} />
              <InputField label="Se usa, escreva abaixo:" value={form.detalhesSubstancias} onChange={(e) => updateForm("detalhesSubstancias", e.target.value)} />
            </div>
            <div>
              <InputField label="Histórico de tratamentos passados:" value={form.historicoTratamentos} onChange={(e) => updateForm("historicoTratamentos", e.target.value)} />
              <ToggleField label="Histórico de dor ou sensibilidade" checked={form.dorSensibilidade} onChange={(e) => updateForm("dorSensibilidade", e.target.checked)} />
              <InputField label="Atividades Desportivas:" value={form.atividadesDesportivas} onChange={(e) => updateForm("atividadesDesportivas", e.target.value)} />
              <SelectButton
                label="Bruxismo"
                options={["Não tem", "Tem"]}
                value={form.tipoBruxismo}
                onChange={(val) => updateForm("tipoBruxismo", val)}
              />
            </div>
          </div>
        </div>

        <div className="secao-perfil">
          <SectionTitle step={4} title="Tratamentos anteriores e resultados" />
          <div className="grid-campos">
            <div>
              <InputField label="Histórico de tratamentos realizados:" value={form.historicoClinica} onChange={(e) => updateForm("historicoClinica", e.target.value)} />
              <InputField label="Informação adicional relevante:" value={form.infoAdicional} onChange={(e) => updateForm("infoAdicional", e.target.value)} />
            </div>
            <div>
              <InputField label="Resultados de tratamentos anteriores:" value={form.resultadosAnteriores} onChange={(e) => updateForm("resultadosAnteriores", e.target.value)} />

              <div className="mt-2 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); fileInputRef.current.click(); }}
                  style={{ color: "#0d6efd", textDecoration: "underline", fontWeight: 600, cursor: "pointer", fontSize: "15px" }}
                >
                  Anexar exames clínicos
                </a>

                {ficheiros.length > 0 && (
                  <ul className="list-unstyled mt-2 mb-0" style={{ fontSize: "13px", color: "#6b6248" }}>
                    {ficheiros.map((f, i) => (
                      <li key={i} className="d-flex justify-content-between align-items-center">
                        {f.name}
                        <button
                          type="button"
                          onClick={() => removerFicheiro(i)}
                          className="btn btn-sm p-0 ms-2"
                          style={{ color: "#D85A30", background: "none", border: "none" }}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTÃO DE SALVAR FINAL */}
        <div className="text-center mt-5 mb-5">
          <GoldenButton 
            label={isSaving ? "A GUARDAR PERFIL..." : "GUARDAR PERFIL COMPLETO"} 
            onClick={handleSave} 
            disabled={isSaving} 
            style={{ padding: "8px 14px", minWidth: "160px" }} 
          />
        </div>

      </div>
    </div>
  );
}

export default Criarperfil; 