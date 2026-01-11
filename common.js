// common.js - Funciones comunes para todas las páginas del sistema

// Verificar autenticación
function checkAuth() {
    if (!localStorage.getItem('comeduc_logged_email')) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Actualizar información del usuario en todas las páginas
function updateUserInfo() {
    const userEmail = localStorage.getItem('comeduc_logged_email');
    if (userEmail) {
        const emailElements = document.querySelectorAll('#userEmail');
        emailElements.forEach(element => {
            element.textContent = userEmail;
        });
        
        // Extraer y mostrar nombre del usuario
        const userName = userEmail.split('@')[0];
        const nameElements = document.querySelectorAll('#userName');
        nameElements.forEach(element => {
            if (element) {
                element.textContent = userName.charAt(0).toUpperCase() + userName.slice(1);
            }
        });
    }
}

// Inicializar fecha actual
function initCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = now.toLocaleDateString('es-ES', options);
    
    const dateElements = document.querySelectorAll('#currentDate');
    dateElements.forEach(element => {
        element.textContent = formattedDate;
    });
}

// Configurar logout
function setupLogout() {
    const logoutButtons = document.querySelectorAll('#logoutBtn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Está seguro que desea cerrar sesión?')) {
                localStorage.removeItem('comeduc_logged_email');
                localStorage.removeItem('comeduc_remember_email');
                window.location.href = 'login.html';
            }
        });
    });
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Icono según tipo
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error' || type === 'danger') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${getNotificationBg(type)};
        color: ${getNotificationColor(type)};
        padding: 15px 20px;
        border-radius: 6px;
        border-left: 4px solid ${getNotificationBorder(type)};
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de tiempo
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Agregar estilos de animación si no existen
    addNotificationStyles();
}

// Funciones auxiliares para notificaciones
function getNotificationBg(type) {
    const bgColors = {
        'success': '#E8F5E9',
        'error': '#FFEBEE',
        'warning': '#FFF3E0',
        'info': '#E3F2FD'
    };
    return bgColors[type] || '#E3F2FD';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#2E7D32',
        'error': '#C62828',
        'warning': '#EF6C00',
        'info': '#1565C0'
    };
    return colors[type] || '#1565C0';
}

function getNotificationBorder(type) {
    const borders = {
        'success': '#4CAF50',
        'error': '#F44336',
        'warning': '#FF9800',
        'info': '#2196F3'
    };
    return borders[type] || '#2196F3';
}

function addNotificationStyles() {
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Inicialización común
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!checkAuth()) return;
    
    // Actualizar información del usuario
    updateUserInfo();
    
    // Inicializar fecha
    initCurrentDate();
    
    // Configurar logout
    setupLogout();
    
    // Configurar navegación activa
    setupActiveNavigation();
});

// Configurar navegación activa
function setupActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'menu-principal.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Formatear números
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Formatear porcentaje
function formatPercent(num) {
    return num.toFixed(1) + '%';
}

// Cargar datos desde localStorage o API
function loadData(key, defaultValue = []) {
    const data = localStorage.getItem(key);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Error parsing data from localStorage:', e);
            return defaultValue;
        }
    }
    return defaultValue;
}

// Guardar datos en localStorage
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving data to localStorage:', e);
        return false;
    }
}

// Exportar a Excel (simulación)
function exportToExcel(data, filename = 'datos_comeduc') {
    showNotification(`Exportando ${data.length} registros a Excel...`, 'info');
    
    // Simular exportación
    setTimeout(() => {
        showNotification('Archivo exportado correctamente', 'success');
        
        // En una implementación real, aquí se generaría el archivo Excel
        console.log('Exportando datos:', data);
        
        // Simular descarga
        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, 1500);
}

// Filtrar datos
function filterData(data, filters) {
    return data.filter(item => {
        for (const key in filters) {
            if (filters[key] !== 'all' && item[key] !== filters[key]) {
                return false;
            }
        }
        return true;
    });
}