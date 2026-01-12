// cargar-excel.js - Funcionalidad para cargar archivos Excel a Supabase

document.addEventListener('DOMContentLoaded', async function() {
    // Configuración de Supabase
    const supabaseUrl = 'https://oxcvsiigbaezifoniqbz.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Y3ZzaWlnYmFlemlmb25pcWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTA0NTQsImV4cCI6MjA4MjcyNjQ1NH0.OYeRSNpuDy9HgZNoDZS5D6hlOP4EylPHPlTVdNrV5wI';
    
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    // Variables globales
    let currentFile = null;
    let parsedData = null;
    let fileData = null;
    
    // Inicializar funcionalidades
    initUploadArea();
    loadUploadHistory();
    
    // Inicializar área de upload
    function initUploadArea() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');
        const clearBtn = document.getElementById('clearFile');
        const processBtn = document.getElementById('processFile');
        const uploadBtn = document.getElementById('uploadToDB');
        
        // Evento para botón de buscar archivo
        browseBtn.addEventListener('click', () => fileInput.click());
        
        // Evento para selección de archivo
        fileInput.addEventListener('change', handleFileSelect);
        
        // Evento para drag & drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelect({ target: fileInput });
            }
        });
        
        // Evento para limpiar archivo
        clearBtn.addEventListener('click', clearFile);
        
        // Evento para procesar archivo
        processBtn.addEventListener('click', processFile);
        
        // Evento para subir a BD
        uploadBtn.addEventListener('click', uploadToDatabase);
        
        // Evento para validar datos
        document.getElementById('validateData').addEventListener('click', validateData);
        
        // Evento para descargar plantilla
        document.getElementById('downloadTemplate').addEventListener('click', downloadTemplate);
    }
    
    // Manejar selección de archivo
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validar tipo de archivo
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
            'application/csv'
        ];
        
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
            showNotification('Formato de archivo no válido. Use .xlsx, .xls o .csv', 'error');
            return;
        }
        
        // Validar tamaño (10MB máximo)
        if (file.size > 10 * 1024 * 1024) {
            showNotification('Archivo muy grande. Máximo 10MB', 'error');
            return;
        }
        
        currentFile = file;
        
        // Mostrar información del archivo
        document.getElementById('fileInfo').textContent = 
            `Archivo seleccionado: ${file.name} (${formatBytes(file.size)})`;
        
        // Habilitar botones
        document.getElementById('processFile').disabled = false;
        
        showNotification(`Archivo "${file.name}" cargado correctamente`, 'success');
    }
    
    // Procesar archivo Excel
    async function processFile() {
        if (!currentFile) {
            showNotification('No hay archivo seleccionado', 'error');
            return;
        }
        
        try {
            showNotification('Procesando archivo Excel...', 'info');
            
            const data = await readExcelFile(currentFile);
            parsedData = data;
            
            // Mostrar vista previa
            showDataPreview(data);
            
            // Habilitar botón de subir
            document.getElementById('uploadToDB').disabled = false;
            
            showNotification('Archivo procesado correctamente', 'success');
            
        } catch (error) {
            console.error('Error procesando archivo:', error);
            showNotification('Error al procesar el archivo', 'error');
        }
    }
    
    // Leer archivo Excel
    function readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Tomar la primera hoja
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    
                    // Convertir a formato estructurado
                    const headers = jsonData[0];
                    const rows = jsonData.slice(1);
                    
                    const structuredData = rows.map(row => {
                        const obj = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index] || null;
                        });
                        return obj;
                    }).filter(row => Object.values(row).some(val => val !== null));
                    
                    resolve({
                        headers: headers,
                        data: structuredData,
                        totalRows: structuredData.length
                    });
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Mostrar vista previa de datos
    function showDataPreview(data) {
        const headersRow = document.getElementById('previewHeaders');
        const previewBody = document.getElementById('previewBody');
        const statsDiv = document.getElementById('uploadStats');
        
        // Limpiar tabla
        headersRow.innerHTML = '';
        previewBody.innerHTML = '';
        
        // Mostrar encabezados
        data.headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headersRow.appendChild(th);
        });
        
        // Mostrar primeras 10 filas
        const previewRows = data.data.slice(0, 10);
        previewRows.forEach(row => {
            const tr = document.createElement('tr');
            
            data.headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header] || '';
                tr.appendChild(td);
            });
            
            previewBody.appendChild(tr);
        });
        
        // Mostrar estadísticas
        statsDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <i class="fas fa-info-circle"></i> 
                    <strong>${data.totalRows} registros</strong> encontrados en el archivo
                </div>
                <div>
                    <span class="trend-up"><i class="fas fa-check-circle"></i> Formato válido</span>
                </div>
            </div>
        `;
    }
    
    // Validar datos
    function validateData() {
        if (!parsedData) {
            showNotification('No hay datos para validar', 'error');
            return;
        }
        
        const tipoDatos = document.getElementById('tipoDatos').value;
        if (!tipoDatos) {
            showNotification('Seleccione el tipo de datos primero', 'warning');
            return;
        }
        
        // Validaciones según tipo de datos
        let validationErrors = [];
        
        switch(tipoDatos) {
            case 'matematicas':
            case 'lenguaje':
                validationErrors = validateEvaluationData(parsedData.data);
                break;
            case 'estudiantes':
                validationErrors = validateStudentData(parsedData.data);
                break;
            case 'instituciones':
                validationErrors = validateInstitutionData(parsedData.data);
                break;
        }
        
        if (validationErrors.length === 0) {
            showNotification('✅ Datos validados correctamente', 'success');
        } else {
            showNotification(`⚠️ Se encontraron ${validationErrors.length} errores en la validación`, 'warning');
            console.log('Errores de validación:', validationErrors);
        }
    }
    
    // Funciones de validación
    function validateEvaluationData(data) {
        const errors = [];
        const requiredFields = ['EstudianteID', 'Curso', 'Nivel', 'Puntaje', 'FechaEvaluacion'];
        
        data.forEach((row, index) => {
            requiredFields.forEach(field => {
                if (!row[field]) {
                    errors.push(`Fila ${index + 2}: Campo requerido "${field}" está vacío`);
                }
            });
            
            // Validar puntaje numérico
            if (row.Puntaje && (isNaN(row.Puntaje) || row.Puntaje < 0 || row.Puntaje > 100)) {
                errors.push(`Fila ${index + 2}: Puntaje debe ser entre 0 y 100`);
            }
        });
        
        return errors;
    }
    
    function validateStudentData(data) {
        const errors = [];
        const requiredFields = ['RUT', 'Nombre', 'Apellido', 'Institucion', 'Nivel'];
        
        data.forEach((row, index) => {
            requiredFields.forEach(field => {
                if (!row[field]) {
                    errors.push(`Fila ${index + 2}: Campo requerido "${field}" está vacío`);
                }
            });
        });
        
        return errors;
    }
    
    // Subir datos a Supabase
    async function uploadToDatabase() {
        if (!parsedData) {
            showNotification('No hay datos procesados para subir', 'error');
            return;
        }
        
        const tipoDatos = document.getElementById('tipoDatos').value;
        const ano = document.getElementById('anoDatos').value;
        const semestre = document.getElementById('semestreDatos').value;
        const nivel = document.getElementById('nivelDatos').value;
        
        if (!tipoDatos) {
            showNotification('Seleccione el tipo de datos primero', 'warning');
            return;
        }
        
        try {
            showNotification('Subiendo datos a la base de datos...', 'info');
            
            // Preparar datos para Supabase
            const dataToUpload = parsedData.data.map(row => ({
                ...row,
                tipo_datos: tipoDatos,
                ano: ano,
                semestre: semestre,
                nivel: nivel === 'all' ? null : nivel,
                fecha_carga: new Date().toISOString(),
                usuario: localStorage.getItem('comeduc_logged_email')
            }));
            
            // Determinar tabla según tipo de datos
            let tableName;
            switch(tipoDatos) {
                case 'matematicas':
                    tableName = 'evaluaciones_matematicas';
                    break;
                case 'lenguaje':
                    tableName = 'evaluaciones_lenguaje';
                    break;
                case 'estudiantes':
                    tableName = 'estudiantes';
                    break;
                case 'instituciones':
                    tableName = 'instituciones';
                    break;
                default:
                    tableName = 'evaluaciones_generales';
            }
            
            // Insertar datos en Supabase
            const { data, error } = await supabase
                .from(tableName)
                .insert(dataToUpload);
            
            if (error) {
                throw error;
            }
            
            // Guardar registro en historial
            await saveUploadHistory({
                nombre_archivo: currentFile.name,
                tipo_datos: tipoDatos,
                total_registros: parsedData.totalRows,
                ano: ano,
                semestre: semestre,
                estado: 'completado',
                usuario: localStorage.getItem('comeduc_logged_email')
            });
            
            // Actualizar historial
            loadUploadHistory();
            
            showNotification(`✅ ${parsedData.totalRows} registros subidos correctamente a la base de datos`, 'success');
            
            // Limpiar después de subir
            setTimeout(() => {
                clearFile();
            }, 2000);
            
        } catch (error) {
            console.error('Error subiendo a la base de datos:', error);
            showNotification(`Error al subir datos: ${error.message}`, 'error');
        }
    }
    
    // Guardar historial de carga
    async function saveUploadHistory(uploadData) {
        try {
            const { data, error } = await supabase
                .from('historial_cargas')
                .insert([{
                    ...uploadData,
                    fecha_carga: new Date().toISOString()
                }]);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error guardando historial:', error);
        }
    }
    
    // Cargar historial de cargas
    async function loadUploadHistory() {
        try {
            const { data, error } = await supabase
                .from('historial_cargas')
                .select('*')
                .order('fecha_carga', { ascending: false })
                .limit(10);
            
            if (error) throw error;
            
            const historyBody = document.getElementById('historyBody');
            historyBody.innerHTML = '';
            
            if (data && data.length > 0) {
                data.forEach(item => {
                    const tr = document.createElement('tr');
                    
                    tr.innerHTML = `
                        <td>${formatDate(item.fecha_carga)}</td>
                        <td>${item.nombre_archivo}</td>
                        <td><span class="badge">${item.tipo_datos}</span></td>
                        <td>${item.total_registros}</td>
                        <td><span class="status-badge ${item.estado}">${item.estado}</span></td>
                        <td>${item.usuario}</td>
                        <td>
                            <button class="action-btn view-history" data-id="${item.id}">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                        </td>
                    `;
                    
                    historyBody.appendChild(tr);
                });
                
                // Agregar eventos a los botones de ver
                document.querySelectorAll('.view-history').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        viewUploadDetails(id);
                    });
                });
            } else {
                historyBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
                            <i class="fas fa-inbox"></i> No hay historial de cargas
                        </td>
                    </tr>
                `;
            }
            
        } catch (error) {
            console.error('Error cargando historial:', error);
        }
    }
    
    // Ver detalles de carga
    async function viewUploadDetails(id) {
        try {
            const { data, error } = await supabase
                .from('historial_cargas')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            if (data) {
                alert(`Detalles de carga:\n\n` +
                      `Archivo: ${data.nombre_archivo}\n` +
                      `Tipo: ${data.tipo_datos}\n` +
                      `Registros: ${data.total_registros}\n` +
                      `Fecha: ${formatDate(data.fecha_carga)}\n` +
                      `Año: ${data.ano}\n` +
                      `Semestre: ${data.semestre}\n` +
                      `Estado: ${data.estado}\n` +
                      `Usuario: ${data.usuario}`);
            }
        } catch (error) {
            console.error('Error obteniendo detalles:', error);
        }
    }
    
    // Descargar plantilla Excel
    function downloadTemplate() {
        const tipoDatos = document.getElementById('tipoDatos').value;
        
        if (!tipoDatos) {
            showNotification('Seleccione el tipo de datos primero', 'warning');
            return;
        }
        
        // Definir plantillas según tipo de datos
        const templates = {
            'matematicas': [
                ['EstudianteID', 'RUT', 'Nombre', 'Curso', 'Nivel', 'Puntaje', 'FechaEvaluacion', 'Observaciones'],
                ['EST001', '12345678-9', 'Juan Pérez', 'A', '1° Medio', 85, '2024-03-15', ''],
                ['EST002', '98765432-1', 'María González', 'B', '2° Medio', 92, '2024-03-15', 'Excelente desempeño']
            ],
            'lenguaje': [
                ['EstudianteID', 'RUT', 'Nombre', 'Curso', 'Nivel', 'ComprensionLectora', 'ProduccionEscrita', 'Promedio', 'Fecha'],
                ['EST001', '12345678-9', 'Juan Pérez', 'A', '1° Medio', 88, 82, 85, '2024-03-15'],
                ['EST002', '98765432-1', 'María González', 'B', '2° Medio', 95, 89, 92, '2024-03-15']
            ],
            'estudiantes': [
                ['RUT', 'Nombre', 'Apellido', 'FechaNacimiento', 'Genero', 'Institucion', 'Nivel', 'Curso', 'Email'],
                ['12345678-9', 'Juan', 'Pérez', '2008-05-15', 'M', 'Inst. Superior de Comercio', '1° Medio', 'A', 'juan@email.com'],
                ['98765432-1', 'María', 'González', '2007-08-22', 'F', 'Liceo Comercial Luis Correa', '2° Medio', 'B', 'maria@email.com']
            ]
        };
        
        const templateData = templates[tipoDatos] || templates['matematicas'];
        
        // Crear workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(templateData);
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
        
        // Descargar archivo
        XLSX.writeFile(wb, `plantilla_${tipoDatos}_comeduc.xlsx`);
        
        showNotification('Plantilla descargada correctamente', 'success');
    }
    
    // Limpiar archivo
    function clearFile() {
        currentFile = null;
        parsedData = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('fileInfo').textContent = 'Formato soportado: .xlsx, .xls, .csv (Max. 10MB)';
        document.getElementById('processFile').disabled = true;
        document.getElementById('uploadToDB').disabled = true;
        document.getElementById('previewHeaders').innerHTML = '';
        document.getElementById('previewBody').innerHTML = '';
        document.getElementById('uploadStats').innerHTML = 
            '<p><i class="fas fa-info-circle"></i> Seleccione un archivo Excel para previsualizar los datos.</p>';
    }
    
    // Funciones auxiliares
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function showNotification(message, type = 'info') {
        // Usar la función de notificación de common.js si existe
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            // Notificación básica si common.js no está disponible
            alert(message);
        }
    }
});