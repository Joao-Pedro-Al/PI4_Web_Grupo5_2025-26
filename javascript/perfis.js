const dropdownItems = document.querySelectorAll('.dropdown-item');
const dropdownButton = document.getElementById('dropdownButton');

dropdownItems.forEach(item => {
    item.addEventListener('click', function () {
        dropdownButton.textContent = this.textContent;
    });
});