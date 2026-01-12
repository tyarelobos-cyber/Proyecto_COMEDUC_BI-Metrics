document.addEventListener('DOMContentLoaded', function() {
    // Mostrar el email del usuario logueado
    const userEmail = localStorage.getItem('comeduc_logged_email') || 'usuario@comeduc.cl';
    document.getElementById('userEmail').textContent = userEmail;
    
    // Verificar si hay usuario logueado
    if (!localStorage.getItem('comeduc_logged_email')) {
        alert('Debe iniciar sesión para acceder al sistema');
        window.location.href = 'login.html';
        return;
    }
    
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
    
    // Manejar cierre de sesión
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('¿Está seguro que desea cerrar sesión?')) {
            localStorage.removeItem('comeduc_logged_email');
            window.location.href = 'login.html';
        }
    });
    
    // Datos de ejemplo para gráficos
    const courses = ['A', 'B', 'C', 'D', 'E'];
    const institutions = ['Institución A', 'Institución B', 'Institución C', 'Institución D', 'Institución E'];
    const competences = ['Comprensión Lectora', 'Producción Escrita', 'Comunicación Oral', 'Vocabulario', 'Gramática y Ortografía'];
    
    // Datos de ejemplo para 1° Medio
    const firstGradeData = {
        courses: courses,
        performance: [78, 82, 75, 85, 79],
        competences: [82, 75, 79, 85, 80]
    };
    
    // Datos de ejemplo para 2° Medio
    const secondGradeData = {
        courses: courses,
        performance: [81, 85, 78, 88, 82],
        competences: [85, 78, 82, 88, 83]
    };
    
    // Datos de ejemplo para instituciones
    const institutionsData = {
        names: institutions,
        performance: [78.5, 72.3, 81.2, 85.7, 76.8]
    };
    
    // Inicializar gráficos
    let coursesComparisonChart, institutionsComparisonChart, competencesChart;
    
    function initializeCharts() {
        // Gráfico de comparación entre cursos
        const coursesCtx = document.getElementById('coursesComparisonChart').getContext('2d');
        coursesComparisonChart = new Chart(coursesCtx, {
            type: 'bar',
            data: {
                labels: courses,
                datasets: [
                    {
                        label: '1° Medio',
                        data: firstGradeData.performance,
                        backgroundColor: '#00447A',
                        borderColor: '#003366',
                        borderWidth: 1
                    },
                    {
                        label: '2° Medio',
                        data: secondGradeData.performance,
                        backgroundColor: '#83B81A',
                        borderColor: '#73BA00',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Rendimiento (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Cursos (A-H)'
                        }
                    }
                }
            }
        });
        
        // Gráfico de comparación entre instituciones
        const institutionsCtx = document.getElementById('institutionsComparisonChart').getContext('2d');
        institutionsComparisonChart = new Chart(institutionsCtx, {
            type: 'bar',
            data: {
                labels: institutionsData.names,
                datasets: [{
                    label: 'Rendimiento Lenguaje',
                    data: institutionsData.performance,
                    backgroundColor: [
                        '#00447A', '#83B81A', '#7BDCFF', '#73BA00', '#EF5350'
                    ],
                    borderColor: [
                        '#003366', '#73BA00', '#5BC0DE', '#5BA000', '#D32F2F'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Rendimiento: ${context.raw}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Rendimiento (%)'
                        }
                    }
                }
            }
        });
        
        // Gráfico de competencias
        const competencesCtx = document.getElementById('competencesChart').getContext('2d');
        competencesChart = new Chart(competencesCtx, {
            type: 'radar',
            data: {
                labels: competences,
                datasets: [
                    {
                        label: '1° Medio',
                        data: firstGradeData.competences,
                        backgroundColor: 'rgba(0, 68, 122, 0.2)',
                        borderColor: '#00447A',
                        borderWidth: 2,
                        pointBackgroundColor: '#00447A'
                    },
                    {
                        label: '2° Medio',
                        data: secondGradeData.competences,
                        backgroundColor: 'rgba(131, 184, 26, 0.2)',
                        borderColor: '#83B81A',
                        borderWidth: 2,
                        pointBackgroundColor: '#83B81A'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // Cargar tabla de resultados
    function loadResultsTable() {
        const tableBody = document.getElementById('resultsTableBody');
        tableBody.innerHTML = '';
        
        // Datos de ejemplo
        const sampleData = [
            { institution: 'Institución A', course: 'A', level: '1° Medio', students: 35, avg: 78, satisfactory: 68, unsatisfactory: 32, trend: 'up' },
            { institution: 'Institución A', course: 'B', level: '1° Medio', students: 32, avg: 82, satisfactory: 75, unsatisfactory: 25, trend: 'up' },
            { institution: 'Institución B', course: 'C', level: '2° Medio', students: 38, avg: 85, satisfactory: 78, unsatisfactory: 22, trend: 'up' },
            { institution: 'Institución B', course: 'D', level: '2° Medio', students: 36, avg: 88, satisfactory: 82, unsatisfactory: 18, trend: 'up' },
            { institution: 'Institución C', course: 'E', level: '1° Medio', students: 34, avg: 79, satisfactory: 70, unsatisfactory: 30, trend: 'down' },
            { institution: 'Institución C', course: 'A', level: '2° Medio', students: 37, avg: 84, satisfactory: 77, unsatisfactory: 23, trend: 'up' },
            { institution: 'Institución D', course: 'B', level: '1° Medio', students: 33, avg: 76, satisfactory: 65, unsatisfactory: 35, trend: 'neutral' },
            { institution: 'Institución D', course: 'C', level: '2° Medio', students: 35, avg: 86, satisfactory: 80, unsatisfactory: 20, trend: 'up' },
            { institution: 'Institución E', course: 'D', level: '1° Medio', students: 31, avg: 80, satisfactory: 72, unsatisfactory: 28, trend: 'up' },
            { institution: 'Institución E', course: 'E', level: '2° Medio', students: 39, avg: 87, satisfactory: 81, unsatisfactory: 19, trend: 'up' }
        ];
        
        sampleData.forEach(item => {
            const row = document.createElement('tr');
            
            // Determinar clase de tendencia
            let trendClass = 'trend-neutral';
            let trendIcon = '<i class="fas fa-minus"></i>';
            let trendText = '0.0%';
            
            if (item.trend === 'up') {
                trendClass = 'trend-up';
                trendIcon = '<i class="fas fa-arrow-up"></i>';
                trendText = '2.3%';
            } else if (item.trend === 'down') {
                trendClass = 'trend-down';
                trendIcon = '<i class="fas fa-arrow-down"></i>';
                trendText = '1.5%';
            }
            
            row.innerHTML = `
                <td>${item.institution}</td>
                <td>${item.course}</td>
                <td>${item.level}</td>
                <td>${item.students}</td>
                <td><strong>${item.avg}%</strong></td>
                <td><span class="satisfactory">${item.satisfactory}%</span></td>
                <td><span class="unsatisfactory">${item.unsatisfactory}%</span></td>
                <td><span class="${trendClass}">${trendIcon} ${trendText}</span></td>
                <td><button class="action-btn view-detail-btn" data-course="${item.course}" data-level="${item.level}">Ver Detalle</button></td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Agregar eventos a los botones de detalle
        document.querySelectorAll('.view-detail-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const course = this.getAttribute('data-course');
                const level = this.getAttribute('data-level');
                showCourseDetail(course, level);
            });
        });
    }
    
    // Mostrar detalle de un curso específico
    function showCourseDetail(course, level) {
        alert(`Mostrando detalle para:\nCurso: ${course}\nNivel: ${level}\n\nAquí se abriría una ventana modal o página con el análisis detallado del curso, incluyendo:\n- Resultados por estudiante\n- Análisis por competencia\n- Comparativa histórica\n- Recomendaciones pedagógicas`);
    }
    
    // Aplicar filtros
    document.getElementById('applyFilters').addEventListener('click', function() {
        const region = document.getElementById('regionFilter').value;
        const institution = document.getElementById('institutionFilter').value;
        const year = document.getElementById('yearFilter').value;
        const grade = document.getElementById('gradeFilter').value;
        const course = document.getElementById('courseFilter').value;
        const semester = document.getElementById('semesterFilter').value;
        const evaluation = document.getElementById('evaluationFilter').value;
        const competence = document.getElementById('competenceFilter').value;
        const viewType = document.getElementById('viewTypeFilter').value;
        
        // Actualizar KPIs según filtros
        updateKPIs(region, institution, year, grade, course, semester);
        
        // Actualizar gráficos
        updateCharts(grade, course, competence);
        
        // Actualizar tabla
        loadFilteredTable(region, institution, grade, course);
        
        // Mostrar mensaje de confirmación
        showNotification('Filtros aplicados correctamente', 'success');
        
        console.log('Filtros aplicados:', {
            region, institution, year, grade, course, semester, evaluation, competence, viewType
        });
    });
    
    // Restablecer filtros
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('regionFilter').value = 'all';
        document.getElementById('institutionFilter').value = 'all';
        document.getElementById('yearFilter').value = '2024';
        document.getElementById('gradeFilter').value = 'all';
        document.getElementById('courseFilter').value = 'all';
        document.getElementById('semesterFilter').value = 'all';
        document.getElementById('evaluationFilter').value = 'all';
        document.getElementById('competenceFilter').value = 'all';
        document.getElementById('viewTypeFilter').value = 'aggregated';
        
        // Restaurar datos originales
        updateKPIs('all', 'all', '2024', 'all', 'all', 'all');
        updateCharts('all', 'all', 'all');
        loadResultsTable();
        
        showNotification('Filtros restablecidos', 'info');
    });
    
    // Exportar datos
    document.getElementById('exportData').addEventListener('click', function() {
        alert('Exportando datos de Lenguaje a Excel...\n\nEl archivo incluirá:\n- Resultados filtrados\n- Datos por curso e institución\n- KPIs y métricas\n- Gráficos en formato imagen');
        
        // Simular descarga
        showNotification('Preparando archivo para descarga...', 'info');
        
        setTimeout(() => {
            showNotification('Archivo exportado correctamente', 'success');
        }, 1500);
    });
    
    // Cambiar vista de tabla
    document.getElementById('toggleView').addEventListener('click', function() {
        const currentView = document.getElementById('viewTypeFilter').value;
        const newView = currentView === 'aggregated' ? 'detailed' : 'aggregated';
        
        document.getElementById('viewTypeFilter').value = newView;
        
        if (newView === 'detailed') {
            alert('Cambiando a vista detallada...\n\nMostrará resultados por estudiante individual');
            document.querySelector('.section-header h4').innerHTML = '<i class="fas fa-table"></i> Detalle de Resultados por Estudiante';
        } else {
            alert('Cambiando a vista agregada...\n\nMostrará resultados agrupados por curso');
            document.querySelector('.section-header h4').innerHTML = '<i class="fas fa-table"></i> Detalle de Resultados por Curso';
        }
        
        showNotification(`Vista cambiada a: ${newView === 'aggregated' ? 'Agregada' : 'Detallada'}`, 'info');
    });
    
    // Descargar tabla
    document.getElementById('downloadTable').addEventListener('click', function() {
        alert('Descargando tabla de resultados en formato CSV...');
        showNotification('Tabla descargada correctamente', 'success');
    });
    
    // Función para actualizar KPIs según filtros
    function updateKPIs(region, institution, year, grade, course, semester) {
        // Simular cálculo de KPIs basado en filtros
        let generalPerformance = 78.5;
        let studentsEvaluated = 1245;
        let satisfactoryLevel = 68;
        let unsatisfactoryLevel = 32;
        
        // Ajustar según filtros
        if (institution !== 'all') {
            generalPerformance += Math.random() * 5 - 2.5;
            studentsEvaluated = Math.floor(studentsEvaluated / 5);
        }
        
        if (grade !== 'all') {
            generalPerformance += (grade === '1medio') ? -2 : 2;
        }
        
        if (course !== 'all') {
            generalPerformance += Math.random() * 4 - 2;
        }
        
        // Actualizar valores en la interfaz
        document.getElementById('generalPerformance').textContent = generalPerformance.toFixed(1) + '%';
        document.getElementById('studentsEvaluated').textContent = studentsEvaluated.toLocaleString();
        document.getElementById('satisfactoryLevel').textContent = satisfactoryLevel + '%';
        document.getElementById('unsatisfactoryLevel').textContent = unsatisfactoryLevel + '%';
    }
    
    // Función para actualizar gráficos
    function updateCharts(grade, course, competence) {
        // Simular actualización de datos según filtros
        if (coursesComparisonChart) {
            if (grade === '1medio') {
                coursesComparisonChart.data.datasets[0].data = firstGradeData.performance;
                coursesComparisonChart.data.datasets[1].data = Array(5).fill(0); // Ocultar 2° medio
            } else if (grade === '2medio') {
                coursesComparisonChart.data.datasets[0].data = Array(5).fill(0); // Ocultar 1° medio
                coursesComparisonChart.data.datasets[1].data = secondGradeData.performance;
            } else {
                coursesComparisonChart.data.datasets[0].data = firstGradeData.performance;
                coursesComparisonChart.data.datasets[1].data = secondGradeData.performance;
            }
            coursesComparisonChart.update();
        }
    }
    
    // Función para cargar tabla filtrada
    function loadFilteredTable(region, institution, grade, course) {
        // En una implementación real, esto haría una petición al servidor
        // Por ahora, simulamos filtrando los datos existentes
        loadResultsTable(); // Recargar tabla completa
        
        if (institution !== 'all' || grade !== 'all' || course !== 'all') {
            showNotification(`Mostrando datos filtrados (${institution}, ${grade}, ${course})`, 'info');
        }
    }
    
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
                document.body.removeChild(notification);
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
                .satisfactory { color: #73BA00; font-weight: 600; }
                .unsatisfactory { color: #EF5350; font-weight: 600; }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Inicializar la página
    initializeCharts();
    loadResultsTable();
    
    // Actualizar KPIs iniciales
    updateKPIs('all', 'all', '2024', 'all', 'all', 'all');
});