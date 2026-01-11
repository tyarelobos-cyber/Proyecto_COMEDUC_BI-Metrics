// dia-overview.js - Funcionalidades específicas para vista general DIA

document.addEventListener('DOMContentLoaded', function() {
    // Mostrar fecha actual
    function updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = now.toLocaleDateString('es-ES', options);
        document.getElementById('currentDate').textContent = formattedDate;
    }
    
    updateCurrentDate();
    
    // Cargar información del usuario
    const userEmail = localStorage.getItem('comeduc_logged_email') || 'usuario@comeduc.cl';
    document.getElementById('userEmail').textContent = userEmail;
    
    // Extraer nombre del email para mostrar
    const userName = userEmail.split('@')[0];
    document.getElementById('userName').textContent = userName.charAt(0).toUpperCase() + userName.slice(1);
    
    // Verificar si hay usuario logueado
    if (!localStorage.getItem('comeduc_logged_email')) {
        alert('Debe iniciar sesión para acceder al sistema');
        window.location.href = 'login.html';
        return;
    }
    
    // Manejar cierre de sesión
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('¿Está seguro que desea cerrar sesión?')) {
            localStorage.removeItem('comeduc_logged_email');
            window.location.href = 'login.html';
        }
    });
    
    // Inicializar gráfico de distribución por región
    function initializeRegionChart() {
        const ctx = document.getElementById('regionChart').getContext('2d');
        
        const regionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [
                    'Región Metropolitana (68.4%)', 
                    'Región de O\'Higgins (10.5%)', 
                    'Región de Valparaíso (5.3%)', 
                    'Región del Maule (5.3%)', 
                    'Región de Ñuble (10.5%)'
                ],
                datasets: [{
                    data: [68.4, 10.5, 5.3, 5.3, 10.5],
                    backgroundColor: [
                        '#7BDCFF', // Celeste (Metropolitana)
                        '#83B81A', // Verde (O'Higgins)
                        '#00447A', // Azul (Valparaíso)
                        '#0066CC', // Azul claro (Maule)
                        '#F2F3F5'  // Gris (Ñuble)
                    ],
                    borderWidth: 1,
                    borderColor: '#FFFFFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            font: { 
                                size: 12,
                                family: 'Arial, sans-serif'
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}% de instituciones`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
        
        return regionChart;
    }
    
    let regionChart = initializeRegionChart();
    
    // Manejar botones de región
    const regionButtons = document.querySelectorAll('.region-btn');
    regionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase active de todos
            regionButtons.forEach(btn => btn.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            const region = this.getAttribute('data-region');
            
            // Actualizar gráfico según región seleccionada
            updateChartByRegion(region);
            
            // Mostrar información de la región
            showRegionInfo(region);
        });
    });
    
    // Función para actualizar gráfico según región
    function updateChartByRegion(region) {
        // Datos de ejemplo para cada región
        const regionData = {
            'norte': {
                labels: ['Arica y Parinacota (30%)', 'Tarapacá (25%)', 'Antofagasta (45%)'],
                data: [30, 25, 45],
                colors: ['#AEBBC1', '#9CAFAA', '#8AA2A5']
            },
            'centro': {
                labels: ['Valparaíso (40%)', 'O\'Higgins (30%)', 'Maule (30%)'],
                data: [40, 30, 30],
                colors: ['#83B81A', '#73BA00', '#5BA000']
            },
            'sur': {
                labels: ['Biobío (35%)', 'Araucanía (30%)', 'Los Lagos (25%)', 'Aysén (10%)'],
                data: [35, 30, 25, 10],
                colors: ['#00447A', '#0066CC', '#007AFF', '#0088FF']
            },
            'metropolitana': {
                labels: [
                    'Región Metropolitana (68.4%)', 
                    'Región de O\'Higgins (10.5%)', 
                    'Región de Valparaíso (5.3%)', 
                    'Región del Maule (5.3%)', 
                    'Región de Ñuble (10.5%)'
                ],
                data: [68.4, 10.5, 5.3, 5.3, 10.5],
                colors: ['#7BDCFF', '#83B81A', '#00447A', '#0066CC', '#F2F3F5']
            }
        };
        
        const data = regionData[region] || regionData['metropolitana'];
        
        // Actualizar gráfico
        regionChart.data.labels = data.labels;
        regionChart.data.datasets[0].data = data.data;
        regionChart.data.datasets[0].backgroundColor = data.colors;
        regionChart.update();
    }
    
    // Función para mostrar información de región
    function showRegionInfo(region) {
        const regionInfo = {
            'norte': {
                name: 'Zona Norte',
                institutions: 3,
                students: 350,
                performance: '68.2%',
                description: 'Instituciones ubicadas en las regiones del norte de Chile'
            },
            'centro': {
                name: 'Zona Centro',
                institutions: 6,
                students: 720,
                performance: '71.5%',
                description: 'Instituciones en regiones centrales del país'
            },
            'sur': {
                name: 'Zona Sur',
                institutions: 7,
                students: 850,
                performance: '69.8%',
                description: 'Instituciones en regiones del sur de Chile'
            },
            'metropolitana': {
                name: 'Región Metropolitana',
                institutions: 12,
                students: 1450,
                performance: '73.2%',
                description: 'Instituciones en la Región Metropolitana de Santiago'
            }
        };
        
        const info = regionInfo[region] || regionInfo['metropolitana'];
        
        // Actualizar estadísticas (en una implementación real, actualizarías los elementos del DOM)
        console.log(`Región seleccionada: ${info.name}`);
        console.log(`Instituciones: ${info.institutions}`);
        console.log(`Estudiantes: ${info.students}`);
        console.log(`Rendimiento: ${info.performance}`);
        
        // Mostrar notificación
        showNotification(`Mostrando datos de: ${info.name}`, 'info');
    }
    
    // Manejar filtros
    document.getElementById('applyFilters').addEventListener('click', function() {
        const zona = document.getElementById('zonaFilter').value;
        const ano = document.getElementById('anoFilter').value;
        const tipo = document.getElementById('tipoFilter').value;
        
        // Simular aplicación de filtros
        showNotification(`Filtros aplicados: Zona=${zona}, Año=${ano}, Nivel=${tipo}`, 'success');
        
        // Aquí iría la lógica para actualizar datos según filtros
        console.log('Filtros aplicados:', { zona, ano, tipo });
    });
    
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('zonaFilter').value = 'metropolitana';
        document.getElementById('anoFilter').value = '2024';
        document.getElementById('tipoFilter').value = 'all';
        
        showNotification('Filtros restablecidos', 'info');
        
        // Restaurar vista por defecto
        regionButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('.region-btn.metropolitana').classList.add('active');
        updateChartByRegion('metropolitana');
    });
    
    // Función para mostrar notificaciones
    function showNotification(message, type) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'success' ? '#E8F5E9' : type === 'error' ? '#FFEBEE' : '#E3F2FD'};
            color: ${type === 'success' ? '#2E7D32' : type === 'error' ? '#C62828' : '#1565C0'};
            padding: 15px 20px;
            border-radius: 6px;
            border-left: 4px solid ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Agregar animaciones CSS si no existen
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
    
    // Inicializar animaciones
    setTimeout(() => {
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.style.animation = 'fadeInUp 0.5s ease-out forwards';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
        });
        
        // Agregar animación CSS
        const animationStyle = document.createElement('style');
        animationStyle.textContent = `
            @keyframes fadeInUp {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(animationStyle);
    }, 500);
});