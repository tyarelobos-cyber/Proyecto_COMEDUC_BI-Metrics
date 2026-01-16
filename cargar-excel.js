// cargar-excel.js - Funcionalidad para cargar archivos Excel a Supabase

document.addEventListener('DOMContentLoaded', async function() {
    // Configuración de Supabase
    const supabaseUrl = 'https://oxcvsiigbaezifoniqbz.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Y3ZzaWlnYmFlemlmb25pcWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTA0NTQsImV4cCI6MjA4MjcyNjQ1NH0.OYeRSNpuDy9HgZNoDZS5D6hlOP4EylPHPlTVdNrV5wI';
    
    // Inicializar Supabase
    let supabase;
    try {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        
        // Verificar conexión
        const { data, error } = await supabase.from('historial_cargas').select('count').limit(1);
        if (error) {
            console.log('Conectando a Supabase... (tablas pueden no existir aún)');
        } else {
            console.log('Conexión a Supabase establecida');
        }
    } catch (error) {
        console.error('Error inicializando Supabase:', error);
        showNotification('Error de conexión con la base de datos', 'error');
        return;
    }
    
    // Variables globales
    let currentFile = null;
    let parsedData = null;
    
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
        uploadBtn.addEventListener('click', () => uploadToDatabase(supabase));
        
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
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
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
        document.getElementById('fileInfo').innerHTML = 
            `<i class="fas fa-file-excel"></i> Archivo seleccionado: <strong>${file.name}</strong> (${formatBytes(file.size)})`;
        
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
            
            showNotification(`Archivo procesado: ${data.totalRows} registros encontrados`, 'success');
            
        } catch (error) {
            console.error('Error procesando archivo:', error);
            showNotification('Error al procesar el archivo: ' + error.message, 'error');
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
                    const firstSheetName = workbook.SheetNames[0];
                    const firstSheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    
                    if (jsonData.length < 2) {
                        reject(new Error('El archivo está vacío o no tiene datos'));
                        return;
                    }
                    
                    // Convertir a formato estructurado
                    const headers = jsonData[0].map(h => h ? h.toString().trim() : `col${index}`);
                    const rows = jsonData.slice(1);
                    
                    const structuredData = rows
                        .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
                        .map(row => {
                            const obj = {};
                            headers.forEach((header, index) => {
                                let value = row[index];
                                // Convertir fechas
                                if (value instanceof Date) {
                                    value = value.toISOString().split('T')[0];
                                }
                                obj[header] = value || null;
                            });
                            return obj;
                        });
                    
                    resolve({
                        headers: headers,
                        data: structuredData,
                        totalRows: structuredData.length,
                        sheetName: firstSheetName
                    });
                    
                } catch (error) {
                    reject(new Error('Error al leer el archivo Excel: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
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
            th.title = header;
            headersRow.appendChild(th);
        });
        
        // Mostrar primeras 10 filas
        const previewRows = data.data.slice(0, 10);
        previewRows.forEach(row => {
            const tr = document.createElement('tr');
            
            data.headers.forEach(header => {
                const td = document.createElement('td');
                const value = row[header];
                td.textContent = value !== null && value !== undefined ? value.toString() : '';
                td.title = value !== null && value !== undefined ? value.toString() : '';
                tr.appendChild(td);
            });
            
            previewBody.appendChild(tr);
        });
        
        // Mostrar estadísticas
        statsDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <i class="fas fa-info-circle"></i> 
                    <strong>${data.totalRows} registros</strong> encontrados en "${data.sheetName}"
                </div>
                <div>
                    <span style="background-color: #E8F5E9; color: #2E7D32; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem;">
                        <i class="fas fa-check-circle"></i> ${data.headers.length} columnas
                    </span>
                </div>
            </div>
        `;
        
        // Si hay más de 10 filas, mostrar nota
        if (data.totalRows > 10) {
            const noteRow = document.createElement('tr');
            const noteCell = document.createElement('td');
            noteCell.colSpan = data.headers.length;
            noteCell.style.textAlign = 'center';
            noteCell.style.fontStyle = 'italic';
            noteCell.style.color = '#666';
            noteCell.textContent = `... y ${data.totalRows - 10} filas más`;
            noteRow.appendChild(noteCell);
            previewBody.appendChild(noteRow);
        }
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
        
        showNotification('Validando datos...', 'info');
        
        // Validaciones básicas
        let errorCount = 0;
        let warningCount = 0;
        const validationMessages = [];
        
        parsedData.data.forEach((row, index) => {
            // Verificar filas vacías
            const isEmpty = Object.values(row).every(val => val === null || val === '' || val === undefined);
            if (isEmpty) {
                warningCount++;
                validationMessages.push(`Fila ${index + 2}: Fila vacía o sin datos`);
            }
            
            // Validaciones específicas por tipo
            if (tipoDatos === 'matematicas' || tipoDatos === 'lenguaje') {
                if (row.Puntaje !== undefined && row.Puntaje !== null) {
                    const puntaje = parseFloat(row.Puntaje);
                    if (isNaN(puntaje) || puntaje < 0 || puntaje > 100) {
                        errorCount++;
                        validationMessages.push(`Fila ${index + 2}: Puntaje inválido "${row.Puntaje}"`);
                    }
                }
            }
        });
        
        // Mostrar resultados
        const statsDiv = document.getElementById('uploadStats');
        statsDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <i class="fas fa-chart-bar"></i> 
                    <strong>${parsedData.totalRows} registros</strong> validados
                </div>
                <div style="display: flex; gap: 10px;">
                    ${errorCount > 0 ? 
                        `<span style="background-color: #FFEBEE; color: #C62828; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem;">
                            <i class="fas fa-exclamation-circle"></i> ${errorCount} errores
                        </span>` : 
                        `<span style="background-color: #E8F5E9; color: #2E7D32; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem;">
                            <i class="fas fa-check-circle"></i> Sin errores
                        </span>`
                    }
                    ${warningCount > 0 ? 
                        `<span style="background-color: #FFF3E0; color: #EF6C00; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem;">
                            <i class="fas fa-exclamation-triangle"></i> ${warningCount} advertencias
                        </span>` : ''}
                </div>
            </div>
        `;
        
        if (errorCount === 0 && warningCount === 0) {
            showNotification('✅ Todos los datos son válidos', 'success');
        } else if (errorCount === 0) {
            showNotification(`⚠️ ${warningCount} advertencias encontradas`, 'warning');
        } else {
            showNotification(`❌ ${errorCount} errores encontrados en la validación`, 'error');
        }
        
        // Mostrar errores en consola
        if (validationMessages.length > 0) {
            console.log('Mensajes de validación:', validationMessages);
        }
    }
    
    // Subir datos a Supabase
    async function uploadToDatabase(supabaseClient) {
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
                ano: parseInt(ano) || null,
                semestre: semestre,
                nivel: nivel === 'all' ? null : nivel,
                fecha_carga: new Date().toISOString(),
                usuario: localStorage.getItem('comeduc_logged_email') || 'usuario_desconocido'
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
                case 'evaluaciones':
                    tableName = 'evaluaciones_generales';
                    break;
                default:
                    // Si no hay tabla específica, usar tabla genérica
                    tableName = 'evaluaciones_generales';
                    dataToUpload.forEach(item => {
                        item.datos = JSON.stringify(item);
                    });
            }
            
            console.log(`Intentando subir a tabla: ${tableName}`);
            console.log(`Datos a subir:`, dataToUpload.slice(0, 2)); // Mostrar solo primeros 2 para debug
            
            // Insertar datos en Supabase en lotes para evitar timeout
            const batchSize = 50;
            let successfulInserts = 0;
            let totalInserts = dataToUpload.length;
            
            for (let i = 0; i < dataToUpload.length; i += batchSize) {
                const batch = dataToUpload.slice(i, i + batchSize);
                
                const { data, error } = await supabaseClient
                    .from(tableName)
                    .insert(batch);
                
                if (error) {
                    console.error('Error en lote:', error);
                    throw error;
                }
                
                successfulInserts += batch.length;
                
                // Actualizar progreso
                const progress = Math.round((successfulInserts / totalInserts) * 100);
                showNotification(`Subiendo datos... ${progress}% completado`, 'info');
            }
            
            // Guardar registro en historial
            await saveUploadHistory(supabaseClient, {
                nombre_archivo: currentFile.name,
                tipo_datos: tipoDatos,
                total_registros: successfulInserts,
                ano: parseInt(ano) || null,
                semestre: semestre,
                estado: 'completado',
                usuario: localStorage.getItem('comeduc_logged_email') || 'usuario_desconocido'
            });
            
            // Actualizar historial
            loadUploadHistory();
            
            showNotification(`✅ ${successfulInserts} registros subidos correctamente a ${tableName}`, 'success');
            
            // Limpiar después de subir
            setTimeout(() => {
                clearFile();
                showNotification('✅ Carga completada. Los datos están disponibles en el dashboard.', 'success');
            }, 3000);
            
        } catch (error) {
            console.error('Error subiendo a la base de datos:', error);
            
            // Mensaje de error más específico
            let errorMessage = 'Error al subir datos: ';
            
            if (error.message.includes('Could not find the table')) {
                errorMessage += `La tabla "${tableName}" no existe en la base de datos. Por favor, créala primero en Supabase.`;
            } else if (error.message.includes('permission denied')) {
                errorMessage += 'Permiso denegado. Verifica las políticas RLS en Supabase.';
            } else if (error.message.includes('Network Error')) {
                errorMessage += 'Error de red. Verifica tu conexión a internet.';
            } else {
                errorMessage += error.message;
            }
            
            showNotification(errorMessage, 'error');
            
            // Intentar guardar en tabla genérica si falla
            if (tableName !== 'evaluaciones_generales') {
                showNotification('Intentando guardar en tabla genérica...', 'warning');
                try {
                    await saveToGenericTable(supabaseClient, parsedData.data, tipoDatos, ano, semestre);
                } catch (genericError) {
                    console.error('Error también en tabla genérica:', genericError);
                }
            }
        }
    }
    
    // Guardar en tabla genérica como fallback
    async function saveToGenericTable(supabaseClient, data, tipoDatos, ano, semestre) {
        const genericData = {
            datos: JSON.stringify(data),
            tipo_datos: tipoDatos,
            ano: parseInt(ano) || null,
            semestre: semestre,
            fecha_carga: new Date().toISOString(),
            usuario: localStorage.getItem('comeduc_logged_email') || 'usuario_desconocido'
        };
        
        const { error } = await supabaseClient
            .from('evaluaciones_generales')
            .insert([genericData]);
        
        if (error) throw error;
        
        showNotification('✅ Datos guardados en tabla genérica como respaldo', 'success');
    }
    
    // Guardar historial de carga
    async function saveUploadHistory(supabaseClient, uploadData) {
        try {
            const { data, error } = await supabaseClient
                .from('historial_cargas')
                .insert([{
                    ...uploadData,
                    fecha_carga: new Date().toISOString(),
                    detalles: {
                        columnas: parsedData ? parsedData.headers.length : 0,
                        filas_procesadas: uploadData.total_registros
                    }
                }]);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error guardando historial:', error);
            // No lanzar error para no interrumpir el flujo principal
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
            
            if (error) {
                // Si la tabla no existe, mostrar mensaje
                if (error.message.includes('Could not find the table')) {
                    console.log('Tabla historial_cargas no existe aún');
                    showInitialHistoryMessage();
                    return;
                }
                throw error;
            }
            
            const historyBody = document.getElementById('historyBody');
            historyBody.innerHTML = '';
            
            if (data && data.length > 0) {
                data.forEach(item => {
                    const tr = document.createElement('tr');
                    
                    tr.innerHTML = `
                        <td>${formatDate(item.fecha_carga)}</td>
                        <td><strong>${item.nombre_archivo}</strong></td>
                        <td><span class="badge">${item.tipo_datos}</span></td>
                        <td>${item.total_registros}</td>
                        <td><span class="status-badge ${item.estado}">${item.estado}</span></td>
                        <td>${item.usuario ? item.usuario.split('@')[0] : 'N/A'}</td>
                        <td>
                            <button class="action-btn view-history" data-id="${item.id}">
                                <i class="fas fa-eye"></i> Detalles
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
                showInitialHistoryMessage();
            }
            
        } catch (error) {
            console.error('Error cargando historial:', error);
            showInitialHistoryMessage();
        }
    }
    
    function showInitialHistoryMessage() {
        const historyBody = document.getElementById('historyBody');
        historyBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    <p style="margin-bottom: 10px;">No hay historial de cargas aún</p>
                    <small>Sube tu primer archivo Excel para comenzar</small>
                </td>
            </tr>
        `;
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
                const details = `
Detalles de la carga:
────────────────────
📄 Archivo: ${data.nombre_archivo}
📊 Tipo: ${data.tipo_datos}
📈 Registros: ${data.total_registros}
📅 Fecha: ${formatDate(data.fecha_carga)}
🎯 Año: ${data.ano || 'N/A'}
📚 Semestre: ${data.semestre}
✅ Estado: ${data.estado}
👤 Usuario: ${data.usuario}
                `;
                
                alert(details);
            }
        } catch (error) {
            console.error('Error obteniendo detalles:', error);
            showNotification('Error al cargar los detalles', 'error');
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
                ['EST001', '12345678-9', 'Juan Pérez', 'A', '1° Medio', 85.5, '2024-03-15', 'Buen desempeño'],
                ['EST002', '98765432-1', 'María González', 'B', '2° Medio', 92.0, '2024-03-15', 'Excelente desempeño']
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
            ],
            'instituciones': [
                ['Nombre', 'Region', 'Comuna', 'Direccion', 'Telefono', 'Email', 'Director'],
                ['Inst. Superior de Comercio Bicentenario', 'Metropolitana', 'Santiago', 'Av. Principal 123', '+56 2 2345 6789', 'contacto@insuco.cl', 'Juan Director']
            ]
        };
        
        const templateData = templates[tipoDatos] || templates['matematicas'];
        
        // Crear workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(templateData);
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');
        
        // Ajustar anchos de columnas
        const colWidths = templateData[0].map(() => ({ wch: 20 }));
        ws['!cols'] = colWidths;
        
        // Descargar archivo
        XLSX.writeFile(wb, `plantilla_${tipoDatos}_comeduc.xlsx`);
        
        showNotification(`Plantilla "${tipoDatos}" descargada correctamente`, 'success');
    }
    
    // Limpiar archivo
    function clearFile() {
        currentFile = null;
        parsedData = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('fileInfo').innerHTML = 
            '<i class="fas fa-file-excel"></i> Formato soportado: .xlsx, .xls, .csv (Max. 10MB)';
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
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }
    
    function showNotification(message, type = 'info') {
        // Usar la función de notificación de common.js si existe
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            // Notificación básica si common.js no está disponible
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 6px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                background-color: ${type === 'success' ? '#4CAF50' : 
                                 type === 'error' ? '#F44336' : 
                                 type === 'warning' ? '#FF9800' : '#2196F3'};
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        }
    }
    
    // Agregar estilos CSS dinámicamente
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .badge {
            padding: 4px 10px;
            background-color: #E3F2FD;
            color: #1565C0;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        .status-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        .status-badge.completado {
            background-color: #E8F5E9;
            color: #2E7D32;
        }
        .status-badge.pendiente {
            background-color: #FFF3E0;
            color: #EF6C00;
        }
        .status-badge.error {
            background-color: #FFEBEE;
            color: #C62828;
        }
        .upload-area {
            border: 2px dashed #DEE2E6;
            border-radius: 8px;
            padding: 60px 30px;
            text-align: center;
            margin: 20px 30px;
            background-color: #F8F9FA;
            transition: all 0.3s;
            cursor: pointer;
        }
        .upload-area:hover {
            border-color: #00447A;
            background-color: #F2F3F5;
        }
        .upload-area.dragover {
            border-color: #83B81A;
            background-color: #E8F5E9;
        }
    `;
    document.head.appendChild(style);
});