import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App.jsx';

const BASE_URL = 'http://localhost:3000';

const NotificationBell = ({ isBackoffice = false }) => {
  const { user } = useContext(AuthContext);
  const [naoLidasCount, setNaoLidasCount] = useState(0);

  const buscarNotificacoesNaoLidas = useCallback(async () => {
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
          // Contar notificações onde visto é false
          const count = dados.data.filter(n => n.visto === false || n.visto === 0).length;
          setNaoLidasCount(count);
        }
      }
    } catch (error) {
      // Ignorar erros de rede silenciosamente no polling
    }
  }, [user]);

  useEffect(() => {
    buscarNotificacoesNaoLidas();

    // Ouvir eventos personalizados de atualização instantânea (ex: clicar no olho de lida/não lida)
    const handleEventUpdate = () => buscarNotificacoesNaoLidas();
    window.addEventListener('notificacoes-updated', handleEventUpdate);

    // Polling a cada 5 segundos para manter sincronizado com novas consultas
    const interval = setInterval(buscarNotificacoesNaoLidas, 5000);

    return () => {
      window.removeEventListener('notificacoes-updated', handleEventUpdate);
      clearInterval(interval);
    };
  }, [buscarNotificacoesNaoLidas]);

  const rota = isBackoffice ? '/backoffice/notificacoes' : '/frontoffice/notificacoes';

  return (
    <Link
      to={rota}
      style={{
        color: 'white',
        textDecoration: 'none',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 10px',
        borderRadius: '8px',
        transition: 'background-color 0.2s'
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            animation: 'pulse 2s infinite'
          }}
        >
          {naoLidasCount > 99 ? '99+' : naoLidasCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
