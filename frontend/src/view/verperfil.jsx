import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import url from "./url_global";
import axios from "axios";
import '../verperfil.css';

const mostrar = (valor) => {
    if (valor === null || valor === undefined || valor === "" || valor === false) {
        return <span className="valor-vazio">Não Indicado</span>;
    }
    if (valor === true) return "Sim";
    return valor;
};

const VerPerfil = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [perfil, setPerfil] = useState(null);
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        if (!id) {
            setErro("O ID do perfil não veio na URL.");
            setLoading(false);
            return;
        }

        const carregarDados = async () => {
            try {
                setLoading(true);
                // 1. Carregar Perfil
                const resPerfil = await axios.get(`${url}utilizadorperfil/list/${id}`);
                if (resPerfil.data && resPerfil.data.success) {
                    let data = resPerfil.data.data;
                    if (Array.isArray(data)) data = data[0];
                    if (!data) {
                        setErro(`Perfil com o ID ${id} não encontrado.`);
                    } else {
                        setPerfil(data);
                    }
                } else {
                    setErro("Não foi possível obter dados do perfil.");
                }

                // 2. Carregar Histórico de Consultas do Paciente
                const resConsultas = await axios.get(`${url}api/consultas/list/${id}`);
                if (resConsultas.data && resConsultas.data.success) {
                    setConsultas(resConsultas.data.data || []);
                }
            } catch (error) {
                console.error("[VerPerfil] Erro ao carregar dados:", error);
                setErro("Erro de ligação ao servidor.");
            } finally {
                setLoading(false);
            }
        };

        carregarDados();
    }, [id]);

    if (loading) {
        return (
            <div className="container-fluid py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">A carregar perfil...</span>
                </div>
                <p className="mt-2 text-muted">A carregar dados do perfil...</p>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="container-fluid py-5">
                <div className="alert alert-danger">
                    <strong>Erro ao carregar perfil:</strong>
                    <p className="mb-0 mt-2" style={{ whiteSpace: "pre-wrap" }}>{erro}</p>
                </div>
                <Link to="/backoffice/perfis" className="btn btn-secondary">
                    <i className="bi bi-arrow-left me-1"></i> Voltar aos Perfis
                </Link>
            </div>
        );
    }

    if (!perfil) {
        return (
            <div className="container-fluid py-5">
                <div className="alert alert-warning">Não há dados de perfil para mostrar.</div>
            </div>
        );
    }

    const anestesia = perfil.experienciaanastesia ? "Sim" : "Não";
    const gravida = perfil.gravida ? "Sim" : "Não";
    const dorSensibilidade = perfil.historicodor ? "Sim" : "Não";

    let ficheirosAnexados = [];
    try {
        if (perfil.ficheirosanexos) {
            ficheirosAnexados = JSON.parse(perfil.ficheirosanexos);
        }
    } catch (e) {
        console.error("[VerPerfil] Não foi possível ler ficheirosanexos:", e);
    }

    return (
        <div className="container-fluid py-3" style={{ fontFamily: 'Poppins, sans-serif' }}>

            <Link to="/backoffice/perfis" className="voltar-link mb-3 d-inline-block">
                <i className="bi bi-arrow-left me-1"></i> Voltar aos perfis
            </Link>

            {/* CARTÃO 1: IDENTIFICAÇÃO PESSOAL */}
            <div className="row align-items-start mb-4">
                <div className="card div--cartao--perfil d-block col-lg-8 shadow-sm">
                    <div className="card-body py-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="card-title fw-bold mb-0" style={{ color: '#A99C5E' }}>
                                <i className="bi bi-person-circle me-2"></i>{perfil.nome}
                            </h4>
                            <span className="badge bg-secondary">
                                {perfil.classeData?.designacao || (perfil.classe === 2 ? 'Médico' : 'Paciente')}
                            </span>
                        </div>
                        <div className="row g-2 text-secondary">
                            <div className="col-md-6"><b>Telefone Principal: </b>{mostrar(perfil.contactoprincipal)}</div>
                            <div className="col-md-6"><b>Telefone Secundário: </b>{mostrar(perfil.contactosecundario)}</div>
                            <div className="col-md-6"><b>Email: </b>{mostrar(perfil.gmail)}</div>
                            <div className="col-md-6"><b>Profissão: </b>{mostrar(perfil.profissao)}</div>
                            <div className="col-md-6"><b>Data de Nascimento: </b>{mostrar(perfil.datanascimento)}</div>
                            <div className="col-md-6"><b>NIF / SNS: </b>{mostrar(perfil.nif)}</div>
                            <div className="col-md-6"><b>Nº Utente Saúde: </b>{mostrar(perfil.numeroutente)}</div>
                            <div className="col-md-6"><b>Subsistema Saúde: </b>{mostrar(perfil.subsistemassaude)}</div>
                            <div className="col-md-6"><b>Sexo / Género: </b>{mostrar(perfil.generoData?.designacao || perfil.genero)}</div>
                            <div className="col-md-6"><b>Estado Civil: </b>{mostrar(perfil.estadocivilData?.designacao || perfil.estadocivil)}</div>
                            <div className="col-md-6"><b>Grávida: </b>{gravida}</div>
                            <div className="col-md-12"><b>Endereço: </b>{mostrar(perfil.endereco)}</div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 offset-lg-1 mt-3 mt-lg-0">
                    <div className="d-flex flex-column gap-2">
                        <button type="button" className="btn btn-alterar shadow-none w-100">
                            <i className="bi bi-pencil-square me-1"></i> Alterar Perfil
                        </button>
                        <button type="button" className="btn btn-apagar shadow-none w-100">
                            <i className="bi bi-trash me-1"></i> Apagar Perfil
                        </button>
                    </div>
                </div>
            </div>

            {/* CARTÃO 2: HISTÓRICO MÉDICO GERAL & INTERNAÇÕES */}
            <div className="row align-items-start mb-4">
                <div className="card div--cartao--perfil d-block col-lg-9 shadow-sm">
                    <div className="secao-header">
                        <i className="bi bi-heart-pulse-fill me-2"></i>
                        <h5 className="mb-0">Histórico Médico Geral & Internações</h5>
                    </div>
                    <div className="card-body py-4 text-secondary">
                        <p className="card-text mb-2">
                            <b><i className="bi bi-hospital me-1"></i>Internações ou Tratamentos Médicos Importantes: </b>
                            {mostrar(perfil.condicaosaude)}
                        </p>
                        <p className="card-text mb-2">
                            <b><i className="bi bi-scissors me-1"></i>Histórico Cirúrgico Relevante / Cirurgias Anteriores: </b>
                            {mostrar(perfil.historicotratamentosdentariospassados)}
                        </p>
                        <p className="card-text mb-2">
                            <b><i className="bi bi-exclamation-octagon me-1"></i>Alergias Conocidas: </b>
                            {mostrar(perfil.alergias)}
                        </p>
                        <p className="card-text mb-0">
                            <b><i className="bi bi-capsule me-1"></i>Medicamentos em Uso Habitual: </b>
                            {mostrar(perfil.medicamentos)}
                        </p>
                    </div>
                </div>
            </div>

            {/* CARTÃO 3: HISTÓRICO DENTÁRIO, CONDICÕES E HÁBITOS */}
            <div className="row align-items-start mb-4">
                <div className="card div--cartao--perfil d-block col-lg-9 shadow-sm">
                    <div className="secao-header">
                        <i className="bi bi-emoji-smile-fill me-2"></i>
                        <h5 className="mb-0">Histórico Dentário, Condições & Hábitos</h5>
                    </div>
                    <div className="card-body py-4 text-secondary">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <b>Condições Dentárias Pré-existentes: </b>
                                {mostrar(perfil.condicoesdentarias)}
                            </div>
                            <div className="col-md-6">
                                <b>Motivo da Consulta Inicial: </b>
                                {mostrar(perfil.motivoconsultainicial)}
                            </div>
                            <div className="col-md-6">
                                <b>Hábitos Alimentares & Substâncias (Açúcar / Ácidos): </b>
                                {mostrar(perfil.consumosubstancia)}
                            </div>
                            <div className="col-md-6">
                                <b>Hábitos de Higiene Oral: </b>
                                {mostrar(perfil.habitoigieneoral)}
                            </div>
                            <div className="col-md-6">
                                <b>Desportos Praticados: </b>
                                {mostrar(perfil.atividadesdesportivas)}
                            </div>
                            <div className="col-md-6">
                                <b>Bruxismo: </b>
                                {mostrar(perfil.bruxismo)}
                            </div>
                            <div className="col-md-6">
                                <b>Experiência com Anestesia Local: </b>
                                {anestesia}
                            </div>
                            <div className="col-md-6">
                                <b>Histórico de Dor ou Sensibilidade: </b>
                                {dorSensibilidade}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARTÃO 4: OBSERVAÇÕES ADICIONAIS & EXAMES ANEXADOS */}
            <div className="row align-items-start mb-4">
                <div className="card div--cartao--perfil d-block col-lg-9 shadow-sm">
                    <div className="secao-header">
                        <i className="bi bi-paperclip me-2"></i>
                        <h5 className="mb-0">Observações Adicionais & Exames Clínicos</h5>
                    </div>
                    <div className="card-body py-4 text-secondary">
                        <p className="card-text mb-2">
                            <b>Observações Adicionais Relevantes: </b>
                            {mostrar(perfil.infoadicional)}
                        </p>
                        <p className="card-text mb-3">
                            <b>Resultados de Tratamentos Anteriores: </b>
                            {mostrar(perfil.resultadosanteriores)}
                        </p>
                        <div>
                            <b className="d-block mb-2">Ficheiros / Exames Anexados:</b>
                            {ficheirosAnexados.length === 0 ? (
                                <span className="valor-vazio">Nenhum ficheiro anexado.</span>
                            ) : (
                                <ul className="lista-anexos ps-0 mb-0">
                                    {ficheirosAnexados.map((nomeFicheiro, i) => (
                                        <li key={i} className="mb-1">
                                            <a href={`${url}uploads/${nomeFicheiro}`} download target="_blank" rel="noreferrer" className="text-decoration-none">
                                                <i className="bi bi-file-earmark-arrow-down text-primary me-1"></i> {nomeFicheiro}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CARTÃO 5: HISTÓRICO DE CONSULTAS REALIZADAS NA CLÍNICA */}
            <div className="row align-items-start mb-4">
                <div className="card div--cartao--perfil d-block col-lg-9 shadow-sm">
                    <div className="secao-header">
                        <i className="bi bi-journal-medical me-2"></i>
                        <h5 className="mb-0">Histórico de Consultas Realizadas na Clínica</h5>
                    </div>
                    <div className="card-body py-4">
                        {consultas.length === 0 ? (
                            <p className="text-muted italic mb-0">Ainda não existem registos de consultas agendadas ou realizadas para este paciente.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Data</th>
                                            <th>Horário</th>
                                            <th>Médico</th>
                                            <th>Tipo / Detalhes</th>
                                            <th>Urgência</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {consultas.map((c) => (
                                            <tr key={c.idconsulta}>
                                                <td>{c.data ? new Date(c.data).toLocaleDateString('pt-PT') : 'N/A'}</td>
                                                <td>{c.hora} {c.horaFim ? `— ${c.horaFim}` : ''}</td>
                                                <td>{c.medico || 'Médico Dentista'}</td>
                                                <td>{c.TipoMarcacaoData?.desling || c.detalhes || 'Consulta Dentária'}</td>
                                                <td>
                                                    <span className={`badge ${c.urgencia === 'Muito Urgente' ? 'bg-danger' : c.urgencia === 'Urgente' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                        {c.urgencia || 'Normal'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => navigate(`/backoffice/consulta/${c.idconsulta}`)}
                                                        className="btn btn-sm text-white"
                                                        style={{ backgroundColor: '#A99C5E' }}
                                                        title="Abrir Apontamentos e Prescrições"
                                                    >
                                                        <i className="bi bi-pencil-square me-1"></i> Apontamentos
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VerPerfil;