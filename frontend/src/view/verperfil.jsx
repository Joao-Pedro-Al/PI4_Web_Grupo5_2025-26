import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import url from "./url_global";

import axios from "axios";

import '../verperfil.css';
const VerPerfil = () => {

    const { id } = useParams();
    const urlAPI = url + "utilizadorperfil/list/" + id;

    const [dataPerfil, setdataPerfil] = useState([]);
    
    const iniciado = useRef(0);

    // Carregar Perfil
    useEffect(() => {
        CarregarPerfil();
    }, [])

    function CarregarPerfil() {
        axios.get(urlAPI)
        .then(res => {
        if(res.data.success){
        const data = res.data.data;
        setdataPerfil(data);
        }else{
        alert("Error Web Service!");
        }
        })
        .catch(error => {
        alert(error)
        });
    }

    return (
      <LoadPerfilData/>
    );

    function LoadPerfilData() {
    return dataPerfil.map((data, index) => {
      var anestesia = "Sim";
      var gravida = "Sim";
      if (data.experienciaanastesia == false || data.experienciaanastesia == null){anestesia = "Não"}
      if (data.gravida == false || data.gravida == null){gravida = "Não"}
        return (
        <div className="container-fluid" key={index}>
          <div className="row align-items-start mb-5">

            <div className="card div--cartao--perfil d-block mb-sm-3 col-sm-11 mb-lg-0 col-lg-8">
              <div className="card-body py-4">
                <h5 className="card-title fw-bold mb-3">{data.nome}</h5>
                <p className="card-text mb-1"><b>Telefone: </b>{data.contactoprincipal}</p>
                <p className="card-text mb-1"><b>Email: </b>{data.gmail}</p>
                <p className="card-text mb-1"><b>Data de Nascimento: </b>{data.datanascimento}</p>
                <p className="card-text mb-1"><b>NIF/SNS: </b>{data.nif}</p>
                <p className="card-text mb-1"><b>Sexo: </b>{data.genero}</p>
                <p className="card-text mb-1"><b>Estado Civil: </b>{data.estadocivil}</p>
                <p className="card-text mb-1"><b>Gravida: </b>{gravida}</p>
              </div>
            </div>

            <div className="container-fluid mx-sm-0 col-sm-11 mx-lg-auto offset-lg-1 col-lg-2">
              <div className="row">

                <button type="button" className="btn text-white shadow-none mb-lg-3 col-sm-5 col-lg-12">Alterar Perfil</button>
                <button type="button" className="btn text-white shadow-none offset-sm-2 col-sm-5 offset-lg-0 col-lg-12">Apagar Perfil</button>
                
              </div>
            </div>

          </div>

          <div className="row align-items-start mb-5">

            <div className="card div--cartao--header d-block mb-4 col-11">
              <div className="card-body py-2">
                <h5 className="card-title fw-bold m-0">Histórico Médico Geral</h5>
              </div>
            </div>

            <div className="card div--cartao--perfil d-block col-9">
              <div className="card-body py-4">
                <p className="card-text mb-1"><b>Cirurgias Anteriores: </b>{data.historicotratamentosdentariospassados}</p>
                <p className="card-text mb-1"><b>Alergias: </b>{data.alergias}</p>
                <p className="card-text"><b>Raios-X: </b>N/A</p> {/* Oopsie Daisy tenho que arranjar */}
              </div>
            </div>

          </div>

          <div className="row align-items-start mb-3">

            <div className="card div--cartao--header d-block mb-4 col-11">
              <div className="card-body py-2">
                <h5 className="card-title fw-bold m-0">Histórico Dentário</h5>
              </div>
            </div>

            <div className="card div--cartao--perfil d-block col-9">
              <div className="card-body py-4">
                <p className="card-text mb-1"><b>Última Consulta Dentária: </b>10/01/2024</p>
                <p className="card-text mb-1"><b>Motivo da Consulta Inicial: </b>{data.motivoconsultainicial}</p>
                <p className="card-text mb-1"><b>Experiência com anestesia: </b>{anestesia}</p>
                <p className="card-text mb-1"><b>Condições atuais: </b>{data.condicaosaude}</p>
                <p className="card-text"><b>Raios-X: </b><a href="#">Raios-x.pdf</a></p> {/* Oopsie Daisy tenho que arranjar */}
              </div>
            </div>

          </div>
        </div>
        );
    });
    }
}
export default VerPerfil;