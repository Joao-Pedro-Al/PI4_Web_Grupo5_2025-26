
// src/view/Login.jsx - VERSÃO FINAL COM SETA PARA VOLTAR
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App.jsx';
import { useContext } from 'react';
import './Login.css';
import logo from '../assets/clini_circulo.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [credenciais, setCredenciais] = useState({
    username: '',
    password: ''
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Função para voltar à webpage
  const handleBackToWebpage = () => {
    navigate('/webpage');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    if (!credenciais.username || !credenciais.password) {
      setErro('Preencha usuário e senha');
      setCarregando(false);
      return;
    }

    try {
      // Dados fixos da tabela CONTA
      const contasSQL = [
        { idconta: 1, nome: 'Santa', username: 'Santa', password: '00000000Nah', idtipoconta: 1, idprefill: 2 },
        { idconta: 2, nome: 'HenMart', username: 'HenMart', password: 'MataAMosca', idtipoconta: 1, idprefill: 4 },
        { idconta: 3, nome: 'Herbert Ludwig', username: 'Herbert Ludwig', password: 'Archimedes', idtipoconta: 2, idprefill: null },
        { idconta: 4, nome: 'Joaquim', username: 'Joaquim', password: 'JojoBizAdven', idtipoconta: 2, idprefill: null },
        { idconta: 5, nome: 'Ana', username: 'Ana', password: 'AnaMontanha', idtipoconta: 2, idprefill: null },
        { idconta: 6, nome: 'Isabela', username: 'Isabela', password: 'AnimaleseIntensifies', idtipoconta: 2, idprefill: null }
      ];

      const contaEncontrada = contasSQL.find(conta => 
        conta.username.toLowerCase() === credenciais.username.toLowerCase() && 
        conta.password === credenciais.password
      );

      if (contaEncontrada) {
        const userData = {
          id: contaEncontrada.idconta,
          nome: contaEncontrada.nome,
          email: `${contaEncontrada.nome.toLowerCase().replace(/\s/g, '.')}@clinica.com`,
          tipo: contaEncontrada.idtipoconta === 2 ? 'medico' : 'paciente',
          idtipoconta: Number(contaEncontrada.idtipoconta),
          idprefil: contaEncontrada.idprefill || null,
          especialidade: contaEncontrada.idtipoconta === 2 ? 'Dentista' : 'Paciente'
        };
        
        console.log('🔐 Login bem-sucedido:', userData);
        login(userData);
        
        setTimeout(() => {
          if (userData.idtipoconta === 1) {
            navigate('/frontoffice/paginainicial', { replace: true });
          } else if (userData.idtipoconta === 2) {
            navigate('/backoffice/paginainicial', { replace: true });
          }
        }, 100);
        
      } else {
        setErro('Credenciais inválidas. Use "Santa" / "00000000Nah" para paciente ou "Herbert Ludwig" / "Archimedes" para médico.');
        setCarregando(false);
      }

    } catch (error) {
      console.error('Erro no login:', error);
      setErro('Erro ao fazer login. Tente novamente.');
      setCarregando(false);
    }
  };

  // Função para acessar o backoffice diretamente (para demonstração)
  const handleAccessBackofficeDemo = () => {
    const demoMedico = {
      id: 999,
      nome: 'DEMO Médico',
      email: 'demo.medico@clinica.com',
      tipo: 'medico',
      idtipoconta: 2,
      idprefil: null,
      especialidade: 'Dentista'
    };
    
    console.log('🚀 Acessando Backoffice em modo demonstração');
    login(demoMedico);
    
    setTimeout(() => {
      navigate('/backoffice/paginainicial', { replace: true });
    }, 100);
  };

  // Função para acessar o frontoffice diretamente (para demonstração)
  const handleAccessFrontofficeDemo = () => {
    const demoPaciente = {
      id: 998,
      nome: 'DEMO Paciente',
      email: 'demo.paciente@clinica.com',
      tipo: 'paciente',
      idtipoconta: 1,
      idprefil: 2,
      especialidade: 'Paciente'
    };
    
    console.log('🚀 Acessando Frontoffice em modo demonstração');
    login(demoPaciente);
    
    setTimeout(() => {
      navigate('/frontoffice/paginainicial', { replace: true });
    }, 100);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredenciais({
      ...credenciais,
      [name]: value
    });
    setErro('');
  };

  return (
    <div className="login-page">
      {/* Botão de voltar no canto superior esquerdo */}
      <button
        onClick={handleBackToWebpage}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '28px',
          cursor: 'pointer',
          zIndex: 1000,
          padding: '10px',
          borderRadius: '50%',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.transform = 'scale(1)';
        }}
        title="Voltar para a página inicial"
      >
        <i className="bi bi-arrow-left"></i>
      </button>

      <div className="login-container">
        <div className="logo">
          <img src={logo} alt="Logo" style={{ width: '80px', height: 'auto' }} />
        </div>

        <h2 style={{ color: '#b79b53', marginBottom: '10px', fontSize: '1.5rem' }}>
          Sistema Clínica Dentária
        </h2>

        {/* BOTÕES DE DEMONSTRAÇÃO RÁPIDA */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
            <strong>📱 ACESSO RÁPIDO:</strong>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              onClick={handleAccessBackofficeDemo}
              className="demo-btn backoffice-btn"
            >
              <i className="bi bi-person-badge"></i>
              ACESSAR BACKOFFICE (Médico)
            </button>
            
            <button
              type="button"
              onClick={handleAccessFrontofficeDemo}
              className="demo-btn frontoffice-btn"
            >
              <i className="bi bi-person-circle"></i>
              ACESSAR FRONTOFFICE (Paciente)
            </button>
          </div>
        </div>

        {/* Linha divisória */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          margin: '20px 0' 
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
          <div style={{ padding: '0 10px', color: '#999', fontSize: '12px' }}>OU</div>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
        </div>

        {/* Formulário tradicional */}
        {erro && (
          <div className="error-message">
            ❌ {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input 
            className="Texto" 
            type="text" 
            name="username"
            placeholder="Username"
            value={credenciais.username}
            onChange={handleInputChange}
            disabled={carregando}
          />

          <input 
            className="Texto" 
            type="password" 
            name="password"
            placeholder="Password"
            value={credenciais.password}
            onChange={handleInputChange}
            disabled={carregando}
          />

          <button 
            type="submit" 
            disabled={carregando}
            className="submit-btn"
          >
            {carregando ? '⌛ PROCESSANDO...' : '🚪 ENTRAR NO SISTEMA'}
          </button>
        </form>

        {/* Informações para o professor */}
        <div className="teacher-info">
          <div className="teacher-title">💡 INFORMAÇÃO PARA O PROFESSOR</div>
          <div className="teacher-item">• Botão <strong>"ACESSAR BACKOFFICE"</strong> → Área do médico com calendário</div>
          <div className="teacher-item">• Botão <strong>"ACESSAR FRONTOFFICE"</strong> → Área do paciente</div>
          <div className="teacher-item">• Para login tradicional use: <strong>"Santa" / "00000000Nah"</strong> (paciente)</div>
          <div className="teacher-item">• Ou: <strong>"Herbert Ludwig" / "Archimedes"</strong> (médico)</div>
        </div>

        {/* Debug info */}
        <div className="debug-info">
          <div><strong>Informação do Sistema</strong></div>
          <div>• idtipoconta=1 → Paciente (Frontoffice)</div>
          <div>• idtipoconta=2 → Médico (Backoffice)</div>
          <div>• Clique em "Criar Perfil" no Backoffice para criar novos perfis</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
