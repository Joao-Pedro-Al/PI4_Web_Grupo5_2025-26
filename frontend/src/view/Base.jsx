import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import '../style.css';

const Base = () => {
return (
    <div className="form-container">
        
        <form>
        <label htmlFor="username">Username</label>
        <input type="text" id="username" placeholder="Enter Username" />

        <label htmlFor="email">Email</label>
        <input type="email" id="email" placeholder="Enter Email" />

        <label htmlFor="account-type">Tipo de Conta</label>
        <select id="account-type">
            <option value="paciente">Paciente</option>
            <option value="medico">Médico</option>
        </select>

        <label htmlFor="profile">Perfil de Paciente</label>
        <select id="profile">
            <option value="geral">Geral</option>
            <option value="especifico">Específico</option>
        </select>

        <button type="submit" className="btn">Associar</button>
        </form>
    </div>
);
}
export default Base;