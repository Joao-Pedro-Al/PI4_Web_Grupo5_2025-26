import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App.jsx';

import urlGlobal from './url_global.jsx';

const BASE_URL = urlGlobal.endsWith('/') ? urlGlobal.slice(0, -1) : urlGlobal;

const NotificationBell = ({ isBackoffice = false }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [naoLidasCount, setNaoLidasCount] = useState(0);
  const [notificacoes, setNotificacoes] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const containerRef = useRef(null);

  const buscarNotificacoes = useCallback(async () => {
    if (!user) return;
    try {
      let url;
      const isMedico = user.idtipoconta === 2 || user.idtipoconta === 1;

      if (isMedico) {
        url = `${BASE_URL}/api/notificacoes/list`;
      } else if (user.idprefil) {
        url = `${BASE_URL}/api/notificacoes/list/${user.idprefil}`;
      } else {
        return;
      }

      const response = await fetch(url);
      if (response.ok) {
        const dados = await response.json();
        if (dados.success && Array.isArray(dados.data)) {
          setNotificacoes(dados.data);
          const count = dados.data.filter(n => n.visto === false || n.visto === 0).length;
          setNaoLidasCount(count);
        }
      }
    } catch (error) {
      // Ignorar erros silenciosamente no polling
    }
  }, [user]);

  useEffect(() => {
    buscarNotificacoes();

    const handleEventUpdate = () => buscarNotificacoes();
    window.addEventListener('notificacoes-updated', handleEventUpdate);

    const interval = setInterval(buscarNotificacoes, 5000);

    return () => {
      window.removeEventListener('notificacoes-updated', handleEventUpdate);
      clearInterval(interval);
    };
  }, [buscarNotificacoes]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleVista = async (id, e) => {
    e.stopPropagation();
    try {
      const notifObj = notificacoes.find(n => n.idnotificacao === id);
      const novoVisto = !notifObj?.visto;

      await fetch(`${BASE_URL}/api/notificacoes/vista/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visto: novoVisto })
      });

      window.dispatchEvent(new CustomEvent('notificacoes-updated'));
    } catch (err) {
      console.error('Erro ao marcar notificação:', err);
    }
  };

  const marcarTodasComoVistas = async (e) => {
    e.stopPropagation();
    try {
      const isMedico = user?.idtipoconta === 2 || user?.idtipoconta === 1;
      if (isMedico) {
        await Promise.all(
          notificacoes.filter(n => !n.visto).map(n =>
            fetch(`${BASE_URL}/api/notificacoes/vista/${n.idnotificacao}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ visto: true })
            })
          )
        );
      } else if (user?.idprefil) {
        await fetch(`${BASE_URL}/api/notificacoes/vista-todas/${user.idprefil}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });
      }

      window.dispatchEvent(new CustomEvent('notificacoes-updated'));
    } catch (err) {
      console.error('Erro ao marcar todas como vistas:', err);
    }
  };

  const formatarDataSimples = (dStr) => {
    if (!dStr) return '';
    const d = new Date(dStr);
    if (isNaN(d)) return '';
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} ${hora}:${min}`;
  };

  const rota = isBackoffice ? '/backoffice/notificacoes' : '/frontoffice/notificacoes';

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 10px',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
        title={`${naoLidasCount} notificação(ões) por ver`}
      >
        <i className="bi bi-bell" style={{ fontSize: '19px' }}></i>
        {naoLidasCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0px',
              right: '2px',
              backgroundColor: '#e74c3c',
              color: 'white',
              fontSize: '11px',
              fontWeight: 'bold',
              borderRadius: '10px',
              padding: '1px 5px',
              minWidth: '17px',
              height: '17px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {naoLidasCount > 99 ? '99+' : naoLidasCount}
          </span>
        )}
      </button>

      {/* DROPDOWN POPUP */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '42px',
            right: '0px',
            width: '340px',
            maxHeight: '420px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            zIndex: 1100,
            color: '#333333',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e0e0e0',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {/* Cabeçalho do Dropdown */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#A99C5E',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            <span>
              <i className="bi bi-bell-fill me-2"></i>
              Notificações {naoLidasCount > 0 && `(${naoLidasCount})`}
            </span>
            {naoLidasCount > 0 && (
              <button
                type="button"
                onClick={marcarTodasComoVistas}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '11px',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  cursor: 'pointer'
                }}
                title="Marcar todas como vistas"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Lista de Notificações */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '0' }}>
            {notificacoes.length === 0 ? (
              <div style={{ padding: '25px 15px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                <i className="bi bi-bell-slash" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
                Nenhuma notificação por mostrar.
              </div>
            ) : (
              notificacoes.slice(0, 7).map((n) => (
                <div
                  key={n.idnotificacao}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: n.visto ? '#ffffff' : '#fff9eb',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '10px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: n.visto ? '500' : '700', color: '#2c3e50', marginBottom: '2px' }}>
                      {n.titulo}
                      {!n.visto && (
                        <span style={{ fontSize: '9px', backgroundColor: '#e74c3c', color: 'white', borderRadius: '4px', padding: '1px 4px', marginLeft: '6px' }}>
                          NOVA
                        </span>
                      )}
                    </div>
                    {n.descricao && (
                      <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.3', marginBottom: '4px' }}>
                        {n.descricao}
                      </div>
                    )}
                    <div style={{ fontSize: '10px', color: '#888' }}>
                      <i className="bi bi-clock me-1"></i>
                      {formatarDataSimples(n.data_criacao)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => toggleVista(n.idnotificacao, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: n.visto ? '#bdc3c7' : '#A99C5E',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '4px'
                    }}
                    title={n.visto ? 'Marcar como não lida' : 'Marcar como lida'}
                  >
                    <i className={`bi ${n.visto ? 'bi-eye-slash' : 'bi-eye-fill'}`}></i>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Rodapé do Dropdown */}
          <div
            style={{
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #e0e0e0',
              textAlign: 'center'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowDropdown(false);
                navigate(rota);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#A99C5E',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Ver Todas as Notificações ({notificacoes.length}) <i className="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
