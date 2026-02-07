import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import urlAPI from './url_global';

import '../criar-conta.css';

const CriarConta = () => {
    const [dataConta, setdataConta] = useState("");
    const [campnome, setcampnome] = useState("");
    const [campemail, setcampemail] = useState("");
    const [camptipo, setcamptipo] = useState("");


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
    <div className="form-container">
        
        <form>
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
          <button type="submit" className="btn" onClick={() => SalvarConta()}>Associar</button>
           
          </div>
        </form>
    </div>
)

function SalvarConta(){
    e.preventDefault();
    const baseUrl = urlAPI + "conta/criar"
    const datapost = {
        nome : campnome,
        email : campemail,
        tipoconta : 1
    }
    axios.post(baseUrl,datapost)
    .then(response=>{
    if (response.data.success===true) {
        alert(response.data.message)
    }
    else {
        alert(response.data.message)
    }
    }).catch(error=>{
        alert("Error 34 "+error)
    })
    }

}
export default CriarConta;