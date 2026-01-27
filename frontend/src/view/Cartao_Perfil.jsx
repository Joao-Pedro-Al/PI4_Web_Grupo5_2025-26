const CartaoPerfil = ({nome, num, email}) => {
return (
    <div className="card div--cartao--perfil d-block col-sm-11 col-lg-5 col-xl-4 paciente">
        <div className="card-body py-4">
        <h5 className="card-title fw-bold mb-3">{nome}</h5>
        <p className="card-text mb-2"><b>Telefone: </b>{num}</p>
        <p className="card-text"><b>Email: </b>{email}</p>
        </div>
    </div>
);
}
export default CartaoPerfil;