import { useState } from 'react'
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";

import logo from './assets/logo.png'
import './style.css'
import "bootstrap-icons/font/bootstrap-icons.css";

import Base from './view/Base.jsx'

function App() {
  return (
    <Router>
      <div>

          <div className="header-bar">
              <i className="bi bi-person-circle"></i>
              <i className="bi bi-bell"></i>
          </div>

      <div className="layout">
          {/* <!--menu do lado--> */}
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
              <Link className="menu__link" href="#">
                  <i className="bi bi-calendar-week"></i> Remarcar
              </Link>
              </li>
              <li className="menu__item">
                  <Link className="menu__link btn-gold" href="#">
                  <i className="bi bi-plus-circle"></i> Criar Conta
                  </Link>
              </li>

              <li className="menu__item">
              <Link className="menu__link" href="#">
                  <i className="bi bi-bell-fill"></i> Notificações
              </Link>
              </li>
              <li className="menu__item">
              <Link className="menu__link" href="#">
                  <i className="bi bi-person-circle"></i> Perfis
              </Link>
              </li>
              <li className="menu__item">
              <Link className="menu__link" href="#">
                  <i className="bi bi-journal-medical"></i> Consultas
              </Link>
              </li>
              <li className="menu__item">
              <Link className="menu__link" href="#">
                  <i className="bi bi-box-arrow-right"></i> Sign Out
              </Link>
              </li>
          </ul>
          </nav>

          
          <div className="content">
            <Routes>
              <Route path="/teste/" element={<Base/>} />
              {/* <Route path="/perfis/" element={<Perfis/>} /> */}
            </Routes>
          </div>
      </div>
      </div>
    </Router>
  )
}

export default App
