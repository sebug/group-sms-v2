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

const sendSMS = async () => {
    const groupNameElement = document.querySelector('.members .group-name');
    if (!groupNameElement || !groupNameElement.innerHTML) {
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
    const trs = document.querySelectorAll('.members tbody tr');
    const confirmation = confirm('Êtes-vous sûr de vouloir envoyer ce message à ' +
    trs.length + ' membres: "' +
    textareaEl.value + '"?');
    if (!confirmation) {
        return;
    }
    const sendSMSResponse = await fetch('/api/SendSMSTrigger', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: userNameInput.value,
            password: passwordInput.value,
            group: groupNameElement.innerHTML,
            message: textareaEl.value
        })
    });
    if (sendSMSResponse.status !== 200) {
        alert('Erreur d\'envoi des SMS');
    }
    const sendResponse = await sendSMSResponse.json();
    if (!sendResponse || !sendResponse.sendResults) {
        return;
    }
    const sendResultsEl = document.querySelector('.send-results');
    if (!sendResultsEl) {
        return;
    }
    const ul = sendResultsEl.querySelector('ul');
    if (!ul) {
        return;
    }
    ul.innerHTML = '';

    for (const sendResult of sendResponse.sendResults) {
        const li = document.createElement('li');
        li.innerHTML = sendResult.member.firstName + ' ' + sendResult.member.lastName + ': ' + sendResult.result;
        if (sendResult.result != 'envoyé') {
            li.style.color = 'red';
        } else {
            li.style.color = 'green';
        }
        ul.appendChild(li);
    }

    sendResultsEl.style.display = "block";
    const membersElement = document.querySelector('.members');
    membersElement.style.display = "none";
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