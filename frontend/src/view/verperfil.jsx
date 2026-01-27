import '../verperfil.css';


const VerPerfil = () => {
    return (
        <div className="container-fluid">

          {/* <!-- //////// Informação Básica //////// --> */}
          <div className="row align-items-start mb-5">

            {/* <!-- INÍCO: Cartão --> */}
            <div className="card div--cartao--perfil d-block mb-sm-3 col-sm-11 mb-lg-0 col-lg-8">
              <div className="card-body py-4">
                <h5 className="card-title fw-bold mb-3">Nome do Perfil</h5>
                <p className="card-text mb-1"><b>Telefone: </b>987654321</p>
                <p className="card-text mb-1"><b>Email: </b>perfil@gmail.com</p>
                <p className="card-text mb-1"><b>Data de Nascimento: </b>01/01/2000</p>
                <p className="card-text mb-1"><b>NIF/SNS: </b>232323232</p>
                <p className="card-text mb-1"><b>Sexo: </b>Outro</p>
                <p className="card-text mb-1"><b>Estado Civil: </b>Solteiro</p>
                <p className="card-text mb-1"><b>Gravida: </b>Não</p>
              </div>
            </div>
            {/* <!-- FIM: Cartão --> */}

            {/* <!-- Editar ou Apagar --> */}
            <div className="container-fluid mx-sm-0 col-sm-11 mx-lg-auto offset-lg-1 col-lg-2">
              <div className="row">

                <button type="button" className="btn text-white shadow-none mb-lg-3 col-sm-5 col-lg-12">Alterar Perfil</button>
                <button type="button" className="btn text-white shadow-none offset-sm-2 col-sm-5 offset-lg-0 col-lg-12">Apagar Perfil</button>
                
              </div>
            </div>

          </div>

          {/* <!-- //////// Histórico Médico Geral //////// --> */}
          <div className="row align-items-start mb-5">

            {/* <!-- INÍCO: Header --> */}
            <div className="card div--cartao--header d-block mb-4 col-11">
              <div className="card-body py-2">
                <h5 className="card-title fw-bold m-0">Histórico Médico Geral</h5>
              </div>
            </div>
            {/* <!-- FIM: Header --> */}

            {/* <!-- INÍCO: Cartão --> */}
            <div className="card div--cartao--perfil d-block col-9">
              <div className="card-body py-4">
                <p className="card-text mb-1"><b>Cirurgias Anteriores: </b>Cirurgia de apendicite (2016)</p>
                <p className="card-text mb-1"><b>Alergias: </b>Alergia a nozes</p>
                <p className="card-text"><b>Raios-X: </b>N/A</p>
              </div>
            </div>
            {/* <!-- FIM: Cartão --> */}

          </div>

          {/* <!-- //////// Histórico Dentário //////// --> */}
          <div className="row align-items-start mb-3">

            {/* <!-- INÍCO: Header --> */}
            <div className="card div--cartao--header d-block mb-4 col-11">
              <div className="card-body py-2">
                <h5 className="card-title fw-bold m-0">Histórico Dentário</h5>
              </div>
            </div>
            {/* <!-- FIM: Header --> */}

            {/* <!-- INÍCO: Cartão --> */}
            <div className="card div--cartao--perfil d-block col-9">
              <div className="card-body py-4">
                <p className="card-text mb-1"><b>Última Consulta Dentária: </b>10/01/2024</p>
                <p className="card-text mb-1"><b>Motivo da Consulta Inicial: </b>Check-up de rotina e limpeza dentária</p>
                <p className="card-text mb-1"><b>Experiência com anestesia: </b>Normal, sem reações adversas</p>
                <p className="card-text mb-1"><b>Condições atuais: </b>Boa higiene oral, pequena retração gengival no dente 11, manchas leves devido ao consumo de café.</p>
                <p className="card-text"><b>Raios-X: </b><a href="#">Raios-x.pdf</a></p>
              </div>
            </div>
            {/* <!-- FIM: Cartão --> */}

          </div>

        </div>
    );
}
export default VerPerfil;