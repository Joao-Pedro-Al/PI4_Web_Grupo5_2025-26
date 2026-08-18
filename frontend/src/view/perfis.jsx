// src/view/perfis.jsx - VERSÃO COMPLETA REFACTORED
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import url from "./url_global";
import axios from "axios";
import '../perfis.css';
import CartaoPerfil from "./Cartao_Perfil";

const urlAPI = url + "utilizadorperfil/list";

const Perfis = () => {
    const [dataPerfis, setDataPerfis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    // Estados de Filtro em React puro
    const [tipoFiltro, setTipoFiltro] = useState("Todos"); // "Todos", "Paciente", "Doutor"
    const [termoPesquisa, setTermoPesquisa] = useState("");

    // Carregar Perfis da API
    useEffect(() => {
        carregarPerfis();
    }, []);

    const carregarPerfis = async () => {
        try {
            setLoading(true);
            const res = await axios.get(urlAPI);
            if (res.data && res.data.success) {
                setDataPerfis(res.data.data || []);
            } else {
                setErro("Erro ao obter lista de perfis do servidor.");
            }
        } catch (error) {
            console.error("Erro ao carregar perfis:", error);
            setErro("Erro de ligação ao servidor.");
        } finally {
            setLoading(false);
        }
    };

    // Lógica de Filtragem dos Perfis
    const perfisFiltrados = dataPerfis.filter((p) => {
        // Verificar se é médico ou paciente
        const eMedico = p.classe === 2 || 
                        p.idclasse === 2 || 
                        (p.profissao && (p.profissao.toLowerCase().includes('médic') || p.profissao.toLowerCase().includes('doutor'))) ||
                        (p.nome && (p.nome.toLowerCase().includes('dr') || p.nome.toLowerCase().includes('médic')));
        const ePaciente = !eMedico;

        // 1. Filtrar por Tipo de Conta
        if (tipoFiltro === "Paciente" && !ePaciente) return false;
        if (tipoFiltro === "Doutor" && !eMedico) return false;

        // 2. Pesquisa por Telefone, Nome ou Email
        if (termoPesquisa.trim() !== "") {
            const query = termoPesquisa.trim().toLowerCase();
            const tel = (p.contactoprincipal || "").toString().toLowerCase();
            const nome = (p.nome || "").toLowerCase();
            const email = (p.gmail || "").toLowerCase();
            const nif = (p.nif || "").toString().toLowerCase();

            return tel.includes(query) || nome.includes(query) || email.includes(query) || nif.includes(query);
        }

        return true;
    });

    return (
        <div className="container-fluid py-3" style={{ fontFamily: 'Poppins, sans-serif' }}>

            {/* <!-- //// Filtros //// --> */}
            <div className="row align-items-end mb-4 gy-3">
                
                {/* Tipo de Conta */}
                <div className="col-md-4 col-lg-3">
                    <label className="form-label div__input--label fw-bold">Filtrar por Tipo de Conta</label>
                    <div className="dropdown div--dropdown px-0 w-100">
                        <button 
                            id="dropdownButton" 
                            className="btn dropdown-toggle div__button--dropdown text-start text-white shadow-none opacity-100 w-100" 
                            type="button" 
                            data-bs-toggle="dropdown"
                        >
                            {tipoFiltro}
                        </button>
                        <ul className="dropdown-menu shadow py-0 w-100">
                            <li>
                                <button 
                                    type="button" 
                                    className={`dropdown-item ul__li--dropdown ${tipoFiltro === "Todos" ? "active" : ""}`}
                                    onClick={() => setTipoFiltro("Todos")}
                                >
                                    Todos
                                </button>
                            </li>
                            <li>
                                <button 
                                    type="button" 
                                    className={`dropdown-item ul__li--dropdown ${tipoFiltro === "Paciente" ? "active" : ""}`}
                                    onClick={() => setTipoFiltro("Paciente")}
                                >
                                    Paciente
                                </button>
                            </li>
                            <li>
                                <button 
                                    type="button" 
                                    className={`dropdown-item ul__li--dropdown ${tipoFiltro === "Doutor" ? "active" : ""}`}
                                    onClick={() => setTipoFiltro("Doutor")}
                                >
                                    Doutor
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Pesquisa por Telefone / Nome */}
                <div className="col-md-8 col-lg-5 ms-auto">
                    <label htmlFor="telefone" className="form-label div__input--label fw-bold">Pesquisar Perfil</label>
                    <div className="input-group">
                        <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                        <input 
                            type="text" 
                            placeholder="Pesquisar por telefone, nome ou email..." 
                            className="form-control div__input--textbox shadow-none" 
                            id="telefone" 
                            value={termoPesquisa}
                            onChange={(e) => setTermoPesquisa(e.target.value)}
                        />
                        {termoPesquisa && (
                            <button 
                                className="btn btn-outline-secondary" 
                                type="button"
                                onClick={() => setTermoPesquisa("")}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* Carregando ou Erro */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">A carregar perfis...</span>
                    </div>
                    <p className="mt-2 text-muted">A carregar perfis...</p>
                </div>
            )}

            {erro && (
                <div className="alert alert-danger my-3">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {erro}
                </div>
            )}

            {/* <!-- //// Perfis //// --> */}
            {!loading && !erro && (
                <>
                    {perfisFiltrados.length === 0 ? (
                        <div className="alert alert-info text-center py-4 my-3">
                            <i className="bi bi-info-circle me-2"></i> Nenhum perfil encontrado para os filtros selecionados.
                        </div>
                    ) : (
                        <div className="perfis-grid mb-4">
                            {perfisFiltrados.map((data, index) => {
                                const eMedico = data.classe === 2 || 
                                                data.idclasse === 2 || 
                                                (data.profissao && (data.profissao.toLowerCase().includes('médic') || data.profissao.toLowerCase().includes('doutor'))) ||
                                                (data.nome && (data.nome.toLowerCase().includes('dr') || data.nome.toLowerCase().includes('médic')));
                                const idclasseCalc = eMedico ? 2 : 1;

                                return (
                                    <CartaoPerfil
                                        key={data.idutilizadorprefil || index}
                                        nome={data.nome}
                                        num={data.contactoprincipal}
                                        email={data.gmail}
                                        idclasse={idclasseCalc}
                                        idperf={data.idutilizadorprefil}
                                    />
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* <!-- //// Criar Novo Perfil //// --> */}
            <div className="row align-items-start mt-3">
                <Link to="/backoffice/criarperfil" className="text-decoration-none col-sm-5 offset-sm-6 col-lg-2 offset-lg-9">
                    <button
                        type="button"
                        className="btn btn-criar-perfil w-100">
                        <i className="bi bi-person-plus-fill me-1"></i> Criar Perfil
                    </button>
                </Link>
            </div>

        </div>
    );
};

export default Perfis;