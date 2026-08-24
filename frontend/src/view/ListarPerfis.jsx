import React, { useState, useEffect } from "react";
import url from "./url_global";

export default function ListarPerfis() {
  const [lista, setLista] = useState([]);

  const carregar = async () => {
    try {
      const res = await fetch(`${url}utilizadorperfil`);
      const dados = await res.json();
      setLista(dados);
    } catch (err) {
      console.error("Erro ao ligar:", err);
    }
  };

  useEffect(() => { carregar(); }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Lista de Perfis</h2>
      <button onClick={carregar} style={{ marginBottom: '10px' }}>Atualizar</button>
      
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#eee' }}>
            <th>Nome</th>
            <th>Email</th>
            <th>NIF</th>
          </tr>
        </thead>
        <tbody>
          {lista.length > 0 ? lista.map((p, i) => (
            <tr key={i}>
              <td>{p.nome}</td>
              <td>{p.gmail}</td>
              <td>{p.nif}</td>
            </tr>
          )) : (
            <tr><td colSpan="3">Nenhum dado encontrado no servidor.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}