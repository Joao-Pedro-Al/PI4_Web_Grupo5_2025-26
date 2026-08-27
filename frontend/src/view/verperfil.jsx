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
    const [dependentes, setDependentes] = useState([]);
    const [listaTodosPerfis, setListaTodosPerfis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    // Modal de Edição de Perfil
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [editFormData, setEditFormData] = useState({
        nome: '',
        gmail: '',
        contactoprincipal: '',
        contactosecundario: '',
        nif: '',
        profissao: '',
        endereco: '',
        numeroutente: '',
        subsistemassaude: '',
        posidutilizador: ''
    });

    const carregarDados = async () => {
        try {
            setLoading(true);
            setErro(null);

            // 1. Carregar Perfil do Utilizador
            const resPerfil = await axios.get(`${url}utilizadorperfil/list/${id}`);
            if (resPerfil.data && resPerfil.data.success) {
                let data = resPerfil.data.data;
                if (Array.isArray(data)) data = data[0];
                if (!data) {
                    setErro(`Perfil com o ID ${id} não encontrado.`);
                } else {
                    setPerfil(data);
                    setEditFormData({
                        nome: data.nome || '',
                        gmail: data.gmail || '',
                        contactoprincipal: data.contactoprincipal || '',
                        contactosecundario: data.contactosecundario || '',
                        nif: data.nif || '',
                        profissao: data.profissao || '',
                        endereco: data.endereco || '',
                        numeroutente: data.numeroutente || '',
                        subsistemassaude: data.subsistemassaude || '',
                        posidutilizador: data.posidutilizador ? String(data.posidutilizador) : ''
                    });
                }
            } else {
                setErro("Não foi possível obter dados do perfil.");
            }

            // 2. Carregar Histórico de Consultas
            const resConsultas = await axios.get(`${url}api/consultas/list/${id}`);
            if (resConsultas.data && resConsultas.data.success) {
                setConsultas(resConsultas.data.data || []);
            }

            // 3. Carregar Dependentes (se este perfil for um encarregado de educação)
            try {
                const resDep = await axios.get(`${url}utilizadorperfil/dependentes/${id}`);
                if (resDep.data && resDep.data.success) {
                    setDependentes(resDep.data.data || []);
                }
            } catch (e) {
                console.log("Sem dependentes ou erro ao carregar:", e.message);
            }

            // 4. Carregar Todos os Perfis (para permitir associar Perfil Responsável no Modal)
            try {
                const resTodos = await axios.get(`${url}utilizadorperfil/list`);
                if (resTodos.data && resTodos.data.success) {
                    setListaTodosPerfis(resTodos.data.data || []);
                }
            } catch (e) {
                console.log("Erro ao carregar lista de perfis:", e.message);
            }

        } catch (error) {
            console.error("[VerPerfil] Erro ao carregar dados:", error);
            setErro("Erro de ligação ao servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) {
            setErro("O ID do perfil não veio na URL.");
            setLoading(false);
            return;
        }
        carregarDados();
    }, [id]);

    const handleSaveEdit = async () => {
        try {
            setSalvandoEdicao(true);
            let res;
            try {
                res = await axios.put(`${url}utilizadorperfil/update/${id}`, editFormData);
            } catch (putErr) {
                res = await axios.post(`${url}utilizadorperfil/update/${id}`, editFormData);
            }

            if (res.data && res.data.success) {
                alert("Perfil atualizado com sucesso!");
                setEditModalOpen(false);
                await carregarDados();
            } else {
                alert(res.data?.message || "Erro ao guardar alterações do perfil.");
            }
        } catch (err) {
            console.error("Erro ao atualizar perfil:", err);
            const msg = err.response?.data?.message || "Erro ao comunicar com o servidor para atualizar perfil.";
            alert(msg);
        } finally {
            setSalvandoEdicao(false);
        }
    };

    const handleDeletePerfil = async () => {
        if (!window.confirm(`Tem a certeza que deseja eliminar o perfil de "${perfil.nome}"? Esta ação não pode ser desfeita.`)) {
            return;
        }
        try {
            let res;
            try {
                res = await axios.delete(`${url}utilizadorperfil/delete/${id}`);
            } catch (delErr) {
                res = await axios.post(`${url}utilizadorperfil/delete/${id}`);
            }

            if (res.data && res.data.success) {
                alert("Perfil eliminado com sucesso!");
                navigate('/backoffice/perfis');
            } else {
                alert(res.data?.message || "Erro ao eliminar perfil.");
            }
        } catch (err) {
            console.error("Erro ao eliminar perfil:", err);
            const msg = err.response?.data?.message || "Erro ao comunicar com o servidor para eliminar perfil.";
            alert(msg);
        }
    };

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
        <div className="container-fluid py-3" style={{ fontFamily: 'Poppins, sans-serif', maxWidth: '1200px' }}>

            <Link to="/backoffice/perfis" className="voltar-link mb-3 d-inline-block">
                <i className="bi bi-arrow-left me-1"></i> Voltar aos perfis
            </Link>

            {/* ALERTA DE PERFIL RESPONSÁVEL (SE FOR CRIANÇA/DEPENDENTE) */}
            {perfil.posUtilizador && (
                <div className="alert alert-info border-0 shadow-sm mb-4 d-flex align-items-center justify-content-between p-3" style={{ backgroundColor: '#eef7fc' }}>
                    <div className="d-flex align-items-center">
                        <i className="bi bi-people-fill text-info fs-3 me-3"></i>
                        <div>
                            <strong className="text-dark d-block">Perfil Dependente / Encarregado de Educação:</strong>
                            <span className="text-secondary">
                                Este perfil está associado a <b>{perfil.posUtilizador.nome}</b> (Contacto: {perfil.posUtilizador.contactoprincipal || 'Não indicado'})
                            </span>
                        </div>
                    </div>
                    <Link to={`/backoffice/perfis/${perfil.posUtilizador.idutilizadorprefil}`} className="btn btn-sm btn-outline-info text-nowrap">
                        Ver Perfil Responsável <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                </div>
            )}

            {/* CARTÃO 1: IDENTIFICAÇÃO PESSOAL (LARGURA UNIFORME COM BOTÕES NO CABEÇALHO) */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card div--cartao--perfil shadow-sm border-0">
                        <div className="card-body py-4">
                            
                            {/* CABEÇALHO DO CARTÃO COM NOME E BOTÕES DE AÇÃO */}
                            <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-3 gap-2">
                                <div className="d-flex align-items-center gap-2">
                                    <h4 className="card-title fw-bold mb-0" style={{ color: '#A99C5E' }}>
                                        <i className="bi bi-person-circle me-2"></i>{perfil.nome}
                                    </h4>
                                    <span className="badge bg-secondary">
                                        {perfil.classeData?.designacao || (perfil.classe === 2 ? 'Médico' : 'Paciente')}
                                    </span>
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setEditModalOpen(true)}
                                        className="btn btn-sm text-white d-inline-flex align-items-center"
                                        style={{ backgroundColor: '#A99C5E', border: 'none', borderRadius: '8px', padding: '6px 14px' }}
                                    >
                                        <i className="bi bi-pencil-square me-1"></i> Alterar Perfil
                                    </button>
                                    
                                    <button 
                                        type="button" 
                                        onClick={handleDeletePerfil}
                                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                                        style={{ borderRadius: '8px', padding: '6px 14px' }}
                                    >
                                        <i className="bi bi-trash me-1"></i> Apagar Perfil
                                    </button>
                                </div>
                            </div>

                            <div className="row g-3 text-secondary">
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
                </div>
            </div>

            {/* CARTÃO DE DEPENDENTES REGISTADOS (SE EXISTIREM) */}
            {dependentes.length > 0 && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card div--cartao--perfil shadow-sm border-0">
                            <div className="secao-header">
                                <i className="bi bi-people-fill me-2"></i>
                                <h5 className="mb-0">Dependentes / Educandos Registados ({dependentes.length})</h5>
                            </div>
                            <div className="card-body py-3">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Nome do Dependente</th>
                                                <th>Email / Contacto</th>
                                                <th>NIF</th>
                                                <th>Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dependentes.map((dep) => (
                                                <tr key={dep.idutilizadorprefil}>
                                                    <td>
                                                        <strong>👶 {dep.nome}</strong>
                                                    </td>
                                                    <td>{dep.gmail || dep.contactoprincipal || 'Sem contacto direto'}</td>
                                                    <td>{dep.nif || 'Não indicado'}</td>
                                                    <td>
                                                        <Link to={`/backoffice/perfis/${dep.idutilizadorprefil}`} className="btn btn-sm btn-outline-primary">
                                                            <i className="bi bi-eye me-1"></i> Ver Perfil
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CARTÃO 2: HISTÓRICO MÉDICO GERAL & INTERNAÇÕES */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card div--cartao--perfil shadow-sm border-0">
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
                                <b><i className="bi bi-exclamation-octagon me-1"></i>Alergias Conhecidas: </b>
                                {mostrar(perfil.alergias)}
                            </p>
                            <p className="card-text mb-0">
                                <b><i className="bi bi-capsule me-1"></i>Medicamentos em Uso Habitual: </b>
                                {mostrar(perfil.medicamentos)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARTÃO 3: HISTÓRICO DENTÁRIO, CONDIÇÕES E HÁBITOS */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card div--cartao--perfil shadow-sm border-0">
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
            </div>

            {/* CARTÃO 4: OBSERVAÇÕES ADICIONAIS & EXAMES ANEXADOS */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card div--cartao--perfil shadow-sm border-0">
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
            </div>

            {/* CARTÃO 5: HISTÓRICO DE CONSULTAS REALIZADAS NA CLÍNICA */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card div--cartao--perfil shadow-sm border-0">
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

            {/* MODAL DE EDIÇÃO DE PERFIL */}
            {editModalOpen && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header text-white" style={{ backgroundColor: '#A99C5E' }}>
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-pencil-square me-2"></i>Editar Perfil de Utilizador
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setEditModalOpen(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Nome Completo:</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={editFormData.nome}
                                            onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Email / Gmail:</label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            value={editFormData.gmail}
                                            onChange={(e) => setEditFormData({ ...editFormData, gmail: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Contacto Principal:</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={editFormData.contactoprincipal}
                                            onChange={(e) => setEditFormData({ ...editFormData, contactoprincipal: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Contacto Secundário:</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={editFormData.contactosecundario}
                                            onChange={(e) => setEditFormData({ ...editFormData, contactosecundario: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">NIF / N° Utente:</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={editFormData.nif}
                                            onChange={(e) => setEditFormData({ ...editFormData, nif: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Profissão:</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={editFormData.profissao}
                                            onChange={(e) => setEditFormData({ ...editFormData, profissao: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label fw-bold">Endereço:</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={editFormData.endereco}
                                            onChange={(e) => setEditFormData({ ...editFormData, endereco: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label fw-bold text-primary">
                                            <i className="bi bi-people-fill me-1"></i> Perfil Responsável / Encarregado de Educação:
                                        </label>
                                        <select 
                                            className="form-select"
                                            value={editFormData.posidutilizador}
                                            onChange={(e) => setEditFormData({ ...editFormData, posidutilizador: e.target.value })}
                                        >
                                            <option value="">Nenhum (Perfil Autónomo / Adulto)</option>
                                            {listaTodosPerfis
                                                .filter(p => String(p.idutilizadorprefil) !== String(id))
                                                .map(p => (
                                                    <option key={p.idutilizadorprefil} value={p.idutilizadorprefil}>
                                                        {p.nome} ({p.contactoprincipal || p.gmail || `ID ${p.idutilizadorprefil}`})
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        <small className="text-muted">Se este perfil for uma criança ou dependente, selecione o perfil do pai, mãe ou encarregado de educação.</small>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancelar</button>
                                <button 
                                    type="button" 
                                    className="btn text-white" 
                                    style={{ backgroundColor: '#A99C5E' }}
                                    onClick={handleSaveEdit}
                                    disabled={salvandoEdicao}
                                >
                                    {salvandoEdicao ? 'A guardar...' : 'Guardar Alterações'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default VerPerfil;