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
    showGroupDropdown(responseGroups.sheets);
};

const showMembers = async () => {
    const selectElement = document.querySelector('.select-group select');
    if (!selectElement || !selectElement.value) {
        alert('Veuillez sélectionner un groupe.');
    }
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
    const getMembersResponse = await fetch('/api/GetMembersTrigger', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: userNameInput.value,
            password: passwordInput.value,
            group: selectElement.value
        })
    });
    if (getMembersResponse.status !== 200) {
        alert("Erreur de recherche des membres");
        return;
    }
    const members = await getMembersResponse.json();
    console.log(members);
    if (!members || !members.members) {
        return;
    }
    const membersEl = document.querySelector('.members');
    if (!membersEl) {
        return;
    }
    const groupNameEl = membersEl.querySelector('.group-name');
    if (!groupNameEl) {
        return;
    }
    groupNameEl.innerHTML = selectElement.value;

    const table = membersEl.querySelector('table');
    if (!table) {
        return;
    }

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    for (const member of members.members) {
        const tr = document.createElement('tr');

        const firstNameTd = document.createElement('td');
        firstNameTd.innerHTML = member.firstName;
        tr.appendChild(firstNameTd);

        const lastNameTd = document.createElement('td');
        lastNameTd.innerHTML = member.lastName;
        tr.appendChild(lastNameTd);

        const phoneNumberTd = document.createElement('td');
        phoneNumberTd.innerHTML = member.phoneNumber || '';
        tr.appendChild(phoneNumberTd);

        tbody.appendChild(tr);
    }

    membersEl.style.display = "block";
};

const sendSMS = () => {
    const groupNameElement = document.querySelector('.members .group-name');
    if (!groupNameElement || !groupNameElement.value) {
        alert('Veuillez sélectionner un groupe.');
        return;
    }
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
    const textareaEl = document.querySelector('.message');
    alert('Sending message ' + textareaEl.value);

};

const loginAndGetGroupsButton = document.querySelector('#login-and-get-groups');
if (loginAndGetGroupsButton) {
    loginAndGetGroupsButton.addEventListener('click', loginAndGetGroups);
}

const showMembersButton = document.querySelector('#show-members');
if (showMembersButton) {
    showMembersButton.addEventListener('click', showMembers);
}

const sendSmsButton = document.querySelector('#send-sms');
if (sendSmsButton) {
    sendSmsButton.addEventListener('click', sendSMS);
}