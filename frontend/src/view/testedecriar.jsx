import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useState } from "react";

/* =======================
   MAPAS (IGUAIS À BD)
======================= */
const MAP_GENERO = {
  Masculino: 1,
  Feminino: 2,
  Outro: 3
};

const MAP_ESTADO_CIVIL = {
  Solteiro: 1,
  Casado: 2,
  Divorciado: 3
};

const MAP_CLASSE = {
  Paciente: 1,
  Doutor: 2
};

/* =======================
   COMPONENTES
======================= */
const InputField = ({ label, type = "text", value, onChange }) => (
  <div className="mb-3">
    <label className="form-label text-warning">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="form-control"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="mb-3">
    <label className="form-label text-warning">{label}</label>
    <select className="form-select" value={value} onChange={onChange}>
      <option value="">Selecionar</option>
      {options.map(opt => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

/* =======================
   COMPONENTE PRINCIPAL
======================= */
export default function testedecriar() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    nif: "",
    nascimento: "",
    profissao: "",
    genero: "",
    estadoCivil: "",
    tipoConta: ""
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  const guardarPerfil = async () => {
    const payload = {
      nome: form.username,
      gmail: form.email,
      nif: Number(form.nif),
      datanascimento: form.nascimento,
      profissao: form.profissao,
      genero: MAP_GENERO[form.genero],
      estadocivil: MAP_ESTADO_CIVIL[form.estadoCivil],
      classe: MAP_CLASSE[form.tipoConta]
    };

    try {
      const res = await fetch("http://localhost:3000/utilizadorperfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erro");

      alert("Perfil criado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar perfil");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h4 className="text-warning mb-4">Criar Perfil</h4>

      <InputField label="Nome" value={form.username} onChange={e => update("username", e.target.value)} />
      <InputField label="Email" value={form.email} onChange={e => update("email", e.target.value)} />
      <InputField label="NIF" value={form.nif} onChange={e => update("nif", e.target.value)} />
      <InputField type="date" label="Data de Nascimento" value={form.nascimento} onChange={e => update("nascimento", e.target.value)} />
      <InputField label="Profissão" value={form.profissao} onChange={e => update("profissao", e.target.value)} />

      <SelectField label="Género" value={form.genero} onChange={e => update("genero", e.target.value)} options={["Masculino", "Feminino", "Outro"]} />
      <SelectField label="Estado Civil" value={form.estadoCivil} onChange={e => update("estadoCivil", e.target.value)} options={["Solteiro", "Casado", "Divorciado"]} />
      <SelectField label="Tipo de Conta" value={form.tipoConta} onChange={e => update("tipoConta", e.target.value)} options={["Paciente", "Doutor"]} />

      <button className="btn btn-warning w-100 mt-3" onClick={guardarPerfil}>
        Guardar Perfil
      </button>
    </div>
  );
}
