import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import urlAPI from './url_global';

import '../criar-conta.css';

const CriarConta = () => {
    const [dataConta, setdataConta] = useState("");
    const [campnome, setcampnome] = useState("");
    const [campemail, setcampemail] = useState("");
    const [camptipo, setcamptipo] = useState("");
    const [aGuardar, setAGuardar] = useState(false);

    const SalvarConta = (e) => {
        e.preventDefault();
        setAGuardar(true);

        const baseUrl = urlAPI + "conta/criar";
        const tipoSelecionado = document.querySelector('input[name="account_type"]')?.value || "paciente";

        const datapost = {
            nome: campnome,
            email: campemail,
            tipoconta: tipoSelecionado === "medico" ? 2 : 1
        };

        axios.post(baseUrl, datapost)
            .then(response => {
                alert(response.data.message);
            })
            .catch(error => {
                alert("Error 34 " + error);
            })
            .finally(() => {
                setAGuardar(false);
            });
    };


    useEffect(() => {
        const selects = document.querySelectorAll('.custom-select');
        const handlers = [];

        const tipo = document.getElementById("tipo");

        selects.forEach(select => {
            const selected = select.querySelector('.custom-select__selected');
            const options = select.querySelector('.custom-select__options');
            const dataName = select.dataset.name;
            const input = document.querySelector(`input[name="${dataName}"]`);

            const handleSelectedClick = (e) => {
                e.stopPropagation();
                options.style.display =
                    options.style.display === 'block' ? 'none' : 'block';
            };

            selected.addEventListener('click', handleSelectedClick);
            handlers.push({ element: selected, handler: handleSelectedClick });

            options.querySelectorAll('div').forEach(option => {
                const handleOptionClick = (e) => {
                    e.stopPropagation();
                    selected.textContent = option.textContent;
                    if (input) {
                        input.value = option.dataset.value;
                    }
                    options.style.display = 'none';
                };
                option.addEventListener('click', handleOptionClick);
                handlers.push({ element: option, handler: handleOptionClick });
            });
        });

        const EventClick = (e) => {
            document.querySelectorAll('.custom-select__options').forEach(o => {
                if (!o.parentElement.contains(e.target)) o.style.display = 'none';
            });
        };

        document.addEventListener('click', EventClick);

        return () => {
            handlers.forEach(({ element, handler }) => {
                element.removeEventListener('click', handler);
            });
            document.removeEventListener('click', EventClick);
        };
    }, []);
return (
    <div className="criar-conta-page">
      <div className="form-container">
        <div className="form-container__header">
          <div className="form-container__eyebrow">Clínica Dentária</div>
          <h2 className="form-container__title">Criar Conta</h2>
          <p className="form-container__subtitle">Associe um novo perfil à clínica</p>
        </div>

        <form onSubmit={SalvarConta}>
          <div className="left-column">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" placeholder="Enter Username" value={campnome} onChange={value=> setcampnome(value.target.value)}/>

            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter Email" value={campemail} onChange={value=> setcampemail(value.target.value)}/>
          </div>

          <div className="right-column">
            <label>Tipo de Conta</label>
            <div className="custom-select" data-name="account_type">
                <div className="custom-select__selected" id="tipo">Paciente</div>
                <div className="custom-select__options">
                    <div data-value="paciente">Paciente</div>
                    <div data-value="medico">Médico</div>
                </div>
          </div>
          <input type="hidden" name="account_type" value="paciente"/>

          <label>Perfil de Paciente</label>
          <div className="custom-select" data-name="profile">
            <div className="custom-select__selected">Geral</div>
            <div className="custom-select__options">
                <div data-value="geral">Geral</div>
                <div data-value="especifico">Específico</div>
            </div>
         </div>
            <input type="hidden" name="profile" value="geral"/>
          </div>

          <button type="submit" className="btn" disabled={aGuardar}>
            {aGuardar ? 'A associar...' : 'Associar'}
          </button>
        </form>
      </div>
    </div>
)
}
export default CriarConta;