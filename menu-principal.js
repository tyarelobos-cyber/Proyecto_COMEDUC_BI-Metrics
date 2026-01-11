document.addEventListener('DOMContentLoaded', function() {
    // Mostrar el email del usuario logueado
    const userEmail = localStorage.getItem('comeduc_logged_email') || 'usuario@comeduc.cl';
    document.getElementById('userEmail').textContent = userEmail;
    
    // Verificar si hay usuario logueado
    if (!localStorage.getItem('comeduc_logged_email')) {
        // Si no hay usuario logueado, redirigir al login
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
    
    // Manejar clic en elementos del menú (excepto el menú principal, DIA Matemáticas y Desglose Detallado)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Si no es el menú principal, DIA Matemáticas ni Desglose Detallado, prevenir acción por ahora
            if (!this.getAttribute('href').includes('menu-principal') && !this.getAttribute('href').includes('dia-matematicas') && !this.getAttribute('href').includes('dia-desglose')) {
                e.preventDefault();
                alert('Esta funcionalidad se implementará en archivos separados próximamente');
                
                // Remover clase active de todos
                navItems.forEach(i => i.classList.remove('active'));
                // Agregar clase active al seleccionado
                this.classList.add('active');
            }
        });
    });
    
    // Manejar clic en los filtros
    const applyFilterBtn = document.querySelector('.apply-filter-btn');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            const region = document.getElementById('regionFilter').value;
            const year = document.getElementById('yearFilter').value;
            const semester = document.getElementById('semesterFilter').value;
            
            // Mostrar mensaje de filtros aplicados
            alert(`Filtros aplicados:\n- Región: ${getRegionName(region)}\n- Año: ${year}\n- Semestre: ${getSemesterName(semester)}`);
            
            // Aquí normalmente se actualizarían los gráficos con los nuevos filtros
            console.log('Filtros aplicados:', { region, year, semester });
        });
    }
    
    // Función para obtener nombre de región
    function getRegionName(value) {
        const regions = {
            'all': 'Todas las regiones',
            'metropolitana': 'Región Metropolitana',
            'valparaiso': 'Valparaíso',
            'biobio': 'Biobío',
            'araucania': 'Araucanía',
            'loslagos': 'Los Lagos'
        };
        return regions[value] || value;
    }
    
    // Función para obtener nombre de semestre
    function getSemesterName(value) {
        const semesters = {
            'all': 'Ambos semestres',
            '1': 'Primer semestre',
            '2': 'Segundo semestre'
        };
        return semesters[value] || value;
    }
    
    // Manejar clic en las regiones del mapa
    const regions = document.querySelectorAll('.region');
    regions.forEach(region => {
        region.addEventListener('click', function() {
            const regionName = this.getAttribute('data-region');
            alert(`Ha seleccionado la región: ${regionName.toUpperCase()}\n\nAquí se mostrarían los detalles de las instituciones de esta región.`);
        });
    });
    
    // Manejar clic en botón de exportar
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            alert('Función de exportación de datos. Aquí se descargaría un archivo Excel con los datos mostrados en la tabla.');
        });
    }
    
    // Simular interacción con la tabla
    const tableRows = document.querySelectorAll('.summary-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            const institution = this.cells[0].textContent;
            const region = this.cells[1].textContent;
            const math = this.cells[2].textContent;
            const language = this.cells[3].textContent;
            const total = this.cells[4].textContent;
            
            // Resaltar la fila seleccionada
            tableRows.forEach(r => r.classList.remove('selected'));
            this.classList.add('selected');
            
            console.log(`Institución seleccionada: ${institution} (${region}) - Matemáticas: ${math}, Lenguaje: ${language}, Total: ${total}`);
        });
    });
    
    // Añadir estilos para fila seleccionada
    const style = document.createElement('style');
    style.textContent = `
        .summary-table tbody tr.selected {
            background-color: #E3F2FD !important;
            border-left: 3px solid #00447A;
        }
    `;
    document.head.appendChild(style);
});