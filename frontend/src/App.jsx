import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import './style.css'

// ----MENUS LATERAIS----
import MenuBack from './view/MenuLateral_Backoffice.jsx';
import MenuFront from './view/MenuLateral_Frontoffice.jsx';

// ----BACKOFFICE----
import Base from './view/Base.jsx';
import Perfis from './view/perfis.jsx';
import VerPerfil from './view/verperfil.jsx';

// ----FRONTOFFICE----
import Historico_Front from './view/historico_front.jsx';


function App() {
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
              <Route path="/backoffice/perfis/:id" element={<VerPerfil/>} />
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
