import { useState } from 'react'
import { BrowserRouter as Router, Route, Link, Routes, useLocation } from "react-router-dom";

import logo from './assets/logo.png'
import './style.css'
import "bootstrap-icons/font/bootstrap-icons.css";

// ----MENUS LATERAIS----
import MenuBack from './view/MenuLateral_Backoffice.jsx';
import MenuFront from './view/MenuLateral_Frontoffice.jsx';

// ----BACKOFFICE----
import Base from './view/Base.jsx';
import Perfis from './view/perfis.jsx';
import CriarConta from './view/criar-conta.jsx';

// ----FRONTOFFICE----
import Historico_Front from './view/historico_front.jsx';


function App() {
  // var MenuLateral;
  // if(location.pathname.startsWith('/back/')){MenuLateral = MenuBack;}
  // else{MenuLateral = MenuFront}
  return (
    <Router>
      <div>

          <div className="header-bar">
              <i className="bi bi-person-circle"></i>
              <i className="bi bi-bell"></i>
          </div>

      <div className="layout">

        {/* <MenuLateral /> */}
        {
          location.pathname.startsWith('/backoffice/')
          ? <MenuBack />
          : null
        }
        {
          location.pathname.startsWith('/frontoffice/')
          ? <MenuFront />
          : null
        }
          
          <div className="content">
            <Routes>
              <Route path="/teste/" element={<Base/>} />
              {/* ----------BACKOFFICE----------- */}
              <Route path="/backoffice/perfis/" element={<Perfis/>} />
              <Route path="/backoffice/conta/criar" element={<CriarConta/>} />
              {/* ----------FRONTOFFICE----------- */}
              <Route path="/frontoffice/historico/" element={<Historico_Front/>} />
            </Routes>
          </div>
      </div>
      </div>
    </Router>
  )
}

export default App
