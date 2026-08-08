import { useEffect, useState } from "react";
import { useParams, Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import url from "./url_global";

import axios from "axios";

import '../verperfil.css';

const mostrar = (valor) => {
    if (valor === null || valor === undefined || valor === "") {
        return <span className="valor-vazio">Não Indicado</span>;
    }
    return valor;
};

const VerPerfil = () => {
    const { id } = useParams();

    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        if (!id) {
            setErro(
                "O ID do perfil não veio na URL (useParams devolveu undefined). " +
                "Confirma se a rota em App.jsx está definida como '/backoffice/perfis/:id' " +
                "e se o link que clicaste aponta para um id válido."
            );
            setLoading(false);
            return;
        }

        const urlAPI = url + "utilizadorperfil/list/" + id;
        console.log("[VerPerfil] A pedir dados a:", urlAPI);

        axios.get(urlAPI)
            .then(res => {
                console.log("[VerPerfil] Resposta recebida:", res.data);

                if (res.data && res.data.success) {
                    let data = res.data.data;

                    // O backend pode devolver um array com 1 elemento OU um objeto único.
                    // Aceitamos os dois casos para não rebentar no .map().
                    if (Array.isArray(data)) {
                        data = data[0];
                    }

                    if (!data) {
                        setErro("O servidor respondeu com sucesso, mas não veio nenhum perfil com o id '" + id + "'.");
                    } else {
                        setPerfil(data);
                    }
                } else {
                    setErro(
                        "O servidor respondeu, mas 'success' não é true. Mensagem do servidor: " +
                        (res.data?.message || "(sem mensagem)")
                    );
                }
            })
            .catch(error => {
                console.error("[VerPerfil] Erro no pedido axios:", error);

                let msg = error.message || "erro desconhecido";
                if (error.code === "ERR_NETWORK") {
                    msg += " — o backend está mesmo a correr em " + url + " ? Confirma no terminal do backend.";
                } else if (error.response) {
                    msg += " — o servidor respondeu com status " + error.response.status;
                }
                setErro(msg);
            })
            .finally(() => setLoading(false));
    }, [id]);

    // ---------- ESTADOS VISÍVEIS NO ECRÃ (sem precisar de DevTools) ----------

    if (loading) {
        return (
            <div className="container-fluid py-5 text-center">
                <p>A carregar perfil...</p>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="container-fluid py-5">
                <div className="alert alert-danger">
                    <strong>Não foi possível carregar o perfil.</strong>
                    <p className="mb-0 mt-2" style={{ whiteSpace: "pre-wrap" }}>{erro}</p>
                </div>
            </div>
        );
    }

    if (!perfil) {
        return (
            <div className="container-fluid py-5">
                <div className="alert alert-warning">
                    Não há dados de perfil para mostrar.
                </div>
            </div>
        );
    }

    // ---------- DADOS CARREGADOS COM SUCESSO ----------

    const anestesia = (perfil.experienciaanastesia === true) ? "Sim" : "Não";
    const gravida = (perfil.gravida === true) ? "Sim" : "Não";

    // Nomes dos ficheiros anexados vêm como array JSON em texto (ver utilizadorperfilController.js)
    let ficheirosAnexados = [];
    try {
        if (perfil.ficheirosanexos) {
            ficheirosAnexados = JSON.parse(perfil.ficheirosanexos);
        }
    } catch (e) {
        console.error("[VerPerfil] Não foi possível ler ficheirosanexos:", e);
    }

    return (
        <div className="container-fluid">

            <Link to="/backoffice/perfis" className="voltar-link">
                <i className="bi bi-arrow-left"></i> Voltar aos perfis
            </Link>

            <div className="row align-items-start mb-5">

                <div className="card div--cartao--perfil d-block mb-sm-3 col-sm-11 mb-lg-0 col-lg-8">
                    <div className="card-body py-4">
                        <h5 className="card-title fw-bold mb-3">{perfil.nome}</h5>
                        <p className="card-text mb-1"><b>Telefone: </b>{mostrar(perfil.contactoprincipal)}</p>
                        <p className="card-text mb-1"><b>Email: </b>{mostrar(perfil.gmail)}</p>
                        <p className="card-text mb-1"><b>Data de Nascimento: </b>{mostrar(perfil.datanascimento)}</p>
                        <p className="card-text mb-1"><b>NIF/SNS: </b>{mostrar(perfil.nif)}</p>
                        <p className="card-text mb-1"><b>Sexo: </b>{mostrar(perfil.generoData?.designacao || perfil.genero)}</p>
                        <p className="card-text mb-1"><b>Estado Civil: </b>{mostrar(perfil.estadocivilData?.designacao || perfil.estadocivil)}</p>
                        <p className="card-text mb-1"><b>Gravida: </b>{gravida}</p>
                    </div>
                </div>

                <div className="container-fluid mx-sm-0 col-sm-11 mx-lg-auto offset-lg-1 col-lg-2">
                    <div className="row">
                        <button type="button" className="btn btn-alterar shadow-none mb-lg-3 col-sm-5 col-lg-12">
                            <i className="bi bi-pencil-square me-1"></i> Alterar Perfil
                        </button>
                        <button type="button" className="btn btn-apagar shadow-none offset-sm-2 col-sm-5 offset-lg-0 col-lg-12">
                            <i className="bi bi-trash me-1"></i> Apagar Perfil
                        </button>
                    </div>
                </div>

            </div>

            <div className="row align-items-start mb-5">
                <div className="card div--cartao--perfil d-block col-9">
                    <div className="secao-header">
                        <i className="bi bi-heart-pulse-fill"></i>
                        <h5>Histórico Médico Geral</h5>
                    </div>
                    <div className="card-body py-4">
                        <p className="card-text mb-1"><b>Cirurgias Anteriores: </b>{mostrar(perfil.historicotratamentosdentariospassados)}</p>
                        <p className="card-text mb-1"><b>Alergias: </b>{mostrar(perfil.alergias)}</p>
                        <p className="card-text"><b>Raios-X: </b>N/A</p>
                    </div>
                </div>
            </div>

            <div className="row align-items-start mb-3">
                <div className="card div--cartao--perfil d-block col-9">
                    <div className="secao-header">
                        <i className="bi bi-emoji-smile-fill"></i>
                        <h5>Histórico Dentário</h5>
                    </div>
                    <div className="card-body py-4">
                        <p className="card-text mb-1"><b>Última Consulta Dentária: </b>10/01/2024</p>
                        <p className="card-text mb-1"><b>Motivo da Consulta Inicial: </b>{mostrar(perfil.motivoconsultainicial)}</p>
                        <p className="card-text mb-1"><b>Experiência com anestesia: </b>{anestesia}</p>
                        <p className="card-text mb-1"><b>Condições atuais: </b>{mostrar(perfil.condicaosaude)}</p>
                        <div className="card-text">
                            <b>Exames anexados: </b>
                            {ficheirosAnexados.length === 0 ? (
                                <span className="valor-vazio">Nenhum ficheiro anexado</span>
                            ) : (
                                <ul className="lista-anexos">
                                    {ficheirosAnexados.map((nomeFicheiro, i) => (
                                        <li key={i}>
                                            <a href={`${url}uploads/${nomeFicheiro}`} download target="_blank" rel="noreferrer">
                                                <i className="bi bi-file-earmark-arrow-down"></i> {nomeFicheiro}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VerPerfil;