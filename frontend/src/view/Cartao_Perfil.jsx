const CartaoPerfil = ({nome, num, email, idclasse, idperf}) => {
    if(num == null){num = "N/A"}
    if(email == null){email = "N/A"}

    if(idclasse == 1){
        return (
            <div className="card div--cartao--perfil d-block col-sm-11 col-lg-5 col-xl-4 paciente">
                <a href={location.pathname + idperf} className="text-decoration-none div__a--link">
                    <div className="card-body py-4">
                        <h5 className="card-title fw-bold mb-3">{nome}</h5>
                        <p className="card-text mb-2"><b>Telefone: </b>{num}</p>
                        <p className="card-text"><b>Email: </b>{email}</p>
                    </div>
                </a>
            </div>
        );
    }
    else{
        return (
            <div className="card div--cartao--perfil d-block col-sm-11 col-lg-5 col-xl-4 doutor">
                <a href={location.pathname + idperf} className="text-decoration-none div__a--link">
                    <div className="card-body py-4">
                        <h5 className="card-title fw-bold mb-3">{nome}</h5>
                        <p className="card-text mb-2"><b>Telefone: </b>{num}</p>
                        <p className="card-text"><b>Email: </b>{email}</p>
                    </div>
                </a>
            </div>
        );
    }
}
export default CartaoPerfil;