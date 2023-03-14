const showLoggedIn = (userName) => {
    const loggedInSection = document.querySelector('.logged-in');
    if (!loggedInSection) {
        return;
    }
    const userNameLoggedInElement = document.querySelector('.logged-in .logged-in-username');
    if (userNameLoggedInElement) {
        userNameLoggedInElement.innerHTML = userName;
    }

    loggedInSection.style.display = "block";
};

const hideLogin = () => {
    const loginSection = document.querySelector('.login');

    if (!loginSection) {
        return;
    }

    loginSection.style.display = "none";
};

const showGroupDropdown = (sheets) => {
    const showGroupSection = document.querySelector('.select-group');
    if (!showGroupSection) {
        return;
    }

    const selectEl = showGroupSection.querySelector('select');
    if (!selectEl) {
        return;
    }

    selectEl.innerHTML = '';
    for (const sheet of sheets) {
        const opt = document.createElement('option');
        opt.setAttribute('value', sheet.title);
        opt.innerHTML = sheet.title;
        selectEl.appendChild(opt);
    }

    showGroupSection.style.display = "block";
};

const loginAndGetGroups = async () => {
    const userNameInput = document.querySelector('#username');
    if (!userNameInput || !userNameInput.value) {
        alert('Veuillez entrer votre nom d\'utilisateur.');
        return;
    }
    const passwordInput = document.querySelector('#password');
    if (!passwordInput || !passwordInput.value) {
        alert('Veuillez entrer votre mot de passe');
        return;
    }
    const loginResponse = await fetch('/api/LoginAndGetGroupsTrigger', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: userNameInput.value,
            password: passwordInput.value
        })
    });
    if (loginResponse.status !== 200) {
        alert("Erreur de login");
        return;
    }
    const responseGroups = await loginResponse.json();
    hideLogin();
    showLoggedIn(userNameInput.value);
    showGroupDropdown(responseGroups);
};

const loginAndGetGroupsButton = document.querySelector('#login-and-get-groups');
if (loginAndGetGroupsButton) {
    loginAndGetGroupsButton.addEventListener('click', loginAndGetGroups);
}