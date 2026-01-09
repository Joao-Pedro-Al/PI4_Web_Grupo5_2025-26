import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';

import logo from '../assets/logo.png'
import "bootstrap-icons/font/bootstrap-icons.css";

import '../style.css';

const MenuFrontoffice = () => {
  const url = useLocation();
return (
    <nav className="menu menu--vertical">
        <div className="menu__logo">
            <img src={logo} alt="Logo" className="menu__logo-img" />
        </div>
        <ul className="menu__list">
            <li className="menu__item">
            <Link className="menu__link" href="#">
              <i className="bi bi-house-door-fill"></i> Início
            </Link>
          </li>
          <li className="menu__item">
            <Link to="/historico/" className={location.pathname === '/frontoffice/historico/' ? 'menu__link btn-gold' : 'menu__link'}>
              <i className="bi bi-calendar-week"></i> Agenda
            </Link>
          </li>
          <li className="menu__item">
            <Link className="menu__link" href="#">
              <i className="bi bi-person-circle"></i> Perfil
            </Link>
          </li>
          <li className="menu__item">
            <Link className="menu__link" href="#">
              <i className="bi bi-bell-fill"></i> Notificações
            </Link>
          </li>
          <li className="menu__item">
            <Link className="menu__link" href="#">
              <i className="bi bi-box-arrow-right"></i> Sign Out
            </Link>
          </li>
        </ul>
    </nav>
);
}
export default MenuFrontoffice;