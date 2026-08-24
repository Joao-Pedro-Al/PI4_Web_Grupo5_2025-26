import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App.jsx';
import './Login.css';
import logo from '../assets/clini_circulo.png';
import axios from 'axios';
import urlAPI from './url_global';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [credenciais, setCredenciais] = useState({
    username: '',
    password: ''
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleBackToWebpage = () => {
    navigate('/webpage');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredenciais({
      ...credenciais,
      [name]: value
    });
    setErro('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    if (!credenciais.username || !credenciais.password) {
      setErro('Preencha o utilizador e a palavra-passe.');
      setCarregando(false);
      return;
    }

    try {
      const endpoint = urlAPI + "api/login";
      const response = await axios.post(endpoint, credenciais);

      if (response.data && response.data.success) {
        const userData = response.data.data;
        console.log('Login bem-sucedido via Base de Dados:', userData);
        login(userData);

        setTimeout(() => {
          if (userData.idtipoconta === 2) {
            navigate('/backoffice/paginainicial', { replace: true });
          } else {
            navigate('/frontoffice/paginainicial', { replace: true });
          }
        }, 100);

      } else {
        setErro(response.data.message || 'Credenciais inválidas.');
        setCarregando(false);
      }

    } catch (error) {
      console.error('Erro no login:', error);
      const msg = error.response?.data?.message || 'Erro ao conectar à base de dados. Tente novamente.';
      setErro(msg);
      setCarregando(false);
    }
  };

  return (
    <div className="login-page">
      <button
        onClick={handleBackToWebpage}
        className="back-button"
        title="Voltar para a página inicial"
      >
        <i className="bi bi-arrow-left"></i>
      </button>

      <div className="login-container">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>

        <h2 className="login-title">
          CliniMolelos
        </h2>

        {erro && (
          <div className="error-message">
            {erro}
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
            required
          />

          <input 
            className="Texto" 
            type="password" 
            name="password"
            placeholder="Password"
            value={credenciais.password}
            onChange={handleInputChange}
            disabled={carregando}
            required
          />

          <button 
            type="submit" 
            disabled={carregando}
            className="submit-btn"
          >
            {carregando ? 'A processar...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;