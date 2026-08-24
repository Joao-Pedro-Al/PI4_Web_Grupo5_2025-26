import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/clini_circulo.png';

// Dados de exemplo (em um sistema real, viriam da API)
const usuariosExemplo = [
  { id: 1, username: 'paciente1', email: 'paciente1@email.com', nome: 'João Silva' },
  { id: 2, username: 'paciente2', email: 'paciente2@email.com', nome: 'Maria Santos' },
  { id: 3, username: 'medico1', email: 'medico@clinica.com', nome: 'Dr. Carlos' },
  { id: 4, username: 'medico2', email: 'ana@clinica.com', nome: 'Dra. Ana' }
];

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Por favor, insira seu email');
      setIsSuccess(false);
      return;
    }

    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Por favor, insira um email válido');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Verificar se o email existe
      const usuario = usuariosExemplo.find(user => user.email === email);
      
      if (!usuario) {
        throw new Error('Email não encontrado');
      }

      // Simular envio de email
      await sendRecoveryEmail(usuario);
      
      setMessage(`📧 Email enviado para: ${email}`);
      setIsSuccess(true);
      
      // Limpa o campo após 5 segundos
      setTimeout(() => {
        setEmail('');
        setMessage('');
        navigate('/login');
      }, 5000);
    } catch (error) {
      setMessage(error.message || 'Erro ao enviar email. Tente novamente.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Função simulada para enviar email
  const sendRecoveryEmail = async (usuario) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`📧 Email de recuperação enviado para: ${usuario.email}`);
        console.log(`👤 Usuário: ${usuario.nome} (ID: ${usuario.id})`);
        console.log(`🔗 Link de recuperação: http://sua-clinica.com/reset-password?token=${btoa(usuario.email)}&id=${usuario.id}`);
        console.log(`📝 Mensagem: Olá ${usuario.nome}, clique no link para redefinir sua password.`);
        resolve();
      }, 1500);
    });
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="logo">
          <img 
            src={logo}
            alt="Logo" 
            style={{ width: '80px', height: 'auto' }}
          />
        </div>

        {/* Título */}
        <h2 style={{ 
          color: '#b79b53', 
          marginBottom: '20px',
          fontSize: '1.5rem'
        }}>
          Recuperar Password
        </h2>

        {/* Mensagens de status */}
        {message && (
          <div style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: isSuccess ? '#e8f5e9' : '#ffebee',
            color: isSuccess ? '#2e7d32' : '#c62828',
            borderRadius: '5px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {isSuccess && <span style={{ marginRight: '8px' }}>✅</span>}
            {message}
            {isSuccess && (
              <div style={{ fontSize: '11px', marginTop: '5px', color: '#555' }}>
                Redirecionando para login em 5 segundos...
              </div>
            )}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px', textAlign: 'center' }}>
            <p style={{ 
              color: '#666', 
              fontSize: '0.9rem',
              marginBottom: '20px'
            }}>
              Insira o seu email para receber instruções de recuperação de password.
            </p>
          </div>

          <input 
            className="Texto" 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⌛ A ENVIAR...' : '📧 ENVIAR INSTRUÇÕES'}
          </button>

          {/* Link para voltar ao login */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a 
              href="#" 
              className="recover" 
              onClick={handleBackToLogin}
              style={{ display: 'inline-block' }}
            >
              ← Voltar ao Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecoverPassword; 