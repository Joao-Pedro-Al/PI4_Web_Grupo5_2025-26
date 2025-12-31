const dropdownItems = document.querySelectorAll('.dropdown-item');
const dropdownButton = document.getElementById('dropdownButton');

const telInput = document.getElementById('telefone');

const perfisItems = document.querySelectorAll('.div--cartao--perfil');

var Aberto = 0;
var TipoSelect = "Todos";

//Selecionar a opção clicada
dropdownItems.forEach(item => {
    item.addEventListener('click', function () {
        //Por texto correspondente no Botão
        TipoSelect = this.textContent;
        dropdownButton.textContent = TipoSelect;
        //Desativar o último ativo
        dropdownItems.forEach(item => {
            if (item.classList.contains("active")) {
                item.classList.toggle("active");
            }
        });
        //Ativar o item clicado
        item.classList.add("active");
        // Listar os Selecionados
        ListarSelecionado(TipoSelect);
        //Fechar Dropdown (expecificamente, adicionar o border radius no fundo)
        AbrirDropdown();
    });
});

// Garantir que seja só números
telInput.addEventListener("keydown", (event) => {
    const tecla = event.code;

    if(tecla != "Digit1" && tecla != "Digit2" && tecla != "Digit3" && tecla != "Digit4" && tecla != "Digit5" && tecla != "Digit6" && tecla != "Digit7" && tecla != "Digit8" && tecla != "Digit9" && tecla != "Digit0" && tecla != "Backspace" && tecla != "Enter")
    {
        console.log("A tecla " + tecla + " é inválida!");
        event.preventDefault();
    }
    else if(telInput.value.length > 8 && tecla != "Backspace" && tecla != "Enter")
    {
        console.log("Número Máximo Atingido");
        event.preventDefault();
    }
});

// Filtrar Número
telInput.addEventListener("input", (event) => {
    var segundo = 0;
    const Tipo = TipoSelect.toLowerCase();
    const Num = telInput.value;

    console.log(Num);
    if(Num != "")
    {
        perfisItems.forEach(item => {
            if (Tipo != "todos")
            {
                if (item.classList.contains(Tipo)) {
                    const text_tel = item.querySelector("p.card-text").textContent.trim();
                    // Esconder todos que não tenham
                    if (text_tel.includes("Telefone: " + Num))
                    {
                        if(item.classList.contains("d-none"))
                        {item.classList.toggle("d-none");}
                        if(segundo == 0)
                        {
                            if(item.classList.contains("offset-xl-3") && item.classList.contains("offset-1")){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-1");}
                            segundo = 1;
                        }
                        else if(segundo == 1)
                        {
                            if(item.classList.contains("offset-xl-3") == false && item.classList.contains("offset-1") == false){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-1");}
                            segundo = 0;
                        }
                    }
                    else
                    {
                        if(item.classList.contains("d-none") == false)
                        {item.classList.toggle("d-none");}
                    }
                }
            }
            else
            {
                const text_tel = item.querySelector("p.card-text").textContent.trim();
                // Esconder todos que não tenham
                if (text_tel.includes("Telefone: " + Num))
                {
                    if(item.classList.contains("d-none"))
                    {item.classList.toggle("d-none");}
                    if(segundo == 0)
                    {
                        if(item.classList.contains("offset-xl-3") && item.classList.contains("offset-1")){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-1");}
                        segundo = 1;
                    }
                    else if(segundo == 1)
                    {
                        if(item.classList.contains("offset-xl-3") == false && item.classList.contains("offset-1") == false){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-1");}
                        segundo = 0;
                    }
                }
                else
                {
                    if(item.classList.contains("d-none") == false)
                    {item.classList.toggle("d-none");}
                }
            }
        });
    }
    else
    {
        MostrarTodos();
        //Garantir que segue os filtros
        ListarSelecionado(dropdownButton.textContent);
    }
});



function ListarSelecionado(tipo)
{
    if(tipo == "Paciente")
    {
        Mostrar1Tipo("paciente");
    }
    else if(tipo == "Doutor")
    {
        Mostrar1Tipo("doutor");
    }
    else
    {
        MostrarTodos();
    }
}

function AbrirDropdown()
{

    if(Aberto == 0)
    {
        dropdownButton.style.borderRadius = "10px 10px 0px 0px";
        Aberto = 1;
    }
    else if(Aberto == 1)
    {
        dropdownButton.style.borderRadius = "10px";
        Aberto = 0;
    }

}

// ------------Mostrar e/ou Esconder-----------

function Mostrar1(Item_Sel)
{
    perfisItems.forEach(item => {
        if(Item == Item_Sel)
        {
            if(item.classList.contains("d-none")){item.classList.toggle("d-none");}
            if(item.classList.contains("offset-xl-3") && item.classList.contains("offset-1")){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-1");}
        }
        else
        {
            if(item.classList.contains("d-none") == false)
            {item.classList.add("d-none");}
        }
    });
}

function Mostrar1Tipo(Tipo)
{
    var segundo = 0;
    const Num = telInput.value;

    perfisItems.forEach(item => {
        const text_tel = item.querySelector("p.card-text").textContent.trim();
        if (item.classList.contains(Tipo) && text_tel.includes("Telefone: " + Num)) {
            if(item.classList.contains("d-none"))
            {
                item.classList.toggle("d-none");
            }
            if(segundo == 0)
            {
                if(item.classList.contains("offset-xl-3") && item.classList.contains("offset-1")){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-1");}
                segundo = 1;
            }
            else if(segundo == 1)
            {
                if(item.classList.contains("offset-xl-3") == false && item.classList.contains("offset-1") == false){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-1");}
                segundo = 0;
            }
        }
        else
        {
            if(item.classList.contains("d-none") == false)
            {item.classList.add("d-none");}
        }
    });
}

function MostrarTodos()
{
    var segundo = 0;
    const Num = telInput.value;

    perfisItems.forEach(item => {
        const text_tel = item.querySelector("p.card-text").textContent.trim();
        if (text_tel.includes("Telefone: " + Num))
        {
            if(item.classList.contains("d-none"))
            {
                item.classList.toggle("d-none");
            }
            if(segundo == 0)
            {
                if(item.classList.contains("offset-xl-3") && item.classList.contains("offset-1")){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-1");}
                segundo = 1;
            }
            else if(segundo == 1)
            {
                if(item.classList.contains("offset-xl-3") == false && item.classList.contains("offset-1") == false){item.classList.toggle("offset-xl-3"); item.classList.toggle("offset-1");}
                segundo = 0;
            }
        }
    });
}