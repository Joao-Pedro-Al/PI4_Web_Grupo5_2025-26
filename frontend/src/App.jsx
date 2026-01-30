import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import { useState } from 'react'


import logo from './assets/logo.png'

import "bootstrap-icons/font/bootstrap-icons.css";

// ----MENUS LATERAIS----
import MenuBack from './view/MenuLateral_Backoffice.jsx';
import MenuFront from './view/MenuLateral_Frontoffice.jsx';

// ----BACKOFFICE----
import Base from './view/Base.jsx';
import Perfis from './view/perfis.jsx';
import Historico_Front from './view/historico_front.jsx';
import Webpage from './view/webpage.jsx';

function App() {
  return (
    <Router>
      <div>

      {
        location.pathname.matchAll('/')
        ? <Routes>
          <Route path="/" element={<Webpage/>} />
        </Routes>
        :<div className="layout">

    
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
              {/ ----------BACKOFFICE----------- /}
              <Route path="/backoffice/perfis/" element={<Perfis/>} />
             
              {/ ----------FRONTOFFICE----------- */}
              <Route path="/frontoffice/historico/" element={<Historico_Front/>} />
            </Routes>
          </div>
      </div>
      }
      </div>

    </Router>
  )
}

export default App
