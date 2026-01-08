document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Crear elementos para mensajes
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i><span></span>';
    
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = '<i class="fas fa-check-circle"></i><span>Inicio de sesión exitoso. Redirigiendo al menú principal...</span>';
    
    // Insertar mensajes antes del formulario
    loginForm.parentNode.insertBefore(errorMessage, loginForm);
    loginForm.parentNode.insertBefore(successMessage, loginForm);
    
    // Validar correos permitidos
    function isValidEmail(email) {
        // Correos @comeduc.cl o el correo especial
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(comeduc\.cl|insucoabg\.cl)$/;
        return emailRegex.test(email);
    }
    
    // Validar correo específico @comeduc.cl o el correo especial
    function isAllowedEmail(email) {
        return email.endsWith('@comeduc.cl') || email === 'tyarelobos@insucoabg.cl';
    }
    
    // Validar contraseña
    function isValidPassword(password) {
        return password === 'Comeduc2026';
    }
    
    // Mostrar mensaje de error
    function showError(message) {
        errorMessage.querySelector('span').textContent = message;
        errorMessage.classList.add('show');
        successMessage.classList.remove('show');
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
    
    // Mostrar mensaje de éxito
    function showSuccess() {
        errorMessage.classList.remove('show');
        successMessage.classList.add('show');
    }
    
    // Manejar el envío del formulario
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validar formato de correo
        if (!isValidEmail(email)) {
            showError('Formato de correo inválido. Use correo @comeduc.cl o tyarelobos@insucoabg.cl');
            emailInput.focus();
            return;
        }
        
        // Validar si el correo está permitido
        if (!isAllowedEmail(email)) {
            showError('Acceso denegado. Solo personal autorizado de COMEDUC puede acceder.');
            emailInput.focus();
            return;
        }
        
        // Validar contraseña
        if (!isValidPassword(password)) {
            showError('Contraseña incorrecta. Use la contraseña predeterminada: Comeduc2026');
            passwordInput.focus();
            return;
        }
        
        // Si todas las validaciones pasan
        showSuccess();
        
        // Guardar estado de sesión si está marcado "Recordar sesión"
        const rememberSession = document.getElementById('remember').checked;
        if (rememberSession) {
            localStorage.setItem('comeduc_remember_email', email);
        } else {
            localStorage.removeItem('comeduc_remember_email');
        }
        
        // Guardar email del usuario logueado para usar en el dashboard
        localStorage.setItem('comeduc_logged_email', email);
        
        // Simular carga y redirección al menú principal
        console.log('Inicio de sesión exitoso para:', email);
        console.log('Redirigiendo a menu-principal.html...');
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'menu-principal.html';
        }, 1500);
    });
    
    // Cargar correo recordado si existe
    const rememberedEmail = localStorage.getItem('comeduc_remember_email');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
    
    // Validación en tiempo real para el correo
    emailInput.addEventListener('blur', function() {
        const email = emailInput.value.trim();
        
        if (email && !isValidEmail(email)) {
            emailInput.style.borderColor = '#C62828';
        } else if (email && !isAllowedEmail(email)) {
            emailInput.style.borderColor = '#FF9800';
        } else if (email) {
            emailInput.style.borderColor = '#73BA00';
        } else {
            emailInput.style.borderColor = '#ddd';
        }
    });
    
    // Validación en tiempo real para la contraseña
    passwordInput.addEventListener('input', function() {
        if (passwordInput.value && !isValidPassword(passwordInput.value)) {
            passwordInput.style.borderColor = '#C62828';
        } else if (passwordInput.value) {
            passwordInput.style.borderColor = '#73BA00';
        } else {
            passwordInput.style.borderColor = '#ddd';
        }
    });
    
    // Agregar funcionalidad para mostrar/ocultar contraseña
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'password-container';
    
    // Mover el input de contraseña al nuevo contenedor
    const passwordGroup = passwordInput.parentNode;
    passwordGroup.appendChild(passwordContainer);
    passwordContainer.appendChild(passwordInput);
    
    // Crear toggle para mostrar/ocultar contraseña
    const togglePassword = document.createElement('span');
    togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
    togglePassword.className = 'toggle-password';
    
    passwordContainer.appendChild(togglePassword);
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Cambiar icono
        const icon = togglePassword.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
});