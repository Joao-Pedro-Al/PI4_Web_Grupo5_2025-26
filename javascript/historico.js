const data = document.getElementById('data');
const hoje = new Date;
var idmes = hoje.getMonth() + 1;
var mes = "";
var ano = hoje.getFullYear();

const cartoes = document.querySelectorAll('.card');

function Start()
{
    MesString();
    console.log(idmes + " ---- " + mes);
    data.textContent = mes + " " + ano;
    // data.textContent = hoje.toString();
}

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