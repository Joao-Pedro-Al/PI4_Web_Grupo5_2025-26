import { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import url from "./url_global";

import axios from "axios";
const urlAPI = url + "utilizadorperfil/list";

import '../perfis.css';

import CartaoPerfil from "./Cartao_Perfil";

const Perfis = () => {
    const [dataPerfis, setdataPerfis] = useState([]);
    
    const iniciado = useRef(0);

    // Carregar Perfis
    useEffect(() => {
        CarregarPerfis();
    }, [])

    useEffect(() => {
        if (dataPerfis.length > 0){
            setTimeout(() => {

            const dropdownItems = document.querySelectorAll('.dropdown-item');
            const dropdownButton = document.getElementById('dropdownButton');

            const telInput = document.getElementById('telefone');

            const perfisItems = document.querySelectorAll('.div--cartao--perfil');

            var Aberto = 0;
            var TipoSelect = "Todos";

            if(iniciado.current == 0){Start(); iniciado.current = 1;}

            function Start()
            {
                MostrarTodos();
            }

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
        }, 100);

        }
    }, [dataPerfis])

    function CarregarPerfis() {
        axios.get(urlAPI)
        .then(res => {
        if(res.data.success){
        const data = res.data.data;
        setdataPerfis(data);
        }else{
        alert("Error Web Service!");
        }
        })
        .catch(error => {
        alert(error)
        });
    }
    return (
        <div className="container-fluid">

            {/* <!-- //// Filtros //// --> */}
            <div className="row align-items-start mb-5">
            
            {/* <!-- Tipo de Conta --> */}
            <div className="dropdown div--dropdown px-0 col-sm-5 col-xl-4 mt-auto">
                <button id="dropdownButton" className="btn dropdown-toggle div__button--dropdown text-start text-white shadow-none opacity-100 col-12" type="button" data-bs-toggle="dropdown" data-bs-auto-close="inside">
                Todos{/* <!-- <span className="material-symbols-outlined ms-auto">keyboard_arrow_down</span> --> */}
                </button>
                <ul className="dropdown-menu shadow py-0 col-12">
                <li><p className="dropdown-item ul__li--dropdown">Paciente</p></li>
                <li><p className="dropdown-item ul__li--dropdown">Doutor</p></li>
                <li><p className="dropdown-item ul__li--dropdown active">Todos</p></li>
                </ul>
            </div>

            {/* <!-- Telemovel --> */}
            <div className="px-0 col-sm-5 offset-sm-1 col-xl-4 offset-xl-3">
                <label htmlFor="telefone" className="form-label div__input--label">Telefone</label>
                <input type="tel" placeholder="987123654" className="form-control div__input--textbox shadow-none" id="telefone" pattern="[0-9]{3}[0-9]{3}[0-9]{3}" />
            </div>

            </div>

            {/* <!-- //// Perfis //// --> */}
            <div className="row align-items-start mb-4">

                {/* Listar */}
                <LoadPerfisData/>

            </div>

            {/* <!-- //// Criar Novo Perfil //// --> */}
            <div className="row align-items-start">

            <button type="button" className="btn text-white col-sm-5 offset-sm-6 col-lg-2 offset-lg-9">Criar Perfil</button>

            </div>

        </div>
    );

    function LoadPerfisData() {
        return dataPerfis.map((data, index) => {
            return (
                <CartaoPerfil key={index} nome={data.nome} num={data.contactoprincipal} email={data.gmail} idclasse={data.classe} idperf={data.idutilizadorprefil} />
            );
        });
    }
}
export default Perfis;