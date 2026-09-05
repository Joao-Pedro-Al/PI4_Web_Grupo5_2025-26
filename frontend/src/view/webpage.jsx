import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import '../styleWEBPAGE.css';
import logo from '../assets/IMG/account.png'
import tele from '../assets/IMG/telemoveis.png'
import media from '../assets/IMG/media.png'
import agenda from '../assets/IMG/notificacoes.png'
import consulta from '../assets/IMG/consulta.webp'
import medica from '../assets/IMG/medica.png'

const Webpage = () => {
  const navigate = useNavigate();

  // Função para redirecionar para login ao clicar no ícone de perfil
  const handleProfileClick = () => {
    navigate('/login');
  };

  return (
    <div>
      <header class="topbar">
        {/* Ícone de perfil - agora com link para login */}
        <div class="user-icon" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="Perfil" style={{ transition: 'transform 0.3s ease' }} />
        </div>
      </header>

      <img src={tele} alt="Telemóveis" class="phones" />

      <div class="container">
        <p class="info-text">Os seus tratamentos, no seu bolso</p>

        <img src={media} alt="Media" />

        <a href="/clinimolelos.apk" download="CliniMolelos.apk" className="text-decoration-none">
          <button className="install-btn">
            <i className="bi bi-download me-2"></i> Instalar
          </button>
        </a>
      </div>

      <section>
        <div>
          <h2>Seja notificado sobre as suas consultas</h2>
          <p>Veja uma agenda organizada com as suas consultas futuras e veja os detalhes das consultas passadas.</p>
        </div>
        <img src={agenda} alt="Agenda" />
      </section>

      <section>
        <img src={consulta} alt="Consulta" />
        <div>
          <h2>Acompanhado mesmo depois da consulta</h2>
          <p>Tenha acesso fácil ao tratamento personalizado definido pela nossa equipa altamente qualificada.</p>
        </div>
      </section>

      <section>
        <div>
          <h2>Acompanhamos a família inteira</h2>
          <p>Associe dependentes à sua conta e tenha acesso à ficha deles.</p>
        </div>
        <img src={medica} alt="Família" />
      </section>

      <div class="faixa">
        <h2>A sua ficha, o seu histórico e o seu tratamento no seu bolso.</h2>

        <a href="/clinimolelos.apk" download="CliniMolelos.apk" className="text-decoration-none">
          <button className="install-btn">
            <i className="bi bi-download me-2"></i> Instale Agora
          </button>
        </a>
      </div>
    </div>
  );
}

export default Webpage;
