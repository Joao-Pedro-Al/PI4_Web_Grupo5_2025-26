import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import '../perfis.css';
// import '../perfis.js';

const Perfis = () => {
    useEffect(() => {
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        const dropdownButton = document.getElementById('dropdownButton');

        const telInput = document.getElementById('telefone');

        const perfisItems = document.querySelectorAll('.div--cartao--perfil');

        var Aberto = 0;
        var TipoSelect = "Todos";

        //Selecionar a opção clicada
        dropdownItems.forEach(item => {
            item.addEventListener('click', function () {
                //Por texto correspondente no Botão
                TipoSelect = this.textContent;
                dropdownButton.textContent = TipoSelect;
                //Desativar o último ativo
                dropdownItems.forEach(item => {
                    if (item.classList.contains("active")) {
                        item.classList.toggle("active");
                    }
                });
                //Ativar o item clicado
                item.classList.add("active");
                // Listar os Selecionados
                ListarSelecionado(TipoSelect);
                //Fechar Dropdown (expecificamente, adicionar o border radius no fundo)
                // AbrirDropdown();
            });
        });

        // Garantir que seja só números
        telInput.addEventListener("keydown", (event) => {
            const tecla = event.code;

            if(tecla != "Digit1" && tecla != "Digit2" && tecla != "Digit3" && tecla != "Digit4" && tecla != "Digit5" && tecla != "Digit6" && tecla != "Digit7" && tecla != "Digit8" && tecla != "Digit9" && tecla != "Digit0" && tecla != "Backspace" && tecla != "Enter")
            {
                console.log("A tecla " + tecla + " é inválida!");
                event.preventDefault();
            }
            else if(telInput.value.length > 8 && tecla != "Backspace" && tecla != "Enter")
            {
                console.log("Número Máximo Atingido");
                event.preventDefault();
            }
        });

        // Filtrar Número
        telInput.addEventListener("input", (event) => {
            var segundo = 0;
            const Tipo = TipoSelect.toLowerCase();
            const Num = telInput.value;

            console.log(Num);
            if(Num != "")
            {
                perfisItems.forEach(item => {
                    if (Tipo != "todos")
                    {
                        if (item.classList.contains(Tipo)) {
                            const text_tel = item.querySelector("p.card-text").textContent.trim();
                            // Esconder todos que não tenham
                            if (text_tel.includes("Telefone: " + Num))
                            {
                                if(item.classList.contains("d-none"))
                                {item.classList.toggle("d-none");}
                                if(segundo == 0)
                                {
                                    if(item.classList.contains("offset-xl-3") && item.classList.contains("offset-lg-1")){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-lg-1");}
                                    segundo = 1;
                                }
                                else if(segundo == 1)
                                {
                                    if(item.classList.contains("offset-xl-3") == false && item.classList.contains("offset-lg-1") == false){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-lg-1");}
                                    segundo = 0;
                                }
                            }
                            else
                            {
                                if(item.classList.contains("d-none") == false)
                                {item.classList.toggle("d-none");}
                            }
                        }
                    }
                    else
                    {
                        const text_tel = item.querySelector("p.card-text").textContent.trim();
                        // Esconder todos que não tenham
                        if (text_tel.includes("Telefone: " + Num))
                        {
                            if(item.classList.contains("d-none"))
                            {item.classList.toggle("d-none");}
                            if(segundo == 0)
                            {
                                if(item.classList.contains("offset-xl-3") && item.classList.contains("offset-lg-1")){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-lg-1");}
                                segundo = 1;
                            }
                            else if(segundo == 1)
                            {
                                if(item.classList.contains("offset-xl-3") == false && item.classList.contains("offset-lg-1") == false){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-lg-1");}
                                segundo = 0;
                            }
                        }
                        else
                        {
                            if(item.classList.contains("d-none") == false)
                            {item.classList.toggle("d-none");}
                        }
                    }
                });
            }
            else
            {
                MostrarTodos();
                //Garantir que segue os filtros
                ListarSelecionado(dropdownButton.textContent);
            }
        });



        function ListarSelecionado(tipo)
        {
            if(tipo == "Paciente")
            {
                Mostrar1Tipo("paciente");
            }
            else if(tipo == "Doutor")
            {
                Mostrar1Tipo("doutor");
            }
            else
            {
                MostrarTodos();
            }
        }

        // function AbrirDropdown()
        // {

        //     if(Aberto == 0)
        //     {
        //         dropdownButton.style.borderRadius = "10px 10px 0px 0px";
        //         Aberto = 1;
        //     }
        //     else if(Aberto == 1)
        //     {
        //         dropdownButton.style.borderRadius = "10px";
        //         Aberto = 0;
        //     }

        // }

        // ------------Mostrar e/ou Esconder-----------

        function Mostrar1(Item_Sel)
        {
            perfisItems.forEach(item => {
                if(Item == Item_Sel)
                {
                    if(item.classList.contains("d-none")){item.classList.toggle("d-none");}
                    if(item.classList.contains("offset-xl-3") && item.classList.contains("offset-lg-1")){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-lg-1");}
                }
                else
                {
                    if(item.classList.contains("d-none") == false)
                    {item.classList.add("d-none");}
                }
            });
        }

        function Mostrar1Tipo(Tipo)
        {
            var segundo = 0;
            const Num = telInput.value;

            perfisItems.forEach(item => {
                const text_tel = item.querySelector("p.card-text").textContent.trim();
                if (item.classList.contains(Tipo) && text_tel.includes("Telefone: " + Num)) {
                    if(item.classList.contains("d-none"))
                    {
                        item.classList.toggle("d-none");
                    }
                    if(segundo == 0)
                    {
                        if(item.classList.contains("offset-xl-3") && item.classList.contains("offset-lg-1")){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-lg-1");}
                        segundo = 1;
                    }
                    else if(segundo == 1)
                    {
                        if(item.classList.contains("offset-xl-3") == false && item.classList.contains("offset-lg-1") == false){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-lg-1");}
                        segundo = 0;
                    }
                }
                else
                {
                    if(item.classList.contains("d-none") == false)
                    {item.classList.add("d-none");}
                }
            });
        }

        function MostrarTodos()
        {
            var segundo = 0;
            const Num = telInput.value;

            perfisItems.forEach(item => {
                const text_tel = item.querySelector("p.card-text").textContent.trim();
                if (text_tel.includes("Telefone: " + Num))
                {
                    if(item.classList.contains("d-none"))
                    {
                        item.classList.toggle("d-none");
                    }
                    if(segundo == 0)
                    {
                        if(item.classList.contains("offset-xl-3") && item.classList.contains("offset-lg-1")){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-lg-1");}
                        segundo = 1;
                    }
                    else if(segundo == 1)
                    {
                        if(item.classList.contains("offset-xl-3") == false && item.classList.contains("offset-lg-1") == false){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-lg-1");}
                        segundo = 0;
                    }
                }
            });
        }
    }, [])
    return (
        <div className="container-fluid">

            {/* <!-- //// Filtros //// --> */}
            <div className="row align-items-start mb-5">
            
            {/* <!-- Tipo de Conta --> */}
            <div className="dropdown div--dropdown px-0 col-sm-5 col-xl-4 mt-auto">
                <button id="dropdownButton" className="btn dropdown-toggle div__button--dropdown text-start text-white shadow-none opacity-100 col-12" type="button" data-bs-toggle="dropdown" data-bs-auto-close="inside">
                Tipo de Conta{/* <!-- <span className="material-symbols-outlined ms-auto">keyboard_arrow_down</span> --> */}
                </button>
                <ul className="dropdown-menu shadow py-0 col-12">
                <li><a className="dropdown-item ul__li--dropdown">Paciente</a></li>
                <li><a className="dropdown-item ul__li--dropdown">Doutor</a></li>
                <li><a className="dropdown-item ul__li--dropdown">Todos</a></li>
                </ul>
            </div>

            {/* <!-- Telemovel --> */}
            <div className="px-0 col-sm-5 offset-sm-1 col-xl-4 offset-xl-3">
                <label for="telefone" className="form-label div__input--label">Telefone</label>
                <input type="tel" placeholder="987123654" className="form-control div__input--textbox shadow-none" id="telefone" pattern="[0-9]{3}[0-9]{3}[0-9]{3}" />
            </div>

            </div>

            {/* <!-- //// Perfis //// --> */}
            <div className="row align-items-start mb-4">

            {/* <!-- INÍCO: Cartão --> */}
            <div className="card div--cartao--perfil d-block col-sm-11 col-lg-5 col-xl-4 paciente">
                <div className="card-body py-4">
                <h5 className="card-title fw-bold mb-3">Ricardo Lopes</h5>
                <p className="card-text mb-2"><b>Telefone: </b>941642771</p>
                <p className="card-text"><b>Email: </b>ricardo_lopes@gmail.com</p>
                </div>
            </div>
            {/* <!-- FIM: Cartão --> */}

            {/* <!-- INÍCO: Cartão --> */}
            <div className="card div--cartao--perfil d-block col-sm-11 offset-lg-1 col-lg-5 offset-xl-3 col-xl-4 doutor">
                <div className="card-body py-4">
                <h5 className="card-title fw-bold mb-3">Sofia Rita</h5>
                <p className="card-text mb-2"><b>Telefone: </b>936913753</p>
                <p className="card-text"><b>Email: </b>sorita@gmail.com</p>
                </div>
            </div>
            {/* <!-- FIM: Cartão --> */}

            {/* <!-- INÍCO: Cartão --> */}
            <div className="card div--cartao--perfil d-block col-sm-11 col-lg-5 col-xl-4 paciente">
                <div className="card-body py-4">
                <h5 className="card-title fw-bold mb-3">Nome do Perfil</h5>
                <p className="card-text mb-2"><b>Telefone: </b>987654321</p>
                <p className="card-text"><b>Email: </b>perfil@gmail.com</p>
                </div>
            </div>
            {/* <!-- FIM: Cartão --> */}

            </div>

            {/* <!-- //// Criar Novo Perfil //// --> */}
            <div className="row align-items-start">

            <button type="button" className="btn text-white col-sm-5 offset-sm-6 col-lg-2 offset-lg-9">Criar Perfil</button>

            </div>

        </div>
    );
}
export default Perfis;