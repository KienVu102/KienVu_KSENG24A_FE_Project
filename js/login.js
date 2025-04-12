document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    let isValid = true;

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const users = JSON.parse(localStorage.getItem('userData')) || [];


    document.getElementById('loginError').style.display = 'none';

    if (email === '') {
        document.getElementById('email').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('email').classList.remove('is-invalid');
    }

    if (password === '') {
        document.getElementById('password').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('password').classList.remove('is-invalid');
    }

    if (isValid) {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            window.location.href = "dashboard.html";
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    }
});

const toastNoti = new bootstrap.Toast(document.getElementById('toastNoti'));
toastNoti.show();   

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function () {
        this.classList.remove('is-invalid');
    });
});