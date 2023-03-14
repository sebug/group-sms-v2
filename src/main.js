const showLoggedIn = (userName) => {
    const loggedInSection = document.querySelector('.logged-in');
    if (!loggedInSection) {
        return;
    }
    const userNameLoggedInElement = document.querySelector('.logged-in .logged-in-username');
    if (userNameLoggedInElement) {
        userNameLoggedInElement.innerHTML = userName;
    }

    loggedInSection.style.display = "";
};

const hideLogin = () => {
    const loginSection = document.querySelector('.login');

    if (!loginSection) {
        return;
    }

    loginSection.style.display = "none";
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
};

const loginAndGetGroupsButton = document.querySelector('#login-and-get-groups');
if (loginAndGetGroupsButton) {
    loginAndGetGroupsButton.addEventListener('click', loginAndGetGroups);
}