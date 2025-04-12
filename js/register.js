const checkPass = document.getElementById('password');
const userLocal = JSON.parse(localStorage.getItem("userData")) || [];
const termsCheckbox = document.getElementById('gridCheck');

document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    let isValid = true;

    const fields = [
        { id: 'firstName', message: 'Vui lòng điền họ và tên đệm.' },
        { id: 'lastName', message: 'Vui lòng điền tên.' },
        { id: 'email', message: 'Vui lòng điền email.' },
        { id: 'password', message: 'Vui lòng điền mật khẩu.' },
        { id: 'rePassword', message: 'Vui lòng điền lại mật khẩu.' },
    ];

    fields.forEach(({ id, message }) => {
        const input = document.getElementById(id);
        const errorDiv = input.nextElementSibling;

        if (input.value.trim() === '') {
            showError(input, errorDiv, message);
            isValid = false;
        } else {
            clearError(input, errorDiv);
        }
    });

    const password = document.getElementById('password').value.trim();
    const rePassword = document.getElementById('rePassword').value.trim();
    const passwordCheckDiv = document.getElementById('check');
    const rePasswordCheckDiv = document.getElementById('rePasswordCheck');

    if (password.length < 8 && password !== '') {
        showError(checkPass, passwordCheckDiv, 'Mật khẩu tối thiểu 8 kí tự.');
        isValid = false;
    } else if (password === '') {
    } else {
        clearError(checkPass, passwordCheckDiv);
    }

    if (password !== rePassword && rePassword !== '') {
        showError(document.getElementById('rePassword'), rePasswordCheckDiv, 'Mật khẩu không trùng khớp.');
        isValid = false;
    }

    if (!termsCheckbox.checked) {
        const termsError = document.createElement('div');
        termsError.className = 'text-danger mt-2';
        termsError.textContent = 'Vui lòng đồng ý với điều khoản.';
        termsCheckbox.parentElement.appendChild(termsError);
        isValid = false;
    }

    const email = document.getElementById('email').value.trim();
    const emailExists = userLocal.some(user => user.email === email);
    if (emailExists) {
        showError(document.getElementById('email'), document.getElementById('email').nextElementSibling, 'Email đã được đăng ký.');
        isValid = false;
    }

    if (isValid) {
        const userData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: email,
            password: password
        };

        userLocal.push(userData);
        localStorage.setItem("userData", JSON.stringify(userLocal));
        window.location.href = "../pages/login.html";
    }
});

function showError(input, errorDiv, message) {
    input.classList.add('is-invalid');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function clearError(input, errorDiv) {
    input.classList.remove('is-invalid');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
}

document.querySelectorAll('input').forEach(input => {
    if (input.type !== 'checkbox') {
        input.addEventListener('input', () => {
            let errorDiv;
            if (input.id === 'rePassword') {
                errorDiv = document.getElementById('rePasswordCheck');
            } else {
                errorDiv = input.nextElementSibling;
            }

            clearError(input, errorDiv);
        });
    }
});

