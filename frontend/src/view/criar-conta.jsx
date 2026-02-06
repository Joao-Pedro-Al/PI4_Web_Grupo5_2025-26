import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import '../criar-conta.css';

const CriarConta = () => {
    useEffect(() => {
        const selects = document.querySelectorAll('.custom-select');
        const handlers = [];

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
    <div className="form-container">
        
        <form>
          <div className="left-column">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" placeholder="Enter Username"/>

            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter Email"/>
          </div>

          <div className="right-column">
            <label>Tipo de Conta</label>
            <div className="custom-select" data-name="account_type">
                <div className="custom-select__selected">Paciente</div>
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
          <button type="submit" className="btn">Associar</button>
           
          </div>
        </form>
    </div>
);
}
export default CriarConta;