import { Link, useLocation } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";

import logo from '../assets/logo.png';
import '../style.css';

const MenuFrontoffice = () => {
  const location = useLocation();
  
  return (
    <nav className="menu menu--vertical">
      <div className="menu__logo">
        <img src={logo} alt="Logo" className="menu__logo-img" />
      </div>
      <ul className="menu__list">
        <li className="menu__item">
          <Link to="/frontoffice/paginainicial" 
                className={location.pathname.includes('/frontoffice/paginainicial') ? 'menu__link btn-gold' : 'menu__link'}>
            <i className="bi bi-house-door-fill"></i> Início
          </Link>
        </li>
        <li className="menu__item">
          <Link to="/frontoffice/historico" 
                className={location.pathname.includes('/frontoffice/historico') ? 'menu__link btn-gold' : 'menu__link'}>
            <i className="bi bi-calendar-week"></i> Agenda
          </Link>
        </li>
        <li className="menu__item">
          <Link to="/frontoffice/notificacoes" 
                className={location.pathname.includes('/frontoffice/notificacoes') ? 'menu__link btn-gold' : 'menu__link'}>
            <i className="bi bi-bell-fill"></i> Notificações
          </Link>
        </li>
        <li className="menu__item">
          <Link to="/login" className="menu__link">
            <i className="bi bi-box-arrow-right"></i> Sair
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default MenuFrontoffice;