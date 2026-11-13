function precargarDatosAdmin(areasSeleccionadas = [], cargosSeleccionados = []) {
    precargarAreasUnicas(areasSeleccionadas);
    precargarCargosUnicos(cargosSeleccionados);
    cargarListaCapacitacionesParaModificar();
}

function precargarAreasUnicas(areasSeleccionadas = []) {
    const contenedor = document.getElementById('contenedorCheckboxesAreas');
    if(!contenedor) return;
    contenedor.innerHTML = `<span class="text-muted small"><i class="fas fa-spinner fa-spin me-1"></i> Cargando áreas...</span>`;

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'obtenerAreasUnicas' })
    })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            areasUnicasGlobal = res.areas;
            renderizarCheckboxesAreas(areasSeleccionadas);
        } else {
            contenedor.innerHTML = `<span class="text-danger small">Error al cargar áreas.</span>`;
        }
    })
    .catch(err => contenedor.innerHTML = `<span class="text-danger small">Error de red</span>`);
}

function precargarCargosUnicos(cargosSeleccionados = []) {
    const contenedor = document.getElementById('contenedorCheckboxesCargos');
    if(!contenedor) return;
    contenedor.innerHTML = `<span class="text-muted small"><i class="fas fa-spinner fa-spin me-1"></i> Cargando cargos...</span>`;

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'obtenerCargosUnicos' })
    })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            cargosUnicosGlobal = res.cargos;
            renderizarCheckboxesCargos(cargosSeleccionados);
        } else {
            contenedor.innerHTML = `<span class="text-danger small">Error al cargar cargos.</span>`;
        }
    })
    .catch(err => contenedor.innerHTML = `<span class="text-danger small">Error de red</span>`);
}

function renderizarCheckboxesAreas(seleccionadas = []) {
    const contenedor = document.getElementById('contenedorCheckboxesAreas');
    if(!contenedor) return;
    contenedor.innerHTML = "";
    if (!areasUnicasGlobal || areasUnicasGlobal.length === 0) {
        contenedor.innerHTML = `<span class="text-muted small">No hay áreas registradas.</span>`;
        return;
    }
    let seleccionadasSet = new Set(seleccionadas.map(a => String(a).trim().toUpperCase()));
    areasUnicasGlobal.forEach((area, idx) => {
        let estaChecked = seleccionadasSet.has(String(area).trim().toUpperCase()) ? 'checked' : '';
        contenedor.innerHTML += `
            <div class="form-check mb-1">
                <input class="form-check-input check-area-cap" type="checkbox" value="${area}" id="check_area_${idx}" ${estaChecked}>
                <label class="form-check-label text-dark small fw-semibold" for="check_area_${idx}">${area}</label>
            </div>
        `;
    });
}

function renderizarCheckboxesCargos(seleccionados = []) {
    const contenedor = document.getElementById('contenedorCheckboxesCargos');
    if(!contenedor) return;
    contenedor.innerHTML = "";
    if (!cargosUnicosGlobal || cargosUnicosGlobal.length === 0) {
        contenedor.innerHTML = `<span class="text-muted small">No hay cargos registrados.</span>`;
        return;
    }
    let seleccionadosSet = new Set(seleccionados.map(c => String(c).trim().toUpperCase()));
    cargosUnicosGlobal.forEach((cargo, idx) => {
        let estaChecked = seleccionadosSet.has(String(cargo).trim().toUpperCase()) ? 'checked' : '';
        contenedor.innerHTML += `
            <div class="form-check mb-1">
                <input class="form-check-input check-cargo-cap" type="checkbox" value="${cargo}" id="check_cargo_${idx}" ${estaChecked}>
                <label class="form-check-label text-dark small fw-semibold" for="check_cargo_${idx}">${cargo}</label>
            </div>
        `;
    });
}

function verificarUsuarioExiste() {
    const ident = document.getElementById('uIdentificacion').value.trim();
    const lblEstado = document.getElementById('mensajeEstadoUsuario');
    if (!ident) { lblEstado.textContent = ""; return; }

    lblEstado.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Verificando...`;

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'buscarUsuarioPorIdentificacion', identificacion: ident })
    })
    .then(res => res.json())
    .then(res => {
        if (res.success && res.encontrado) {
            const u = res.usuario;
            lblEstado.innerHTML = `<span class="text-success"><i class="fas fa-check-circle"></i> Usuario existente. Datos cargados.</span>`;
            document.getElementById('uFechaExpedicion').value = u.fechaExpedicionInput || "";
            document.getElementById('uNombre').value = u.nombre || "";
            document.getElementById('uCargo').value = u.cargo || "";
            document.getElementById('uArea').value = u.area || "";
            document.getElementById('uEstado').value = u.estado || "ACTIVO";
            document.getElementById('uAdmin').value = u.admin || "";
            document.getElementById('uModificacion').value = u.modificacion || "";
        } else {
            lblEstado.innerHTML = `<span class="text-primary"><i class="fas fa-plus-circle"></i> Cédula nueva. Ingrese los datos para registrar.</span>`;
        }
    })
    .catch(err => lblEstado.textContent = "");
}

document.getElementById('formCrearUsuario').addEventListener('submit', function(e) {
    e.preventDefault();
    const dataUsuario = {
        identificacion: document.getElementById('uIdentificacion').value.trim(),
        fechaExpedicion: document.getElementById('uFechaExpedicion').value,
        nombre: document.getElementById('uNombre').value.trim(),
        cargo: document.getElementById('uCargo').value.trim(),
        area: document.getElementById('uArea').value.trim(),
        estado: document.getElementById('uEstado').value,
        admin: document.getElementById('uAdmin').value,
        modificacion: document.getElementById('uModificacion').value
    };

    const btn = document.getElementById('btnGuardarUsuario');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Guardando...';

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'crearOActualizarUsuario', data: dataUsuario })
    })
    .then(res => res.json())
    .then(res => {
        if (res.success) {
            alert('¡Usuario guardado o actualizado exitosamente!');
            document.getElementById('formCrearUsuario').reset();
            document.getElementById('mensajeEstadoUsuario').textContent = "";
            precargarAreasUnicas();
            precargarCargosUnicos();
        } else {
            alert('Error: ' + res.error);
        }
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-check me-2"></i> Guardar / Actualizar Usuario';
    })
    .catch(err => {
        alert('Error de red: ' + err);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-check me-2"></i> Guardar / Actualizar Usuario';
    });
});

function cambiarVistaUsuario() {
    document.getElementById('cardPanelAdmin').classList.add('d-none');
    document.getElementById('cardPanelUsuario').classList.remove('d-none');
    cargarCapacitacionesParaUsuario();
}

function regresarAlAdmin() {
    document.getElementById('cardPanelUsuario').classList.add('d-none');
    document.getElementById('cardPanelAdmin').classList.remove('d-none');
}

function cerrarSesion() {
    cacheCapacitacionesUsuario = null;
    listaCapacitacionesGlobal = [];
    datosReporteGlobal = [];
    document.getElementById('formLogin').reset();
    document.getElementById('resultadoLogin').innerHTML = "";
    document.getElementById('cardLogin').classList.remove('d-none');
    document.getElementById('cardPanelAdmin').classList.add('d-none');
    document.getElementById('cardPanelUsuario').classList.add('d-none');
}

function cargarListaCapacitacionesParaModificar() {
    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'obtenerCapacitaciones' })
    })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            listaCapacitacionesGlobal = res.capacitaciones;
            poblarSelectModificacion(listaCapacitacionesGlobal);
            poblarSelectsCapacitacionPreguntas(listaCapacitacionesGlobal);
        }
    })
    .catch(err => console.error("Error al cargar listado:", err));
}

function poblarSelectModificacion(capacitaciones) {
    const select = document.getElementById('selectCapacitacionMod');
    if(!select) return;
    select.innerHTML = '<option value="">-- Crear una nueva capacitación --</option>';
    capacitaciones.forEach(cap => {
        let opt = document.createElement('option');
        opt.value = cap.id;
        opt.textContent = `[${cap.codigo}] ${cap.nombre} (${cap.categoria})`;
        select.appendChild(opt);
    });
}

function poblarSelectsCapacitacionPreguntas(capacitaciones) {
    const selectManual = document.getElementById('mCapacitacionNombre');
    const selectMasivo = document.getElementById('excelCapAnidada');

    if (selectManual) {
        selectManual.innerHTML = '<option value="">-- Seleccione Capacitación --</option>';
        capacitaciones.forEach(cap => {
            let opt = document.createElement('option');
            opt.value = cap.nombre;
            opt.textContent = `${cap.nombre} (${cap.categoria})`;
            selectManual.appendChild(opt);
        });
    }

    if (selectMasivo) {
        selectMasivo.innerHTML = '<option value="">-- Seleccione la capacitación correspondiente --</option>';
        capacitaciones.forEach(cap => {
            let opt = document.createElement('option');
            opt.value = cap.nombre;
            opt.textContent = `${cap.nombre} (${cap.categoria})`;
            selectMasivo.appendChild(opt);
        });
    }
}

function cargarDatosCapacitacionSeleccionada() {
    const idSeleccionado = document.getElementById('selectCapacitacionMod').value;
    const editIdInput = document.getElementById('editCapId');
    const tituloAccion = document.getElementById('tituloFormAccion');
    const btnAccion = document.getElementById('btnAccionForm');

    if (!idSeleccionado) {
        editIdInput.value = "";
        tituloAccion.textContent = "Información General de la Capacitación";
        btnAccion.innerHTML = '<i class="fas fa-save me-2"></i> Guardar Capacitación y Examen';
        document.getElementById('formCapacitacion').reset();
        document.getElementById('catCap').value = "Capacitación";
        document.getElementById('notaMin').value = 70;
        document.getElementById('intentosPermitidos').value = "1";
        document.getElementById('generaCertificado').value = "SI";
        document.getElementById('cantPregExamen').value = "10";
        document.getElementById('valorPorcentual').value = "10.00% por cada acierto";
        document.getElementById('ytUrl').value = "";
        document.getElementById('pdfUrl').value = "";
        precargarAreasUnicas([]);
        precargarCargosUnicos([]);
        return;
    }

    const capEncontrada = listaCapacitacionesGlobal.find(c => String(c.id).trim() === String(idSeleccionado).trim());
    if (capEncontrada) {
        editIdInput.value = capEncontrada.id;
        tituloAccion.textContent = `Modificando Capacitación: ${capEncontrada.nombre}`;
        btnAccion.innerHTML = '<i class="fas fa-sync-alt me-2"></i> Actualizar Capacitación y Examen';

        document.getElementById('nombreCap').value = capEncontrada.nombre;
        document.getElementById('codigoCap').value = capEncontrada.codigo;
        document.getElementById('catCap').value = capEncontrada.categoria || "Capacitación";
        document.getElementById('respCap').value = capEncontrada.responsable;
        document.getElementById('descCap').value = capEncontrada.descripcion;
        document.getElementById('durCap').value = capEncontrada.duracion;
        document.getElementById('notaMin').value = capEncontrada.notaMinima;
        document.getElementById('intentosPermitidos').value = capEncontrada.intentosPermitidos;
        document.getElementById('generaCertificado').value = capEncontrada.generaCertificado || 'SI';
        document.getElementById('cantPregExamen').value = capEncontrada.cantidadPreguntasExamen;
        document.getElementById('ytUrl').value = capEncontrada.videoUrl || capEncontrada.youtubeUrl || '';
        document.getElementById('pdfUrl').value = capEncontrada.pdfUrl || '';

        let cant = parseInt(capEncontrada.cantidadPreguntasExamen) || 1;
        document.getElementById('valorPorcentual').value = (100 / cant).toFixed(2) + "% por cada acierto";

        fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'obtenerAsignacionPorCapacitacion', idCapacitacion: capEncontrada.id })
        })
        .then(res => res.json())
        .then(res => {
            precargarAreasUnicas(res.success ? res.areasAsignadas : []);
            precargarCargosUnicos(res.success ? res.cargosAsignados : []);
        });
    }
}

document.getElementById('formCapacitacion').addEventListener('submit', function(e) {
    e.preventDefault();
    const idEdicion = document.getElementById('editCapId').value;
    
    let areasSeleccionadas = [];
    document.querySelectorAll('.check-area-cap:checked').forEach(cb => areasSeleccionadas.push(cb.value));

    let cargosSeleccionados = [];
    document.querySelectorAll('.check-cargo-cap:checked').forEach(cb => cargosSeleccionados.push(cb.value));

    const data = {
        id: idEdicion,
        nombre: document.getElementById('nombreCap').value,
        codigo: document.getElementById('codigoCap').value,
        categoria: document.getElementById('catCap').value,
        responsable: document.getElementById('respCap').value,
        descripcion: document.getElementById('descCap').value,
        duracion: document.getElementById('durCap').value,
        notaMinima: document.getElementById('notaMin').value,
        intentosPermitidos: document.getElementById('intentosPermitidos').value,
        generaCertificado: document.getElementById('generaCertificado').value,
        cantidadPreguntasExamen: document.getElementById('cantPregExamen').value,
        youtubeUrl: document.getElementById('ytUrl').value,
        pdfUrl: document.getElementById('pdfUrl').value,
        areas: areasSeleccionadas,
        cargos: cargosSeleccionados,
        estado: 'Activa'
    };

    const btn = document.getElementById('btnAccionForm');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Procesando...';

    const accionEnvio = idEdicion ? 'actualizarCapacitacion' : 'crearCapacitacionConMaterial';

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: accionEnvio, data: data })
    })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            cacheCapacitacionesUsuario = null;
            listaCapacitacionesGlobal = [];
            alert(idEdicion ? '¡Capacitación actualizada exitosamente!' : '¡Capacitación creada exitosamente!');
            if(!idEdicion) {
                document.getElementById('formCapacitacion').reset();
                precargarAreasUnicas([]);
                precargarCargosUnicos([]);
            }
            if (usuarioPuedeModificar) cargarListaCapacitacionesParaModificar();
        } else {
            alert('Error: ' + res.error);
        }
        btn.disabled = false;
        btn.innerHTML = idEdicion ? '<i class="fas fa-sync-alt me-2"></i> Actualizar Capacitación y Examen' : '<i class="fas fa-save me-2"></i> Guardar Capacitación y Examen';
    })
    .catch(err => {
        alert('Error de red: ' + err);
        btn.disabled = false;
    });
});

async function procesarExcelPorLotes() {
    const fileInput = document.getElementById('excelFile');
    const salida = document.getElementById('resultadoSalida');
    const capAnidadaNombre = document.getElementById('excelCapAnidada').value;
    
    if(!capAnidadaNombre) { alert('Seleccione la Capacitación a la cual anidar.'); return; }
    if(fileInput.files.length === 0) { alert('Seleccione un archivo Excel.'); return; }

    const btn = document.getElementById('btnProcesar');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Leyendo...';

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonRows = XLSX.utils.sheet_to_json(worksheet);

            if(jsonRows.length === 0) {
                salida.innerHTML = `<div class="alert alert-danger">El archivo está vacío.</div>`;
                restaurarBtn(btn);
                return;
            }

            salida.innerHTML = `<div class="alert alert-info"><i class="fas fa-spinner fa-spin me-2"></i> Procesando preguntas...</div>`;

            let listaPreguntasLote = [];
            jsonRows.forEach(row => {
                let cleanRow = {};
                Object.keys(row).forEach(key => cleanRow[key.replace(/[\u00A0\s]+/g, '').toLowerCase()] = row[key]);

                let pregTexto = cleanRow['pregunta'] || '';
                let respCorrecta = cleanRow['respuestacorrecta'] || cleanRow['respuesta_correcta'] || '';
                let opcionesRaw = cleanRow['opcionesjson'] || cleanRow['opciones_json'] || '';
                let opcionesArr = [];

                if (typeof opcionesRaw === 'string') {
                    opcionesArr = opcionesRaw.includes('||') ? opcionesRaw.split('||').map(o => o.trim()) : (opcionesRaw.includes(';') ? opcionesRaw.split(';').map(o => o.trim()) : opcionesRaw.split(',').map(o => o.trim()));
                } else if (Array.isArray(opcionesRaw)) {
                    opcionesArr = opcionesRaw;
                }

                if (!pregTexto || pregTexto.toString().trim() === '') return;

                listaPreguntasLote.push({
                    pregunta: pregTexto.toString().trim(),
                    tipo: (cleanRow['tipo'] || 'Unica').toString().trim(),
                    opciones: opcionesArr,
                    respuestaCorrecta: respCorrecta.toString().trim(),
                    puntaje: parseInt(cleanRow['puntaje']) || 5,
                    categoria: (cleanRow['categoria'] || 'Capacitación').toString().trim(),
                    dificultad: (cleanRow['dificultad'] || 'Media').toString().trim(),
                    nombreCapacitacion: capAnidadaNombre
                });
            });

            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'guardarPreguntasLote', data: listaPreguntasLote })
            });
            const jsonRes = await res.json();

            if(jsonRes.success) {
                salida.innerHTML = `<div class="alert alert-success">¡Carga Exitosa! <strong>${jsonRes.guardadas} preguntas</strong> guardadas.</div>`;
                document.getElementById('excelFile').value = '';
            } else {
                salida.innerHTML = `<div class="alert alert-danger">Error: ${jsonRes.error}</div>`;
            }
        } catch (error) {
            salida.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        }
        restaurarBtn(btn);
    };
    reader.readAsArrayBuffer(file);
}

function restaurarBtn(btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-upload me-2"></i> Procesar y Subir al Banco';
}

document.getElementById('formPreguntaManual').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombreCapSelected = document.getElementById('mCapacitacionNombre').value;
    if(!nombreCapSelected) { alert('Debe seleccionar la capacitación.'); return; }

    const data = {
        pregunta: document.getElementById('mPregunta').value,
        tipo: document.getElementById('mTipo').value,
        opciones: document.getElementById('mOpciones').value.includes('||') ? document.getElementById('mOpciones').value.split('||').map(o => o.trim()) : document.getElementById('mOpciones').value.split(';').map(o => o.trim()),
        respuestaCorrecta: document.getElementById('mRespuesta').value,
        puntaje: parseInt(document.getElementById('mPuntaje').value),
        categoria: document.getElementById('mCategoria').value,
        dificultad: document.getElementById('mDificultad').value,
        nombreCapacitacion: nombreCapSelected
    };

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'crearPreguntaIndividual', data: data })
    })
    .then(res => res.json())
    .then(response => {
        if(response.success) {
            alert('¡Pregunta guardada con éxito!');
            document.getElementById('formPreguntaManual').reset();
        } else {
            alert('Error: ' + response.error);
        }
    })
    .catch(err => alert('Error de red: ' + err));
});

function cargarTablaReportes() {
    const tbody = document.getElementById('tbodyReportes');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="8" class="py-4"><i class="fas fa-spinner fa-spin me-2 text-primary"></i> Cargando...</td></tr>`;

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'obtenerReporteResultados' })
    })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            datosReporteGlobal = res.reporte;
            renderizarTablaReporte(datosReporteGlobal);
        } else {
            tbody.innerHTML = `<tr><td colspan="8" class="text-danger py-4">Error: ${res.error}</td></tr>`;
        }
    })
    .catch(err => tbody.innerHTML = `<tr><td colspan="8" class="text-danger py-4">Error de red</td></tr>`);
}

function renderizarTablaReporte(lista) {
    const tbody = document.getElementById('tbodyReportes');
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-muted py-4">No hay registros.</td></tr>`;
        return;
    }
    lista.forEach(r => {
        let esAprobado = String(r.estado).toLowerCase().includes('aprobado');
        let califTexto = r.calificacion;
        let numC = parseFloat(califTexto);
        if (!isNaN(numC) && numC <= 1) califTexto = Math.round(numC * 100) + '%';

        tbody.innerHTML += `
            <tr>
                <td style="font-size: 11px;" class="align-middle">${r.fecha}</td>
                <td class="fw-bold align-middle">${r.identificacion}</td>
                <td class="text-start align-middle">${r.nombreUsuario}</td>
                <td class="text-start text-muted align-middle" style="font-size: 11px;">${r.cargo} / ${r.area}</td>
                <td class="text-start fw-semibold align-middle">${r.capacitacion}</td>
                <td class="fw-bold align-middle ${esAprobado ? 'text-success' : 'text-danger'}">${califTexto}</td>
                <td class="align-middle">${esAprobado ? '<span class="badge bg-success">Aprobado</span>' : '<span class="badge bg-danger">Reprobado</span>'}</td>
                <td class="text-center align-middle">
                    <button class="btn btn-sm text-white px-3 py-1.5 rounded-pill shadow-sm fw-semibold d-inline-flex align-items-center justify-content-center gap-1.5" onclick="ejecutarReprobacionAdmin('${r.identificacion}', '${r.idCapacitacion}')" title="Exigir reentrenamiento y reprobar" style="background: linear-gradient(135deg, #e63946, #c52233); border: none; font-size: 11px; transition: all 0.2s ease-in-out;">
                        <i class="fas fa-redo-alt text-white"></i> Reprobar / Reentrenar
                    </button>
                </td>
            </tr>
        `;
    });
}

function ejecutarReprobacionAdmin(identificacion, idCapacitacion) {
    if (!confirm("¿Está seguro de reprobar a este funcionario?\n\nEsta acción registrará un intento fallido en la trazabilidad, anulará su aprobación actual y le exigirá obligatoriamente volver a ver el video y presentar el examen.")) {
        return;
    }

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'forzarReprobacionAdmin',
            data: {
                identificacionUsuario: identificacion,
                idCapacitacion: idCapacitacion
            }
        })
    })
    .then(res => res.json())
    .then(res => {
        if (res.success) {
            alert("¡Acción aplicada con éxito! El funcionario ha sido reprobado administrativamente y deberá realizar el reentrenamiento.");
            cargarTablaReportes(); 
        } else {
            alert("Error: " + res.error);
        }
    })
    .catch(err => alert("Error de red: " + err));
}

function filtrarTablaReportes() {
    let busqueda = document.getElementById('inputBuscarReporte').value.toLowerCase();
    let estadoFiltro = document.getElementById('selectFiltroEstado').value.toLowerCase();

    let filtrados = datosReporteGlobal.filter(r => {
        let coincideTexto = (r.nombreUsuario || '').toLowerCase().includes(busqueda) || 
                             (r.identificacion || '').toLowerCase().includes(busqueda) || 
                             (r.capacitacion || '').toLowerCase().includes(busqueda);
        let coincideEstado = estadoFiltro === "" || (r.estado || '').toLowerCase().includes(estadoFiltro);
        return coincideTexto && coincideEstado;
    });
    renderizarTablaReporte(filtrados);
}

function exportarReporteExcel() {
    if (!datosReporteGlobal || datosReporteGlobal.length === 0) { alert('No hay datos.'); return; }
    let datosParaExcel = datosReporteGlobal.map(r => ({
        "ID Registro": r.idRegistro, "Fecha": r.fecha, "Identificación": r.identificacion,
        "Funcionario": r.nombreUsuario, "Cargo": r.cargo, "Área": r.area,
        "Capacitación": r.capacitacion, "Calificación": r.calificacion, "Estado": r.estado
    }));
    const ws = XLSX.utils.json_to_sheet(datosParaExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte_Evaluaciones");
    XLSX.writeFile(wb, `Reporte_Capacitaciones_${new Date().toISOString().slice(0,10)}.xlsx`);
}
