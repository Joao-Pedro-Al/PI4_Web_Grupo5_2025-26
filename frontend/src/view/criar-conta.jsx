import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import urlAPI from './url_global';
import '../criar-conta.css';

const CriarConta = () => {
    const navigate = useNavigate();

    const [campnome, setcampnome] = useState("");
    const [camppassword, setcamppassword] = useState("");
    const [campemail, setcampemail] = useState("");
    const [camptipo, setcamptipo] = useState("3"); // 3 = Paciente, 2 = Médico, 1 = Admin, 4 = Rececionista
    const [campprefil, setcampprefil] = useState(""); // idutilizadorprefil

    const [perfis, setPerfis] = useState([]);
    const [carregandoPerfis, setCarregandoPerfis] = useState(true);
    const [termoPesquisa, setTermoPesquisa] = useState("");
    const [dropdownAberto, setDropdownAberto] = useState(false);
    const [perfilSelecionadoTexto, setPerfilSelecionadoTexto] = useState("");

    const [aGuardar, setAGuardar] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

    const searchRef = useRef(null);

    // Carregar perfis existentes na base de dados
    useEffect(() => {
        const carregarPerfisBD = async () => {
            try {
                const response = await axios.get(urlAPI + "utilizadorperfil/list");
                if (response.data && response.data.success) {
                    setPerfis(response.data.data || []);
                }
            } catch (error) {
                console.error("Erro ao carregar perfis da BD:", error);
            } finally {
                setCarregandoPerfis(false);
            }
        };

        carregarPerfisBD();
    }, []);

    // Fechar dropdown ao clicar fora do componente
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setDropdownAberto(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Filtrar perfis com base no termo de pesquisa
    const perfisFiltrados = perfis.filter(p => {
        if (!termoPesquisa.trim()) return true;
        const termo = termoPesquisa.toLowerCase();
        const nomeMatch = p.nome && p.nome.toLowerCase().includes(termo);
        const nifMatch = p.nif && p.nif.toString().includes(termo);
        const idMatch = p.idutilizadorprefil && p.idutilizadorprefil.toString().includes(termo);
        return nomeMatch || nifMatch || idMatch;
    });

    const selecionarPerfil = (perfil) => {
        if (perfil) {
            setcampprefil(perfil.idutilizadorprefil);
            const texto = `ID ${perfil.idutilizadorprefil}: ${perfil.nome}${perfil.nif ? ` (NIF: ${perfil.nif})` : ''}`;
            setPerfilSelecionadoTexto(texto);
            setTermoPesquisa(perfil.nome);
        } else {
            setcampprefil("");
            setPerfilSelecionadoTexto("");
            setTermoPesquisa("");
        }
        setDropdownAberto(false);
    };

    const SalvarConta = async (e) => {
        e.preventDefault();
        setMensagem({ tipo: '', texto: '' });

        if (!campnome.trim() || !camppassword.trim()) {
            setMensagem({ tipo: 'erro', texto: 'Por favor preencha o Username e a Palavra-passe.' });
            return;
        }

        setAGuardar(true);

        try {
            const baseUrl = urlAPI + "api/conta/criar";
            const datapost = {
                nome: campnome.trim(),
                password: camppassword.trim(),
                tipoconta: Number(camptipo),
                idprefil: campprefil ? Number(campprefil) : null
            };

            console.log("A enviar pedido para criar conta:", datapost);
            const response = await axios.post(baseUrl, datapost);

            if (response.data && response.data.success) {
                setMensagem({ 
                    tipo: 'sucesso', 
                    texto: 'Conta criada com sucesso e associada ao perfil!' 
                });
                // Limpar campos
                setcampnome("");
                setcamppassword("");
                setcampemail("");
                setcampprefil("");
                setTermoPesquisa("");
                setPerfilSelecionadoTexto("");
            } else {
                setMensagem({ 
                    tipo: 'erro', 
                    texto: response.data.message || 'Erro ao criar conta.' 
                });
            }
        } catch (error) {
            console.error("Erro ao guardar conta:", error);
            const msg = error.response?.data?.message || 'Erro ao comunicar com o servidor.';
            setMensagem({ tipo: 'erro', texto: msg });
        } finally {
            setAGuardar(false);
        }
    };

    return (
        <div className="criar-conta-page">
            <div className="form-container">
                <div className="form-container__header">
                    <div className="form-container__eyebrow">CliniMolelos</div>
                    <h2 className="form-container__title">Criar Conta de Utilizador</h2>
                    <p className="form-container__subtitle">Ligue credenciais de login a um perfil existente na base de dados</p>
                </div>

                {mensagem.texto && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        backgroundColor: mensagem.tipo === 'sucesso' ? '#e8f5e9' : '#ffebee',
                        color: mensagem.tipo === 'sucesso' ? '#2e7d32' : '#c62828',
                        border: `1px solid ${mensagem.tipo === 'sucesso' ? '#a5d6a7' : '#ef9a9a'}`
                    }}>
                        {mensagem.texto}
                    </div>
                )}

                <form onSubmit={SalvarConta}>
                    <div className="left-column">
                        <label htmlFor="username">Username (Nome de Utilizador)</label>
                        <input 
                            type="text" 
                            id="username" 
                            placeholder="Ex: joao.silva" 
                            value={campnome} 
                            onChange={e => setcampnome(e.target.value)}
                            required
                        />

                        <label htmlFor="password">Palavra-passe</label>
                        <input 
                            type="password" 
                            id="password" 
                            placeholder="Insira a palavra-passe" 
                            value={camppassword} 
                            onChange={e => setcamppassword(e.target.value)}
                            required
                        />

                        <label htmlFor="email">Email (opcional)</label>
                        <input 
                            type="email" 
                            id="email" 
                            placeholder="email@exemplo.com" 
                            value={campemail} 
                            onChange={e => setcampemail(e.target.value)}
                        />
                    </div>

                    <div className="right-column">
                        <label htmlFor="account_type_select">Tipo de Conta</label>
                        <select 
                            id="account_type_select"
                            className="form-select shadow-none" 
                            value={camptipo}
                            onChange={e => setcamptipo(e.target.value)}
                            style={{
                                borderRadius: '12px',
                                border: '1.5px solid var(--gold-100)',
                                backgroundColor: 'var(--gold-50)',
                                padding: '12px 15px',
                                fontSize: '14px',
                                color: 'var(--ink-900)'
                            }}
                        >
                            <option value="3">Paciente</option>
                            <option value="2">Médico</option>
                        </select>

                        <label style={{ marginTop: '14px' }}>
                            Pesquisar e Associar Perfil
                        </label>
                        <div ref={searchRef} style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Digite para pesquisar por Nome, NIF ou ID..."
                                value={termoPesquisa}
                                onChange={e => {
                                    setTermoPesquisa(e.target.value);
                                    setDropdownAberto(true);
                                    if (!e.target.value.trim()) {
                                        setcampprefil("");
                                        setPerfilSelecionadoTexto("");
                                    }
                                }}
                                onFocus={() => setDropdownAberto(true)}
                                disabled={carregandoPerfis}
                                style={{
                                    borderRadius: '12px',
                                    border: '1.5px solid var(--gold-100)',
                                    backgroundColor: 'var(--gold-50)',
                                    padding: '12px 15px',
                                    fontSize: '14px',
                                    color: 'var(--ink-900)',
                                    width: '100%'
                                }}
                            />

                            {/* Dropdown de Resultados de Pesquisa */}
                            {dropdownAberto && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    maxHeight: '220px',
                                    overflowY: 'auto',
                                    backgroundColor: '#ffffff',
                                    border: '1.5px solid var(--gold-100)',
                                    borderRadius: '12px',
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                                    zIndex: 100,
                                    marginTop: '4px'
                                }}>
                                    <div 
                                        onClick={() => selecionarPerfil(null)}
                                        style={{ 
                                            padding: '10px 15px', 
                                            cursor: 'pointer', 
                                            borderBottom: '1px solid var(--gold-50)', 
                                            color: '#666',
                                            fontSize: '13px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        -- Sem Perfil Associado --
                                    </div>
                                    {perfisFiltrados.length === 0 ? (
                                        <div style={{ padding: '12px 15px', color: '#888', fontSize: '13px', textAlign: 'center' }}>
                                            Nenhum perfil encontrado para "{termoPesquisa}"
                                        </div>
                                    ) : (
                                        perfisFiltrados.map(p => (
                                            <div
                                                key={p.idutilizadorprefil}
                                                onClick={() => selecionarPerfil(p)}
                                                style={{
                                                    padding: '10px 15px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid var(--gold-50)',
                                                    backgroundColor: String(campprefil) === String(p.idutilizadorprefil) ? '#f3ecd9' : 'transparent',
                                                    fontSize: '13.5px'
                                                }}
                                            >
                                                <strong style={{ color: 'var(--gold-800)' }}>ID {p.idutilizadorprefil}:</strong> {p.nome} {p.nif ? `(NIF: ${p.nif})` : ''}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {perfilSelecionadoTexto && (
                                <div style={{ fontSize: '12px', color: 'var(--gold-800)', marginTop: '4px', fontWeight: '600' }}>
                                    Selecionado: {perfilSelecionadoTexto}
                                </div>
                            )}

                            {carregandoPerfis && (
                                <span style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>
                                    A carregar perfis da BD...
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="btn-container">
                        <button type="submit" className="btn" disabled={aGuardar}>
                            {aGuardar ? 'A Guardar Conta...' : 'Associar e Guardar Conta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CriarConta;