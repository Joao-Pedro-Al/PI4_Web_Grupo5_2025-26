// Cartao_Perfil.jsx
import { Link } from 'react-router-dom';
import "bootstrap-icons/font/bootstrap-icons.css";

const CartaoPerfil = ({ nome, num, email, idclasse, idperf }) => {
    const temTelefone = num != null && num !== "";
    const temEmail = email != null && email !== "";

    const classeCSS = idclasse == 1 ? "paciente" : "doutor";
    const classeLabel = idclasse == 1 ? "Paciente" : "Doutor";

    const perfilUrl = `/backoffice/perfis/${idperf}`;

    return (
        <div className={`card div--cartao--perfil d-block ${classeCSS}`}>            <Link to={perfilUrl} className="text-decoration-none div__a--link">
            <div className="card-body py-3">

                <span className={`badge-classe badge-classe--${classeCSS}`}>
                    {classeLabel}
                </span>

                <h5 className="card-title fw-bold mb-3 cartao-perfil__nome">{nome}</h5>

                <div className="info-contacto">
                    <i className="bi bi-telephone-fill info-contacto__icon"></i>
                    {temTelefone
                        ? <p className="card-text mb-0 info-contacto__texto">{num}</p>
                        : <p className="card-text mb-0 sem-contacto">Sem telefone</p>}
                </div>

                <div className="info-contacto">
                    <i className="bi bi-envelope-fill info-contacto__icon"></i>
                    {temEmail
                        ? <p className="card-text mb-0 info-contacto__texto">{email}</p>
                        : <p className="card-text mb-0 sem-contacto">Sem email</p>}
                </div>

            </div>
        </Link>
        </div>
    );
}

export default CartaoPerfil;