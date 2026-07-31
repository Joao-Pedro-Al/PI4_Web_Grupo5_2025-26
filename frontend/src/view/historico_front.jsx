import { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";

import url from "./url_global";
import id_Perfil from "./id_global";

import axios from "axios";
const urlAPI = url + "consultas/list/" + id_Perfil;
const urlAPI_Tipo = url + "consultas/tipomarcacao/list";

import '../historico_pac.css';

import ConsultaHistorico from "./Consulta_Historico";

const Historico_Front = () => {
  const [dataConsul, setdataConsul] = useState([]);
  const [dataConsulMes, setdataConsulMes] = useState([]);
  
  const [dataTipoCon, setdataTipoCon] = useState([]);

  const hoje = new Date;
  const stateAno = useRef(hoje.getFullYear());
  const iniciado = useRef(0);

  const [Ano_Sel, setAno_Sel] = useState(hoje.getFullYear());
  const [Mes_Sel, setMes_Sel] = useState(hoje.getMonth());

    // Carregar Consultas
    useEffect(() => {
        CarregarConsultas();
        CarregarTipoConta();
    }, [])

    useEffect(() => {
      CarregarConsultasMes();
    }, [dataConsul, Ano_Sel, Mes_Sel])

    useEffect(() => {
        const data = document.getElementById('data');
        const MenosAno = document.getElementById('AnoPas');
        const MaisAno = document.getElementById('AnoFut');

        const AnoPresente = document.getElementById('data-9');
        const anos = document.querySelectorAll('.ano');
        const meses = document.querySelectorAll('.mes');

        var idmes;
        var mes;
        const anoPre = hoje.getFullYear();
        var ano = stateAno.current;

        const cartoes = document.querySelectorAll('.card');

        if(iniciado.current == 0){Start(); iniciado.current = 1;}

        function Start()
        {
          // Declarar
          idmes = hoje.getMonth() + 1;
          mes = "";
          ano = stateAno.current;

          MesString();
          AnoPresente.textContent = ano;
          ListarAnos();
          AtualizarData();
          const Mes = document.getElementById("mes-" + idmes);
          //Ativar Mês Selecionado
          Mes.classList.remove("h5");
          Mes.classList.remove("p--data");
          Mes.classList.add("h2");
        }

        function ListarAnos()
        {
            const anomax = parseInt(AnoPresente.textContent);
            var menos = 1;
            
            for(var i = 8; i >= 1; i--){
                const A = document.getElementById("data-" + i);
                A.textContent = anomax - menos;
                menos += 1;
            }

            VerificarAnoSel();
        }

        function VerificarAnoSel()
        {
            anos.forEach(item => {
                if(item.textContent == stateAno.current)
                {
                    item.classList.remove('h5');
                    item.classList.remove('p--data');
                    item.classList.add('h2');
                }

                if(item.classList.contains('h2') && item.textContent != stateAno.current)
                {
                    item.classList.add('h5');
                    item.classList.add('p--data');
                    item.classList.remove('h2');
                }
            })
        }

        const MenosClick = () => {
          const anomax = parseInt(AnoPresente.textContent);
          AnoPresente.textContent = anomax - 1;
          ListarAnos();

          if(anomax - 1 < anoPre && MaisAno.classList.contains('button--ano--desl')) {
              MaisAno.classList.toggle('button--ano--desl');
          }
        };

        const MaisClick = () => {
          if(MaisAno.classList.contains('button--ano--desl') == false) {
            const anomax = parseInt(AnoPresente.textContent);
            AnoPresente.textContent = anomax + 1;
            ListarAnos();

            if(anomax + 1 == anoPre) {
                MaisAno.classList.toggle('button--ano--desl');
            }
          }
        };

        MenosAno.addEventListener('click', MenosClick);
        MaisAno.addEventListener('click', MaisClick);

        anos.forEach(item => {
            item.addEventListener('click', function() {
                if(item.classList.contains("h2") == false)
                {
                    ano = parseInt(item.textContent);
                    stateAno.current = ano;
                    VerificarAnoSel();
                    AtualizarData();
                }
            })
        });

        meses.forEach(item => {
            item.addEventListener('click', function() {
                if(item.classList.contains("h2") == false)
                {
                    const mes_ativo = document.getElementById("mes-" + idmes);

                    //Revreter Mês Ativo
                    mes_ativo.classList.add("h5");
                    mes_ativo.classList.add("p--data");
                    mes_ativo.classList.remove("h2");

                    //Ativar Mês Selecionado
                    item.classList.remove('h5');
                    item.classList.remove('p--data');
                    item.classList.add('h2');

                    const Id_String = item.id;
                    idmes = parseInt(Id_String.substring(Id_String.indexOf("-") + 1));

                    AtualizarData();
                }
            })
        });

        function MesString()
        {
            switch(idmes)
            {
                case 1:
                    mes = "Jan";
                    break;
                case 2:
                    mes = "Fev";
                    break;
                case 3:
                    mes = "Mar";
                    break;
                case 4:
                    mes = "Abr";
                    break;
                case 5:
                    mes = "Mai";
                    break;
                case 6:
                    mes = "Jun";
                    break;
                case 7:
                    mes = "Jul";
                    break;
                case 8:
                    mes = "Ago";
                    break;
                case 9:
                    mes = "Set";
                    break;
                case 10:
                    mes = "Out";
                    break;
                case 11:
                    mes = "Nov";
                    break;
                case 12:
                    mes = "Dez";
                    break;
            }
        }

        function AtualizarData(){
            MesString();
            data.textContent = mes + " " + ano;
            setAno_Sel(ano);
            setMes_Sel(idmes);
        }

        const ButaoClicado = (item) => {
            const Id_String = item.id;
            const Id = Id_String.substring(0, Id_String.indexOf("-"));
            const estado = Id_String.substring(Id_String.indexOf("-") + 1);
            var Idoutro = "";

            console.log("Id é: " + Id + "||| E o estado é: " + estado);

            if(estado == "aberto"){Idoutro = Id + "-fechado";}
            else if(estado == "fechado"){Idoutro = Id + "-aberto";}
            else{console.log("Id inválido!");}

            const Outro = document.getElementById(Idoutro);
            item.classList.add("d-none");
            Outro.classList.remove("d-none");
        };

        //Verificar se algum foi clicado
        cartoes.forEach(item => {item.addEventListener('click', () => ButaoClicado(item));});

        return () => {
          MenosAno.removeEventListener('click', MenosClick);
          MaisAno.removeEventListener('click', MaisClick);
          cartoes.forEach(item => {
            item.removeEventListener('click', () => ButaoClicado(item));
          });
        };

    }, [dataConsul, dataConsulMes]);

    function CarregarConsultas() {
      axios.get(urlAPI)
      .then(res => {
      if(res.data.success){
      const data = res.data.data;
      setdataConsul(data);
      }else{
      alert("Error Web Service!");
      }
      })
      .catch(error => {
      alert(error)
      });
    }

    function CarregarConsultasMes() {
      const datames = dataConsul.filter((data) => {
        const dataconsul = new Date(data.data);
        const consul_mes = dataconsul.getMonth() + 1;
        const consul_ano = dataconsul.getFullYear();

        return consul_mes == Mes_Sel && consul_ano == Ano_Sel;
      });

      console.log("Debug: " + datames);

      setdataConsulMes(datames);
    }

    function CarregarTipoConta() {
      axios.get(urlAPI_Tipo)
      .then(res => {
      if(res.data.success){
      const data = res.data.data;
      setdataTipoCon(data);
      }else{
      alert("Error Web Service!");
      }
      })
      .catch(error => {
      alert(error)
      });
    }
    
    return (
      <div className="container-fluid">

        {/* <!-- //// Navegação da Data //// --> */}
        <div className="row mb-5">

          <div className="row align-items-center col-sm-12 col-lg-3 mb-sm-3 mb-lg-0">
            <div className="div--cartao--data col-12 px-4 py-3 text-center">
              <h1 id="data">....</h1>
            </div>
          </div>

          <span className="span--vr col-auto d-none d-lg-block mx-4 px-0"></span>

          <div className="row col-sm-12 col-lg-8">

            <div className="row align-items-start col-12 mx-sm-auto mx-lg-0">
              <button className="button--ano col-auto px-2 me-auto me-lg-1" id="AnoPas"><i className="bi bi-chevron-left text-white fs-5"></i></button>
              <p className="h5 col-auto p--data ano d-none d-xl-block" id="data-1">...</p>
              <p className="h5 col-auto p--data ano d-none d-xl-block" id="data-2">...</p>
              <p className="h5 col-auto p--data ano d-none d-xl-block" id="data-3">...</p>
              <p className="h5 col-auto p--data ano d-none d-xl-block" id="data-4">...</p>
              <p className="h5 col-auto p--data ano d-none d-lg-block" id="data-5">...</p>
              <p className="h5 col-auto p--data ano" id="data-6">...</p>
              <p className="h5 col-auto p--data ano" id="data-7">...</p>
              <p className="h5 col-auto p--data ano" id="data-8">...</p>
              <p className="h5 col-auto p--data ano" id="data-9">...</p>
              <button className="button--ano col-auto px-2 ms-auto ms-lg-1 button--ano--desl" id="AnoFut"><i className="bi bi-chevron-right text-white fs-5"></i></button>
            </div>

            {/* <!-- /// Meses /// --> */}
            <div className="row align-items-end col-12">
              <div className="row div__div--meses col-12 col-xl-auto">
                <p className="h5 col-2 col-xl-auto align-self-end p--data mes" id="mes-1">Jan</p>
                <p className="h5 col-2 col-xl-auto align-self-end p--data mes" id="mes-2">Fev</p>
                <p className="h5 col-2 col-xl-auto align-self-end p--data mes" id="mes-3">Mar</p>
                <p className="h5 col-2 col-xl-auto align-self-end p--data mes" id="mes-4">Abr</p>
                <p className="h5 col-2 col-xl-auto align-self-end p--data mes" id="mes-5">Mai</p>
                <p className="h5 col-2 col-xl-auto align-self-end p--data mes" id="mes-6">Jun</p>
              </div>
              <div className="row div__div--meses col-12 col-xl-auto">
                <p className="h5 col-2 col-xl-auto align-self-end p--data mes" id="mes-7">Jul</p>
                <p className="h5 col-2 col-xl-auto align-self-end p--data mes" id="mes-8">Ago</p>
                <p className="h5 col-2 col-xl-auto align-self-end p--data mes" id="mes-9">Set</p>
                <p className="h5 col-2 col-xl-auto align-self-end p--data mes" id="mes-10">Out</p>
                <p className="h5 col-2 col-xl-auto align-self-end p--data mes" id="mes-11">Nov</p>
                <p className="h5 col-2 col-xl-auto align-self-end p--data mes" id="mes-12">Dez</p>
              </div>
            </div>

          </div>

        </div>

        {/* <!-- //// Navegação da Data //// --> */}
        {/* <div className="row d-flex align-items-start mb-5">

          <div className="row col-sm-12 col-lg-5">
            <LoadConsultasDataPar />
          </div>
          <div className="row col-sm-12 col-lg-5 offset-lg-1">
            <LoadConsultasDataImpar />
          </div>
      </div> */}
      <LoadConsultas/>
    </div>
  );

  function LoadConsultas(){
    if(dataConsulMes.length > 0){
      return(
        <div className="row d-flex align-items-start mb-5">
            <div className="row col-sm-12 col-lg-5">
              <LoadConsultasDataPar />
            </div>

            {/* <!-- /// Próxima Coluna /// --> */}
            <div className="row col-sm-12 col-lg-5 offset-lg-1">
              <LoadConsultasDataImpar />
            </div>
        </div>
      );
    }
    else{
      return(
        <div className="row d-flex align-items-center mb-5">
            <h4 className="text-center mt-5">Não houve consultas neste mês...</h4>
        </div>
      );
    }
  }

  function LoadConsultasDataPar(){
    return dataConsulMes.map((data, index) => {
      if(index % 2 == 0){
        const titulo = Titulo(data.tipomarcacao);
        return (
            <ConsultaHistorico key={index} titulo={titulo} horas={data.hora} data={data.data} detalhes={data.detalhes} guia={data.guia_tratamento} idCon={data.idconsulta} />
        );
      }
    });
  }

  function LoadConsultasDataImpar(){
    return dataConsulMes.map((data, index) => {
      if(index % 2 != 0){
        const titulo = Titulo(data.tipomarcacao);
        console.log("Resultado: " + titulo);
        return (
            <ConsultaHistorico key={index} titulo={titulo} horas={data.hora} data={data.data} detalhes={data.detalhes} guia={data.guia_tratamento} idCon={data.idconsulta} />
        );
      }
    });
  }

  function Titulo(Tipo){
    const tip = dataTipoCon.find((tip) => tip.idtipomarcacao == Tipo);
    if(tip){return tip.designacao;}
    return "Erro...";
  }
}
<div className="row d-flex flex-column align-items-center justify-content-center mb-5" style={{minHeight: "300px"}}>
  <i className="bi bi-calendar-x" style={{fontSize: "48px", color: "#A99C5E", opacity: 0.6}}></i>
  <h4 className="text-center mt-3 text-secondary">Não houve consultas neste mês...</h4>
</div>
export default Historico_Front;