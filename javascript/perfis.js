const dropdownItems = document.querySelectorAll('.dropdown-item');
const dropdownButton = document.getElementById('dropdownButton');

var Aberto = 0;

//Selecionar a opção clicada
dropdownItems.forEach(item => {
    item.addEventListener('click', function () {
        //Por texto correspondente no Botão
        dropdownButton.textContent = this.textContent;
        //Desativar o último ativo
        dropdownItems.forEach(item => {
            if (item.classList.contains("active")) {
                item.classList.toggle("active");
            }
        });
        //Ativar o item clicado
        item.classList.add("active");
        //Fechar Dropdown (expecificamente, adicionar o border radius no fundo)
        AbrirDropdown();
    });
});

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


// dropdownButton.style.borderBottomLeftRadius = "0px !important";
// dropdownButton.style.borderBottomRightRadius = "0px !important";