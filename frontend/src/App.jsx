// [file name]: App.jsx (versão completa)
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useEffect, useContext } from "react";
import './style.css'
import { createContext } from 'react';

export const AuthContext = createContext();

// ----MENUS LATERAIS----
import MenuBack from './view/MenuLateral_Backoffice.jsx';
import MenuFront from './view/MenuLateral_Frontoffice.jsx';

// ----AUTENTICAÇÃO----
import Login from './view/Login.jsx';
import RecoverPassword from './view/RecoverPassword.jsx';

// ----BACKOFFICE----
import Base from './view/Base.jsx';
import Perfis from './view/perfis.jsx';
import VerPerfil from './view/verperfil.jsx';
import Criarperfil from './view/Criarperfil.jsx';
import CriarConta from './view/criar-conta.jsx';

import Webpage from './view/webpage.jsx';
import PaginaInicial from './view/paginainicial.jsx';
import Notificacoes from './view/notificacoes.jsx';

// ----FRONTOFFICE----
import Historico_Front from './view/historico_front.jsx';
import PagInicialCli from './view/PagInicialCli.jsx';

// Componente para verificar autenticação
const RequireAuth = ({ children, requireTipoconta = null }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Se não há usuário, redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se precisa de um tipo específico de conta
  if (requireTipoconta && user.idtipoconta !== requireTipoconta && !(requireTipoconta === 1 && (user.idtipoconta === 3 || user.idtipoconta === 1))) {
    // Redireciona baseado no tipo de conta atual
    if (user.idtipoconta === 2) {
      return <Navigate to="/backoffice/paginainicial" replace />;
    } else {
      return <Navigate to="/frontoffice/paginainicial" replace />;
    }
  }

  return children;
};

// Componente que decide qual página inicial mostrar baseado no idtipoconta
const PaginaInicialPorTipoConta = () => {
  const { user } = useContext(AuthContext);

  console.log('PaginaInicialPorTipoConta - user:', user);

  if (!user) {
    console.log('❌ Não há usuário, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔀 Decidindo redirecionamento baseado no idtipoconta:', user.idtipoconta, typeof user.idtipoconta);

  // Decidir baseado no idtipoconta
  if (user.idtipoconta === 2) {
    // Médicos - Backoffice
    console.log('🔄 Redirecionando para BACKOFFICE (Médico)');
    return <Navigate to="/backoffice/paginainicial" replace />;
  } else {
    // Pacientes/Outros - Frontoffice
    console.log('🔄 Redirecionando para FRONTOFFICE (Paciente)');
    return <Navigate to="/frontoffice/paginainicial" replace />;
  }
};

// Layout do Backoffice (Médicos)
const BackofficeLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div className="header-bar">
        <div style={{
          color: 'white',
          marginRight: 'auto',
          paddingLeft: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <i className="bi bi-person-badge"></i>
          <span>{user?.nome || 'Usuário'} | 🩺 MÉDICO</span>
        </div>
        <a href="/backoffice/notificacoes" style={{ color: 'white', textDecoration: 'none' }}>
          <i className="bi bi-bell" title="Notificações"></i>
        </a>
        <a href="/login" style={{ color: 'white', textDecoration: 'none' }} onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" title="Sair"></i>
        </a>
      </div>

      <div className="layout">
        <MenuBack />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Layout do Frontoffice (Pacientes)
const FrontofficeLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div className="header-bar">
        <div style={{
          color: 'white',
          marginRight: 'auto',
          paddingLeft: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <i className="bi bi-person-circle"></i>
          <span>{user?.nome || 'Usuário'} | 👤 PACIENTE</span>
        </div>
        <a href="/frontoffice/notificacoes" style={{ color: 'white', textDecoration: 'none' }}>
          <i className="bi bi-bell" title="Notificações"></i>
        </a>
        <a href="/login" style={{ color: 'white', textDecoration: 'none' }} onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" title="Sair"></i>
        </a>
      </div>

      <div className="layout">
        <MenuFront />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há usuário no localStorage quando o app carrega
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('clinic_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('✅ Usuário restaurado do localStorage:', parsedUser);
          console.log('✅ idtipoconta restaurado:', parsedUser.idtipoconta, typeof parsedUser.idtipoconta);
          setUser(parsedUser);
        } catch (error) {
          console.error('Erro ao parsear usuário:', error);
          localStorage.removeItem('clinic_user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Criar função para login
  const handleLogin = (userData) => {
    console.log('🔐 Login realizado:', userData);
    setUser(userData);
    localStorage.setItem('clinic_user', JSON.stringify(userData));
  };

  // Criar função para logout
  const handleLogout = () => {
    console.log('🚪 Logout realizado');
    setUser(null);
    localStorage.removeItem('clinic_user');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#A99C5E'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <i className="bi bi-arrow-repeat" style={{ fontSize: '40px', animation: 'spin 1s linear infinite' }}></i>
          <p>Carregando...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login: handleLogin,
      logout: handleLogout
    }}>
      <Router>
        <Routes>
          {/* Rota raiz - Redireciona para página inicial baseada no tipo de conta */}
          <Route path="/" element={<PaginaInicialPorTipoConta />} />

          {/* Rotas públicas */}
          <Route path="/webpage" element={<Webpage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recover-password" element={<RecoverPassword />} />

          {/* ================= BACKOFFICE (MÉDICOS - idtipoconta = 2) ================= */}
          <Route path="/backoffice/paginainicial" element={
            <RequireAuth requireTipoconta={2}>
              <BackofficeLayout>
                <PaginaInicial />
              </BackofficeLayout>
            </RequireAuth>
          } />

          <Route path="/backoffice/perfis" element={
            <RequireAuth requireTipoconta={2}>
              <BackofficeLayout>
                <Perfis />
              </BackofficeLayout>
            </RequireAuth>
          } />

          <Route path="/backoffice/perfis/:id" element={
            <RequireAuth requireTipoconta={2}>
              <BackofficeLayout>
                <VerPerfil />
              </BackofficeLayout>
            </RequireAuth>
          } />

          <Route path="/backoffice/criarperfil" element={
            <RequireAuth requireTipoconta={2}>
              <BackofficeLayout>
                <Criarperfil />
              </BackofficeLayout>
            </RequireAuth>
          } />

          <Route path="/backoffice/conta/criar" element={
            <RequireAuth requireTipoconta={2}>
              <BackofficeLayout>
                <CriarConta />
              </BackofficeLayout>
            </RequireAuth>
          } />

          


          <Route path="/backoffice/notificacoes" element={
            <RequireAuth requireTipoconta={2}>
              <BackofficeLayout>
                <Notificacoes />
              </BackofficeLayout>
            </RequireAuth>
          } />

          {/* ================= FRONTOFFICE (PACIENTES - idtipoconta = 1) ================= */}
          <Route path="/frontoffice/paginainicial" element={
            <RequireAuth requireTipoconta={1}>
              <FrontofficeLayout>
                <PagInicialCli />
              </FrontofficeLayout>
            </RequireAuth>
          } />

          <Route path="/frontoffice/historico" element={
            <RequireAuth requireTipoconta={1}>
              <FrontofficeLayout>
                <Historico_Front />
              </FrontofficeLayout>
            </RequireAuth>
          } />

          <Route path="/frontoffice/notificacoes" element={
            <RequireAuth requireTipoconta={1}>
              <FrontofficeLayout>
                <Notificacoes />
              </FrontofficeLayout>
            </RequireAuth>
          } />

          {/* Redirecionamento padrão */}
          <Route path="*" element={<PaginaInicialPorTipoConta />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;