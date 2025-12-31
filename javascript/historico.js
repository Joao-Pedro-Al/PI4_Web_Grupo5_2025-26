const data = document.getElementById('data');
const MenosAno = document.getElementById('AnoPas');
const MaisAno = document.getElementById('AnoFut');

const AnoPresente = document.getElementById('data-9');
const anos = document.querySelectorAll('.ano');
var anos_inv = new Array;
const meses = document.querySelectorAll('.mes');

const hoje = new Date;
var idmes = hoje.getMonth() + 1;
var mes = "";
var anoPre = hoje.getFullYear();
var ano = hoje.getFullYear();

const cartoes = document.querySelectorAll('.card');

function Start()
{
    MesString();
    AnoPresente.textContent = ano;
    ListarAnos();
    // console.log(idmes + " ---- " + mes);
    AtualizarData();
    const Mes = document.getElementById("mes-" + idmes);
    //Ativar Mês Selecionado
    Mes.classList.toggle("h5");
    Mes.classList.toggle("p--data");
    Mes.classList.toggle("h2");
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
        if(item.textContent == ano)
        {
            item.classList.toggle('h5');
            item.classList.toggle('p--data');
            item.classList.toggle('h2');
        }

        if(item.classList.contains('h2') && item.textContent != ano)
        {
            item.classList.toggle('h5');
            item.classList.toggle('p--data');
            item.classList.toggle('h2');
        }
    })
}

MenosAno.addEventListener('click', function() {
    const anomax = parseInt(AnoPresente.textContent);
    AnoPresente.textContent = anomax - 1;
    ListarAnos();

    if(anomax - 1 < anoPre && MaisAno.classList.contains('button--ano--desl'))[MaisAno.classList.toggle('button--ano--desl')]
})

MaisAno.addEventListener('click', function() {
    if(MaisAno.classList.contains('button--ano--desl') == false)
    {
        const anomax = parseInt(AnoPresente.textContent);
        AnoPresente.textContent = anomax + 1;
        ListarAnos();

        if(anomax + 1 == anoPre)[MaisAno.classList.toggle('button--ano--desl')]
    }
})

anos.forEach(item => {
    item.addEventListener('click', function() {
        if(item.classList.contains("h2") == false)
        {
            // //Ativar Mês Selecionado
            // item.classList.toggle("h5");
            // item.classList.toggle("p--data");
            // item.classList.toggle("h2");

            ano = parseInt(item.textContent);
            VerificarAnoSel();
            AtualizarData();
        }
    })
});

meses.forEach(item => {
    item.addEventListener('click', function() {
        if(item.classList.contains("h2") == false)
        {
            // console.log("Mês Anterior: " + idmes);

            const mes_ativo = document.getElementById("mes-" + idmes);

            //Revreter Mês Ativo
            mes_ativo.classList.toggle("h5");
            mes_ativo.classList.toggle("p--data");
            mes_ativo.classList.toggle("h2");

            //Ativar Mês Selecionado
            item.classList.toggle("h5");
            item.classList.toggle("p--data");
            item.classList.toggle("h2");

            const Id_String = item.id;
            idmes = parseInt(Id_String.substring(Id_String.indexOf("-") + 1));

            // console.log("Novo Mês: " + idmes);

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
}

//Verificar se algum foi clicado
cartoes.forEach(item => {
    item.addEventListener('click', function () {
    const Id_String = item.id;
    const Id = Id_String.substring(0, Id_String.indexOf("-"));
    const estado = Id_String.substring(Id_String.indexOf("-") + 1);
    var Idoutro = "";

    // console.log("Id é: " + Id + "||| E o estado é: " + estado);

    if(estado == "aberto"){Idoutro = Id + "-fechado";}
    else if(estado == "fechado"){Idoutro = Id + "-aberto";}
    else{console.log("Id inválido!");}

    const Outro = document.getElementById(Idoutro);
    item.classList.toggle("d-none");
    Outro.classList.toggle("d-none");
    });
});